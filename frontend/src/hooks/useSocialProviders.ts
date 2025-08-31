import { useQuery } from '@tanstack/react-query';
import { useOAuthProviders } from './useOAuthProviders';
import { useEffect } from 'react';

interface SocialProvider {
  provider: string;
  displayName: string;
  loginUrl: string;
  enabled: boolean;
}

export const useSocialProviders = () => {
  const { getSocialProviders, initializeProviders } = useOAuthProviders();

  // Initialize providers on first load
  useEffect(() => {
    initializeProviders();
  }, [initializeProviders]);

  const {
    data: socialProviders,
    isLoading,
    error,
    refetch,
  } = useQuery<SocialProvider[]>({
    queryKey: ['social-providers'],
    queryFn: async () => {
      // TEMPORARY: Mock social providers for development (since backend has compilation issues)
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      // Get providers from global state instead of hard-coded mock data
      return getSocialProviders();
    },
    staleTime: 1000, // 1 second - shorter to reflect changes quickly
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true, // Enable refetch on focus to sync changes
  });

  return {
    socialProviders: socialProviders?.filter((provider: SocialProvider) => provider.enabled) || [],
    isLoading,
    error,
    refetch,
  };
};