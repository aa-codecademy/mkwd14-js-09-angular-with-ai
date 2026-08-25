import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Nestly API is running. See /api/docs for the Swagger documentation.';
  }
}
