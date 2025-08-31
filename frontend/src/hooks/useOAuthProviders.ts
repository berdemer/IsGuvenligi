import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface SocialProvider {
  provider: string;
  displayName: string;
  loginUrl: string;
  enabled: boolean;
}

interface OAuthProvidersState {
  providers: OAuthProvider[];
  isLoading: boolean;
  initializeProviders: () => void;
  toggleProvider: (providerId: string) => void;
  updateProvider: (providerId: string, updates: Partial<OAuthProvider>) => void;
  getSocialProviders: () => SocialProvider[];
}

const mockProviders: OAuthProvider[] = [
  {
    id: '1',
    name: 'google',
    displayName: 'Google',
    isEnabled: true,
    clientId: '123456789-abc.apps.googleusercontent.com',
    scopes: ['openid', 'email', 'profile'],
    iconUrl: 'https://developers.google.com/identity/images/g-logo.png',
    sortOrder: 1,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-08-24T10:00:00.000Z',
  },
  {
    id: '2',
    name: 'microsoft',
    displayName: 'Microsoft',
    isEnabled: false,
    clientId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    scopes: ['openid', 'email', 'profile'],
    iconUrl: 'https://learn.microsoft.com/en-us/azure/active-directory/develop/media/howto-add-branding-in-azure-ad-apps/ms-symbollockup_mssymbol_19.png',
    sortOrder: 2,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-08-20T10:00:00.000Z',
  },
  {
    id: '3',
    name: 'github',
    displayName: 'GitHub',
    isEnabled: false,
    clientId: 'github_client_id_example',
    scopes: ['read:user', 'user:email'],
    iconUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    sortOrder: 3,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-08-20T10:00:00.000Z',
  },
];

export const useOAuthProviders = create<OAuthProvidersState>()(
  persist(
    (set, get) => ({
      providers: [],
      isLoading: false,

      initializeProviders: () => {
        const state = get();
        if (state.providers.length === 0) {
          set({ providers: mockProviders, isLoading: false });
        }
      },

      toggleProvider: (providerId: string) => {
        set((state) => ({
          providers: state.providers.map((provider) =>
            provider.id === providerId
              ? { 
                  ...provider, 
                  isEnabled: !provider.isEnabled,
                  updatedAt: new Date().toISOString()
                }
              : provider
          ),
        }));
      },

      updateProvider: (providerId: string, updates: Partial<OAuthProvider>) => {
        set((state) => ({
          providers: state.providers.map((provider) =>
            provider.id === providerId
              ? { 
                  ...provider, 
                  ...updates,
                  updatedAt: new Date().toISOString()
                }
              : provider
          ),
        }));
      },

      getSocialProviders: (): SocialProvider[] => {
        const state = get();
        return state.providers.map((provider) => ({
          provider: provider.name,
          displayName: provider.displayName,
          loginUrl: `/auth/${provider.name}`,
          enabled: provider.isEnabled,
        }));
      },
    }),
    {
      name: 'oauth-providers-storage',
      partialize: (state) => ({
        providers: state.providers,
      }),
    }
  )
);