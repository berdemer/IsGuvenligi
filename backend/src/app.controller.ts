import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Ana sayfa bilgileri' })
  @ApiResponse({ 
    status: 200, 
    description: 'Uygulama bilgileri başarıyla döndürüldü',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        version: { type: 'string' },
        environment: { type: 'string' },
        timestamp: { type: 'string' }
      }
    }
  })
  getHello() {
    return this.appService.getHello();
  }

  @Get('info')
  @ApiOperation({ summary: 'Sistem bilgileri' })
  @ApiResponse({ 
    status: 200, 
    description: 'Sistem bilgileri başarıyla döndürüldü',
  })
  getInfo() {
    return this.appService.getSystemInfo();
  }
}