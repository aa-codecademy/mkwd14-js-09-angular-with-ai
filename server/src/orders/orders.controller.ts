import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by id (owner or admin only)' })
  findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = req.user as JwtPayload;
    return this.ordersService.findOne(user.sub, id, user.role);
  }
}
