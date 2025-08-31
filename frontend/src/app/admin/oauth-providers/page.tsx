'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Globe, Settings, TestTube, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useOAuthProviders } from '@/hooks/useOAuthProviders';
import { useQueryClient } from '@tanstack/react-query';

interface OAuthProvider {
  id: string;
  name: string;
  displayName: string;
  isEnabled: boolean;
  clientId?: string;
  scopes: string[];
  iconUrl?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function OAuthProvidersPage() {
  const t = useTranslations('auth.oauthProviders');
  const { 
    providers: allProviders, 
    isLoading: storeLoading, 
    initializeProviders, 
    toggleProvider 
  } = useOAuthProviders();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize providers and handle filtering
  useEffect(() => {
    initializeProviders();
  }, [initializeProviders]);

  useEffect(() => {
    // Filter providers based on search query
    let filteredProviders = allProviders;
    if (searchQuery) {
      filteredProviders = filteredProviders.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setProviders(filteredProviders);
    setLoading(storeLoading);
  }, [allProviders, searchQuery, storeLoading]);

  const handleToggleProvider = async (providerId: string) => {
    // Update global state
    toggleProvider(providerId);
    
    // Invalidate and refetch social providers query to update login page
    queryClient.invalidateQueries({ queryKey: ['social-providers'] });
  };

  const handleTestProvider = async (provider: OAuthProvider) => {
    // Mock test functionality
    console.log('Testing OAuth provider:', provider.name);
    // In real implementation, this would make an API call to test the provider
  };

  const getProviderIcon = (provider: OAuthProvider) => {
    if (provider.iconUrl) {
      return (
        <img
          src={provider.iconUrl}
          alt={provider.displayName}
          className="w-8 h-8 rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }
    return <Globe className="w-8 h-8 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('description')}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          {t('addProvider')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('stats.totalProviders')}</p>
                <p className="text-2xl font-bold text-gray-900">{providers.length}</p>
              </div>
              <Globe className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('stats.activeProviders')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {providers.filter(p => p.isEnabled).length}
                </p>
              </div>
              <ToggleRight className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('stats.inactiveProviders')}</p>
                <p className="text-2xl font-bold text-red-600">
                  {providers.filter(p => !p.isEnabled).length}
                </p>
              </div>
              <ToggleLeft className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('stats.configured')}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {providers.filter(p => p.clientId).length}
                </p>
              </div>
              <Settings className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getProviderIcon(provider)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{provider.displayName}</h3>
                        <p className="text-sm text-gray-500">{provider.name}</p>
                      </div>
                    </div>
                    <Switch
                      checked={provider.isEnabled}
                      onCheckedChange={() => handleToggleProvider(provider.id)}
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">{t('status.status')}</p>
                      <Badge
                        variant={provider.isEnabled ? 'default' : 'secondary'}
                        className={
                          provider.isEnabled
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }
                      >
                        {provider.isEnabled ? t('status.active') : t('status.inactive')}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">{t('fields.clientId')}</p>
                      <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded truncate">
                        {provider.clientId ? provider.clientId : t('fields.notConfigured')}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">{t('fields.scopes')}</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.scopes.map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => console.log('Configure', provider.name)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      {t('actions.configure')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleTestProvider(provider)}
                      disabled={!provider.isEnabled || !provider.clientId}
                    >
                      <TestTube className="h-4 w-4 mr-1" />
                      {t('actions.test')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {providers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">{t('empty.title')}</h3>
                <p>{t('empty.description')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}