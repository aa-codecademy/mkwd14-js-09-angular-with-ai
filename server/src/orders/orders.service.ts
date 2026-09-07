import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

export const DEFAULT_ORDER_PAGE_SIZE = 20;

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(userId: number, dto: CreateOrderDto): Promise<Order> {
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.productsRepository.findBy({
      id: In(productIds),
    });

    const items: OrderItem[] = [];
    let total = 0;

    for (const line of dto.items) {
      const product = products.find((p) => p.id === line.productId);
      if (!product)
        throw new NotFoundException(`Product ${line.productId} not found`);
      if (product.stock < line.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}"`,
        );
      }

      const price = product.price * (1 - product.discountPercent / 100);
      total += price * line.quantity;

      const item = this.orderItemsRepository.create({
        productId: product.id,
        quantity: line.quantity,
        price,
      });
      items.push(item);

      product.stock -= line.quantity;
    }

    await this.productsRepository.save(products);

    const address = dto.shippingAddress;
    const order = this.ordersRepository.create({
      userId,
      items,
      total,
      shippingFirstName: address.firstName,
      shippingLastName: address.lastName,
      shippingStreet: address.street,
      shippingCity: address.city,
      shippingPostalCode: address.postalCode,
      shippingCountry: address.country,
      shippingPhone: address.phone ?? null,
    });
    return this.ordersRepository.save(order);
  }

  async findAllForUser(userId: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Every order in the system — admin only, paginated and sortable. */
  async findAllForAdmin(query: QueryOrdersDto): Promise<PaginatedOrders> {
    const qb = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product');

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    const sortDir = (query.sortDir ?? 'desc').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(`order.${query.sortBy ?? 'createdAt'}`, sortDir);

    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_ORDER_PAGE_SIZE;

    // The joined items would make take/skip count rows, not orders, so count
    // the orders separately and page the parent entity.
    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  /**
   * Admin approve/decline. Cancelling puts the reserved stock back, but only on
   * the first transition into CANCELLED so a repeated call can't inflate it.
   */
  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      const products = await this.productsRepository.findBy({
        id: In(order.items.map((item) => item.productId)),
      });
      for (const item of order.items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) product.stock += item.quantity;
      }
      await this.productsRepository.save(products);
    }

    order.status = status;
    return this.ordersRepository.save(order);
  }

  async findOne(
    userId: number,
    id: number,
    role: JwtPayload['role'],
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    if (order.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('You do not have access to this order');
    }
    return order;
  }
}
