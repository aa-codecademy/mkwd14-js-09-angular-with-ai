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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PaginatedOrdersDto } from './dto/order-response.dto';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/error-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('orders')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Missing, expired, or invalid access token',
  type: ErrorResponseDto,
})
@ApiBadRequestResponse({
  description: 'The query, path parameter, or body failed validation',
  type: ValidationErrorResponseDto,
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Place an order from a set of product lines',
    description:
      'Prices are captured at checkout with each discount applied, and the ordered units are taken out of stock.',
  })
  @ApiCreatedResponse({
    description: 'The created order, in PENDING status',
    type: Order,
  })
  @ApiBadRequestResponse({
    description:
      'The payload failed validation, or a line exceeds the stock on hand',
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'One of the ordered products does not exist',
    type: ErrorResponseDto,
  })
  create(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const user = req.user as JwtPayload;
    return this.ordersService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: "List the current user's orders",
    description: 'Newest first. Never includes another customer’s orders.',
  })
  @ApiOkResponse({
    description: 'The caller’s orders (empty array if they have none)',
    type: [Order],
  })
  findAllForUser(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.ordersService.findAllForUser(user.sub);
  }

  @Get('admin')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'List every order in the system (admin only)',
    description: 'Paginated, filterable by status and sortable.',
  })
  @ApiOkResponse({
    description: 'A page of orders plus the pagination metadata',
    type: PaginatedOrdersDto,
  })
  @ApiForbiddenResponse({
    description: 'The caller is authenticated but is not an ADMIN',
    type: ErrorResponseDto,
  })
  findAllForAdmin(@Query() query: QueryOrdersDto) {
    return this.ordersService.findAllForAdmin(query);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary:
      'Advance an order along its lifecycle. Admins may ship or cancel a ' +
      'pending order and mark a shipped one delivered; a user may cancel ' +
      'their own pending order or confirm delivery of a shipped one.',
    description:
      'Cancelling returns the reserved stock to the products. DELIVERED and CANCELLED are final.',
  })
  @ApiParam({ name: 'id', type: Number, example: 42, description: 'Order id' })
  @ApiOkResponse({ description: 'The order at its new status', type: Order })
  @ApiBadRequestResponse({
    description: 'That transition is not part of the order lifecycle',
    type: ValidationErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description:
      'The order belongs to someone else, or the caller’s role may not make that transition',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No order with that id',
    type: ErrorResponseDto,
  })
  updateStatus(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const user = req.user as JwtPayload;
    return this.ordersService.updateStatus(id, dto.status, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by id (owner or admin only)' })
  @ApiParam({ name: 'id', type: Number, example: 42, description: 'Order id' })
  @ApiOkResponse({ description: 'The requested order', type: Order })
  @ApiForbiddenResponse({
    description:
      'The order belongs to another customer and the caller is not an ADMIN',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No order with that id',
    type: ErrorResponseDto,
  })
  findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const user = req.user as JwtPayload;
    return this.ordersService.findOne(user.sub, id, user.role);
  }
}
