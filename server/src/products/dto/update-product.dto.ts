import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/** Every CreateProductDto field, all optional — send only what changes. */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
