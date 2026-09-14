import { ApiProperty } from '@nestjs/swagger';

/** Shape of every error Nest's built-in exception filter returns. */
export class ErrorResponseDto {
  @ApiProperty({ example: 404, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Product 123 not found',
    description: 'Human-readable explanation of what went wrong',
  })
  message: string;

  @ApiProperty({ example: 'Not Found', description: 'HTTP status text' })
  error: string;
}

/**
 * 400 returned by the global ValidationPipe — `message` is the list of every
 * constraint the payload violated.
 */
export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    type: [String],
    example: [
      'email must be an email',
      'password must be longer than or equal to 8 characters',
    ],
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}
