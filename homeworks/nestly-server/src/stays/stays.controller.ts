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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new stay',
    description: 'Protected — any logged-in user (USER or ADMIN) may create a stay.',
  })
  @ApiResponse({ status: 401, description: 'Access token missing or expired.' })
  @ApiResponse({ status: 201, description: 'The created stay.', type: Stay })
  create(@Body() dto: CreateStayDto) {
    return this.staysService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an existing stay',
    description: 'Protected — any logged-in user (USER or ADMIN) may update a stay.',
  })
  @ApiResponse({ status: 401, description: 'Access token missing or expired.' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'The updated stay.', type: Stay })
  @ApiResponse({ status: 404, description: 'No stay with that id.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStayDto) {
    return this.staysService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a stay',
    description: 'Protected — ADMIN only. A logged-in USER gets 403 here.',
  })
  @ApiResponse({ status: 401, description: 'Access token missing or expired.' })
  @ApiResponse({ status: 403, description: 'Logged in, but not an ADMIN.' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 204, description: 'Stay deleted.' })
  @ApiResponse({ status: 404, description: 'No stay with that id.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.staysService.remove(id);
  }
}
