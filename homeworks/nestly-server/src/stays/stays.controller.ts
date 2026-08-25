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
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StaysService } from './stays.service';
import { CreateStayDto } from './dto/create-stay.dto';
import { UpdateStayDto } from './dto/update-stay.dto';
import { QueryStaysDto } from './dto/query-stays.dto';
import { Stay } from './stay.entity';

@ApiTags('stays')
@Controller('stays')
export class StaysController {
  constructor(private readonly staysService: StaysService) {}

  @Get()
  @ApiOperation({
    summary: 'List stays',
    description:
      'Returns a page of stays, optionally filtered by superhost/search and sorted. ' +
      'This is the endpoint your `StaysService` (Angular) should call to replace the hardcoded array.',
  })
  @ApiResponse({ status: 200, description: 'A page of stays.', type: [Stay] })
  findAll(@Query() query: QueryStaysDto) {
    return this.staysService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single stay by id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'The matching stay.', type: Stay })
  @ApiResponse({ status: 404, description: 'No stay with that id.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staysService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new stay' })
  @ApiResponse({ status: 201, description: 'The created stay.', type: Stay })
  create(@Body() dto: CreateStayDto) {
    return this.staysService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing stay' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'The updated stay.', type: Stay })
  @ApiResponse({ status: 404, description: 'No stay with that id.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStayDto) {
    return this.staysService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a stay' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 204, description: 'Stay deleted.' })
  @ApiResponse({ status: 404, description: 'No stay with that id.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.staysService.remove(id);
  }
}
