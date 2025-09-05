import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsService } from './departments.service';
import { DepartmentsMockService } from './departments.mock-service';
import { DepartmentsController } from './departments.controller';
import { Department } from '../../entities/department.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [],
  controllers: [DepartmentsController],
  providers: [
    DepartmentsMockService,
    {
      provide: DepartmentsService,
      useClass: DepartmentsMockService,
    }
  ],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}