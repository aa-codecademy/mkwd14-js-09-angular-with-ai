import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place an order from a set of product lines' })
  create(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const user = req.user as JwtPayload;
    return this.ordersService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: "List the current user's orders" })
  findAllForUser(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.ordersService.findAllForUser(user.sub);
  }

  @Get('admin')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List every order in the system (admin only)' })
  findAllForAdmin(@Query() query: QueryOrdersDto) {
    return this.ordersService.findAllForAdmin(query);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Approve, decline or advance an order (admin only)',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto.status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by id (owner or admin only)' })
  findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = req.user as JwtPayload;
    return this.ordersService.findOne(user.sub, id, user.role);
  }
}
