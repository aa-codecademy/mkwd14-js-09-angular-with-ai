import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(query: QueryProductsDto): Promise<Product[]> {
    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (query.featured !== undefined) {
      qb.andWhere('product.featured = :featured', { featured: query.featured });
    }
    if (query.categoryId !== undefined) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId: query.categoryId });
    }
    if (query.search) {
      qb.andWhere('LOWER(product.name) LIKE :search', {
        search: `%${query.search.toLowerCase()}%`,
      });
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    qb.skip((page - 1) * limit).take(limit);

    const sortDir = (query.sortDir ?? 'asc').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(`product.${query.sortBy ?? 'id'}`, sortDir);

    return qb.getMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(dto);
    return this.productsRepository.save(product);
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}
