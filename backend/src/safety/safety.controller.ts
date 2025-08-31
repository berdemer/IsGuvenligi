import { Controller, Get } from '@nestjs/common';
import { SafetyService } from './safety.service';

@Controller('safety')
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  @Get()
  getSafetyInfo() {
    return this.safetyService.getSafetyInfo();
  }
}