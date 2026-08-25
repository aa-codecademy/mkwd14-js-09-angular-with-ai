import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stay } from './stay.entity';
import { CreateStayDto } from './dto/create-stay.dto';
import { UpdateStayDto } from './dto/update-stay.dto';
import { QueryStaysDto } from './dto/query-stays.dto';

@Injectable()
export class StaysService {
  constructor(
    @InjectRepository(Stay)
    private readonly staysRepository: Repository<Stay>,
  ) {}

  async findAll(query: QueryStaysDto): Promise<Stay[]> {
    const qb = this.staysRepository.createQueryBuilder('stay');

    if (query.superhost !== undefined) {
      qb.andWhere('stay.superhost = :superhost', { superhost: query.superhost });
    }
    if (query.search) {
      qb.andWhere('(LOWER(stay.title) LIKE :search OR LOWER(stay.location) LIKE :search)', {
        search: `%${query.search.toLowerCase()}%`,
      });
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    qb.skip((page - 1) * limit).take(limit);

    const sortDir = (query.sortDir ?? 'asc').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(`stay.${query.sortBy ?? 'id'}`, sortDir);

    return qb.getMany();
  }

  async findOne(id: number): Promise<Stay> {
    const stay = await this.staysRepository.findOne({ where: { id } });
    if (!stay) throw new NotFoundException(`Stay ${id} not found`);
    return stay;
  }

  async create(dto: CreateStayDto): Promise<Stay> {
    const stay = this.staysRepository.create(dto);
    return this.staysRepository.save(stay);
  }

  async update(id: number, dto: UpdateStayDto): Promise<Stay> {
    const stay = await this.findOne(id);
    Object.assign(stay, dto);
    return this.staysRepository.save(stay);
  }

  async remove(id: number): Promise<void> {
    const stay = await this.findOne(id);
    await this.staysRepository.remove(stay);
  }
}
