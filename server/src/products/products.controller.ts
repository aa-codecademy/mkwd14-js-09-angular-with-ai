import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { CheckSkuDto } from './dto/check-sku.dto';
import {
  PaginatedProductsDto,
  SkuAvailabilityDto,
} from './dto/product-response.dto';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/error-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('products')
@ApiBadRequestResponse({
  description: 'The query, path parameter, or body failed validation',
  type: ValidationErrorResponseDto,
})
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'List products, optionally filtered by category/search/featured',
    description:
      'Always paginated: an omitted page/limit falls back to page 1 and 12 per page, so the envelope shape never varies.',
  })
  @ApiOkResponse({
    description: 'A page of products plus the pagination metadata',
    type: PaginatedProductsDto,
  })
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  // Declared before ':id' so the literal path wins over the param route.
  @Get('sku-available')
  @ApiOperation({
    summary: 'Check whether a SKU is free (for async form validation)',
  })
  @ApiOkResponse({
    description: 'Whether the SKU may be used',
    type: SkuAvailabilityDto,
  })
  checkSku(@Query() query: CheckSkuDto) {
    return this.productsService.isSkuAvailable(query.sku, query.excludeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by id' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Product id' })
  @ApiOkResponse({
    description: 'The requested product, category included',
    type: Product,
  })
  @ApiNotFoundResponse({
    description: 'No product with that id',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a product (admin only)',
    description: 'The slug is derived from the name when it is not supplied.',
  })
  @ApiCreatedResponse({ description: 'The created product', type: Product })
  @ApiUnauthorizedResponse({
    description: 'Missing, expired, or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'The caller is authenticated but is not an ADMIN',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Another product already uses that slug or SKU',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a product (admin only)',
    description: 'Every field is optional — only what you send is changed.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Product id' })
  @ApiOkResponse({ description: 'The updated product', type: Product })
  @ApiUnauthorizedResponse({
    description: 'Missing, expired, or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'The caller is authenticated but is not an ADMIN',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No product with that id',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Another product already uses that slug or SKU',
    type: ErrorResponseDto,
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product (admin only)' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Product id' })
  @ApiNoContentResponse({ description: 'The product was deleted' })
  @ApiUnauthorizedResponse({
    description: 'Missing, expired, or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'The caller is authenticated but is not an ADMIN',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No product with that id',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
