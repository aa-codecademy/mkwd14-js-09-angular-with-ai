import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

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
