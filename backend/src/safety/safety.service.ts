import { Injectable } from '@nestjs/common';

@Injectable()
export class SafetyService {
  getSafetyInfo() {
    return { message: 'İş Güvenliği Sistemi' };
  }
}