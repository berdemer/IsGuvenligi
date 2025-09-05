import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Admin - Departments')
@ApiBearerAuth()
@Controller('admin/departments')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
// @Roles('admin', 'manager')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({
    status: 200,
    description: 'List of all departments',
    type: [DepartmentResponseDto],
  })
  async findAll(): Promise<DepartmentResponseDto[]> {
    return this.departmentsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active departments' })
  @ApiResponse({
    status: 200,
    description: 'List of active departments',
    type: [DepartmentResponseDto],
  })
  async getActiveDepartments(): Promise<DepartmentResponseDto[]> {
    return this.departmentsService.getActiveDepartments();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search departments' })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiResponse({
    status: 200,
    description: 'List of departments matching search criteria',
    type: [DepartmentResponseDto],
  })
  async search(@Query('q') query: string): Promise<DepartmentResponseDto[]> {
    return this.departmentsService.search(query);
  }

  @Post('sync-employee-counts')
  @ApiOperation({ summary: 'Sync employee counts for all departments' })
  @ApiResponse({
    status: 200,
    description: 'Employee counts synchronized successfully',
  })
  async syncEmployeeCounts(): Promise<{ updated: number; departments: Array<{ name: string; oldCount: number; newCount: number }> }> {
    return this.departmentsService.syncEmployeeCounts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({
    status: 200,
    description: 'Department details',
    type: DepartmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  async findOne(@Param('id') id: string): Promise<DepartmentResponseDto> {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new department' })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
    type: DepartmentResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Department with this name already exists',
  })
  async create(@Body() createDepartmentDto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully',
    type: DepartmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Department with this name already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({
    status: 204,
    description: 'Department deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete department with active employees',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.departmentsService.remove(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple departments' })
  @ApiQuery({ name: 'ids', description: 'Comma-separated list of department IDs', required: true })
  @ApiResponse({
    status: 200,
    description: 'Bulk delete operation completed',
  })
  async removeMultiple(@Query('ids') idsParam: string): Promise<{ deleted: number; errors: string[] }> {
    const ids = idsParam.split(',').map(id => id.trim()).filter(id => id);
    return this.departmentsService.removeMultiple(ids);
  }
}