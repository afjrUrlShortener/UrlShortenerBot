import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('healthcheck')
export class AppController {
  @Get()
  check(@Res({ passthrough: true }) response: Response) {
    response.status(HttpStatus.OK);
  }
}
