import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getAdminInfo() {
    return { message: 'Admin panel' };
  }
}