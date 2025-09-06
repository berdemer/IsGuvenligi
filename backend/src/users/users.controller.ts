import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kullanıcıları listele' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Kullanıcılar başarıyla listelendi' 
  })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string
  ) {
    return this.usersService.findAll({ page, limit, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID ile kullanıcı getir' })
  @ApiParam({ name: 'id', description: 'Kullanıcı ID\'si' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kullanıcı başarıyla bulundu' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Kullanıcı bulunamadı' 
  })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Get('username/:username')
  @ApiOperation({ summary: 'Kullanıcı adı ile kullanıcı getir' })
  @ApiParam({ name: 'username', description: 'Kullanıcı adı' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kullanıcı başarıyla bulundu' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Kullanıcı bulunamadı' 
  })
  async findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'E-posta ile kullanıcı getir' })
  @ApiParam({ name: 'email', description: 'E-posta adresi' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kullanıcı başarıyla bulundu' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Kullanıcı bulunamadı' 
  })
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Departmana göre kullanıcıları getir' })
  @ApiParam({ name: 'departmentId', description: 'Departman ID\'si' })
  @ApiResponse({ 
    status: 200, 
    description: 'Departman kullanıcıları başarıyla listelendi' 
  })
  async getUsersByDepartment(@Param('departmentId', ParseUUIDPipe) departmentId: string) {
    return this.usersService.getUsersByDepartment(departmentId);
  }

  @Get('role/:roleName')
  @ApiOperation({ summary: 'Role göre kullanıcıları getir' })
  @ApiParam({ name: 'roleName', description: 'Rol adı' })
  @ApiResponse({ 
    status: 200, 
    description: 'Rol kullanıcıları başarıyla listelendi' 
  })
  async getUsersByRole(@Param('roleName') roleName: string) {
    return this.usersService.getUsersByRole(roleName);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni kullanıcı oluştur' })
  @ApiResponse({ 
    status: 201, 
    description: 'Kullanıcı başarıyla oluşturuldu' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Geçersiz veri' 
  })
  async create(@Body() userData: any) {
    return this.usersService.create(userData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Kullanıcı bilgilerini güncelle' })
  @ApiParam({ name: 'id', description: 'Kullanıcı ID\'si' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kullanıcı başarıyla güncellendi' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Kullanıcı bulunamadı' 
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateData: any
  ) {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Kullanıcıyı sil' })
  @ApiParam({ name: 'id', description: 'Kullanıcı ID\'si' })
  @ApiResponse({ 
    status: 204, 
    description: 'Kullanıcı başarıyla silindi' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Kullanıcı bulunamadı' 
  })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.delete(id);
  }

  @Post(':id/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcı son giriş zamanını güncelle' })
  @ApiParam({ name: 'id', description: 'Kullanıcı ID\'si' })
  @ApiResponse({ 
    status: 200, 
    description: 'Son giriş zamanı güncellendi' 
  })
  async updateLastLogin(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.updateLastLogin(id);
    return { message: 'Last login updated successfully' };
  }
}