import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import type { OrderStatus } from './order.entity';

/**
 * The order lifecycle is one-dimensional — there is no undo. Each status maps
 * to the statuses it may move to, and to who is allowed to make that move.
 */
export const ORDER_TRANSITIONS: Record<
  OrderStatus,
  Partial<Record<OrderStatus, ReadonlyArray<JwtPayload['role']>>>
> = {
  PENDING: {
    SHIPPED: ['ADMIN'],
    CANCELLED: ['ADMIN', 'USER'],
  },
  SHIPPED: {
    DELIVERED: ['ADMIN', 'USER'],
  },
  DELIVERED: {},
  CANCELLED: {},
};

export function assertTransitionAllowed(
  from: OrderStatus,
  to: OrderStatus,
  role: JwtPayload['role'],
): void {
  const allowedRoles = ORDER_TRANSITIONS[from][to];
  if (!allowedRoles) {
    const next = Object.keys(ORDER_TRANSITIONS[from]);
    throw new BadRequestException(
      next.length
        ? `An order in ${from} can only move to ${next.join(' or ')}, not ${to}`
        : `An order in ${from} is final and cannot be changed`,
    );
  }
  if (!allowedRoles.includes(role)) {
    throw new ForbiddenException(
      `Only ${allowedRoles.join(' or ')} may move an order from ${from} to ${to}`,
    );
  }
}
