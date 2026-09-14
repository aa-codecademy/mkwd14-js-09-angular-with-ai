import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/error-response.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({
    summary: 'List all categories',
    description: 'Returns every category, ordered by id ascending.',
  })
  @ApiOkResponse({
    description: 'The full list of categories (empty array if none exist)',
    type: [Category],
  })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single category by id' })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'Category id',
  })
  @ApiOkResponse({ description: 'The requested category', type: Category })
  @ApiBadRequestResponse({
    description: 'The id is not an integer',
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No category with that id',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }
}
