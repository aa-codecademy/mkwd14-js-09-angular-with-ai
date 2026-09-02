import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

export const DEFAULT_PAGE_SIZE = 12;
const POSTGRES_UNIQUE_VIOLATION = '23505';

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(
    query: QueryProductsDto,
  ): Promise<Product[] | PaginatedProducts> {
    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (query.featured !== undefined) {
      qb.andWhere('product.featured = :featured', { featured: query.featured });
    }
    if (query.categoryId !== undefined) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.search) {
      qb.andWhere('LOWER(product.name) LIKE :search', {
        search: `%${query.search.toLowerCase()}%`,
      });
    }

    const sortDir = (query.sortDir ?? 'asc').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(`product.${query.sortBy ?? 'id'}`, sortDir);

    // Without an explicit page/limit the caller wants the whole (filtered) list.
    if (query.page === undefined && query.limit === undefined) {
      return qb.getMany();
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_PAGE_SIZE;
    qb.skip((page - 1) * limit).take(limit);

    // getManyAndCount() counts the filtered set, ignoring skip/take.
    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async isSkuAvailable(
    sku: string,
    excludeId?: number,
  ): Promise<{ sku: string; available: boolean }> {
    const existing = await this.productsRepository.findOne({ where: { sku } });
    return { sku, available: !existing || existing.id === excludeId };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create({
      ...dto,
      slug: dto.slug ?? slugify(dto.name),
    });
    return this.saveUnique(product);
  }

  /** Turns the slug/sku unique-index violation into a 409 instead of a raw 500. */
  private async saveUnique(product: Product): Promise<Product> {
    try {
      return await this.productsRepository.save(product);
    } catch (error) {
      if ((error as { code?: string }).code === POSTGRES_UNIQUE_VIOLATION) {
        throw new ConflictException(
          'A product with that slug or SKU already exists',
        );
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.saveUnique(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}
