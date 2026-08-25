import { PartialType } from '@nestjs/swagger';
import { CreateStayDto } from './create-stay.dto';

export class UpdateStayDto extends PartialType(CreateStayDto) {}
