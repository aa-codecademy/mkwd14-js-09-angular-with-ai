import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/paginated.dto';
import { Order } from '../order.entity';

/** The envelope GET /orders/admin returns. Defaults to 20 orders per page. */
export class PaginatedOrdersDto extends PaginationMetaDto {
  @ApiProperty({
    type: [Order],
    description: 'Orders on the current page, customer and lines included',
  })
  data: Order[];
}
