import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthProvider } from '../../entities/oauth-provider.entity';
import { 
  CreateOAuthProviderDto, 
  UpdateOAuthProviderDto, 
  OAuthProviderQueryDto, 
  OAuthProviderResponseDto, 
  OAuthProvidersListResponseDto,
  TestOAuthProviderDto
} from './dto/oauth-provider.dto';

@Injectable()
export class OAuthProvidersService {
  constructor(
    @InjectRepository(OAuthProvider)
    private oauthProviderRepository: Repository<OAuthProvider>,
  ) {}

  async findAll(query: OAuthProviderQueryDto): Promise<OAuthProvidersListResponseDto> {
    const { page = 1, limit = 10, search, isEnabled, sortBy = 'sortOrder', sortOrder = 'asc' } = query;
    
    const queryBuilder = this.oauthProviderRepository.createQueryBuilder('provider');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(provider.name LIKE :search OR provider.displayName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply enabled filter
    if (isEnabled !== undefined) {
      const enabledValue = isEnabled === 'true';
      queryBuilder.andWhere('provider.isEnabled = :isEnabled', { isEnabled: enabledValue });
    }

    // Apply sorting
    const validSortFields = ['name', 'displayName', 'sortOrder', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'sortOrder';
    queryBuilder.orderBy(`provider.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [providers, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: providers.map(provider => this.toResponseDto(provider)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  async findById(id: string): Promise<OAuthProviderResponseDto> {
    const provider = await this.oauthProviderRepository.findOne({ where: { id } });

    if (!provider) {
      throw new NotFoundException(`OAuth provider with ID ${id} not found`);
    }

    return this.toResponseDto(provider);
  }

  async findByName(name: string): Promise<OAuthProvider | null> {
    return this.oauthProviderRepository.findOne({ 
      where: { name },
      select: ['id', 'name', 'displayName', 'isEnabled', 'clientId', 'clientSecret', 'authUrl', 'tokenUrl', 'userInfoUrl', 'scopes', 'configuration', 'iconUrl']
    });
  }

  async create(createOAuthProviderDto: CreateOAuthProviderDto): Promise<OAuthProviderResponseDto> {
    const { name, displayName, isEnabled = false, clientId, clientSecret, authUrl, tokenUrl, userInfoUrl, scopes = [], configuration, iconUrl, sortOrder = 0 } = createOAuthProviderDto;

    // Check if provider already exists
    const existingProvider = await this.oauthProviderRepository.findOne({ where: { name } });
    if (existingProvider) {
      throw new ConflictException('OAuth provider with this name already exists');
    }

    const provider = this.oauthProviderRepository.create({
      name,
      displayName,
      isEnabled,
      clientId,
      clientSecret,
      authUrl,
      tokenUrl,
      userInfoUrl,
      scopes,
      configuration,
      iconUrl,
      sortOrder,
    });

    const savedProvider = await this.oauthProviderRepository.save(provider);
    return this.toResponseDto(savedProvider);
  }

  async update(id: string, updateOAuthProviderDto: UpdateOAuthProviderDto): Promise<OAuthProviderResponseDto> {
    const provider = await this.oauthProviderRepository.findOne({ where: { id } });

    if (!provider) {
      throw new NotFoundException(`OAuth provider with ID ${id} not found`);
    }

    const { name, displayName, isEnabled, clientId, clientSecret, authUrl, tokenUrl, userInfoUrl, scopes, configuration, iconUrl, sortOrder } = updateOAuthProviderDto;

    // Check name uniqueness if name is being updated
    if (name && name !== provider.name) {
      const existingProvider = await this.oauthProviderRepository.findOne({ where: { name } });
      if (existingProvider) {
        throw new ConflictException('OAuth provider with this name already exists');
      }
      provider.name = name;
    }

    // Update fields
    if (displayName !== undefined) provider.displayName = displayName;
    if (isEnabled !== undefined) provider.isEnabled = isEnabled;
    if (clientId !== undefined) provider.clientId = clientId;
    if (clientSecret !== undefined) provider.clientSecret = clientSecret;
    if (authUrl !== undefined) provider.authUrl = authUrl;
    if (tokenUrl !== undefined) provider.tokenUrl = tokenUrl;
    if (userInfoUrl !== undefined) provider.userInfoUrl = userInfoUrl;
    if (scopes !== undefined) provider.scopes = scopes;
    if (configuration !== undefined) provider.configuration = configuration;
    if (iconUrl !== undefined) provider.iconUrl = iconUrl;
    if (sortOrder !== undefined) provider.sortOrder = sortOrder;

    const savedProvider = await this.oauthProviderRepository.save(provider);
    return this.toResponseDto(savedProvider);
  }

  async delete(id: string): Promise<void> {
    const provider = await this.oauthProviderRepository.findOne({ where: { id } });
    if (!provider) {
      throw new NotFoundException(`OAuth provider with ID ${id} not found`);
    }

    await this.oauthProviderRepository.remove(provider);
  }

  async toggleEnabled(id: string): Promise<OAuthProviderResponseDto> {
    const provider = await this.oauthProviderRepository.findOne({ where: { id } });

    if (!provider) {
      throw new NotFoundException(`OAuth provider with ID ${id} not found`);
    }

    provider.isEnabled = !provider.isEnabled;
    const savedProvider = await this.oauthProviderRepository.save(provider);
    return this.toResponseDto(savedProvider);
  }

  async testConnection(id: string, testData: TestOAuthProviderDto): Promise<{ success: boolean; message: string; data?: any }> {
    const provider = await this.oauthProviderRepository.findOne({
      where: { id },
      select: ['id', 'name', 'displayName', 'clientId', 'clientSecret', 'authUrl', 'tokenUrl', 'userInfoUrl', 'scopes']
    });

    if (!provider) {
      throw new NotFoundException(`OAuth provider with ID ${id} not found`);
    }

    try {
      // This is a simplified test - in a real implementation, you'd make actual OAuth calls
      if (!provider.clientId || !provider.clientSecret) {
        return {
          success: false,
          message: 'Missing required OAuth configuration (Client ID or Client Secret)'
        };
      }

      if (!provider.authUrl || !provider.tokenUrl) {
        return {
          success: false,
          message: 'Missing required OAuth URLs (Auth URL or Token URL)'
        };
      }

      // Mock successful test
      return {
        success: true,
        message: `OAuth configuration for ${provider.displayName} is valid`,
        data: {
          provider: provider.name,
          clientId: provider.clientId,
          scopes: provider.scopes,
          endpoints: {
            auth: provider.authUrl,
            token: provider.tokenUrl,
            userInfo: provider.userInfoUrl,
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `OAuth test failed: ${error.message}`
      };
    }
  }

  async getEnabledProviders(): Promise<OAuthProviderResponseDto[]> {
    const providers = await this.oauthProviderRepository.find({
      where: { isEnabled: true },
      order: { sortOrder: 'ASC', displayName: 'ASC' },
    });

    return providers.map(provider => this.toResponseDto(provider));
  }

  private toResponseDto(provider: OAuthProvider): OAuthProviderResponseDto {
    return {
      id: provider.id,
      name: provider.name,
      displayName: provider.displayName,
      isEnabled: provider.isEnabled,
      clientId: provider.clientId,
      authUrl: provider.authUrl,
      tokenUrl: provider.tokenUrl,
      userInfoUrl: provider.userInfoUrl,
      scopes: provider.scopes || [],
      configuration: provider.configuration,
      iconUrl: provider.iconUrl,
      sortOrder: provider.sortOrder,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt,
    };
  }
}