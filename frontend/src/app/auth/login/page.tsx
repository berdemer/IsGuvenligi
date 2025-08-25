'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security,
  Google,
  Microsoft
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/hooks/useAuth';
import { useSocialProviders } from '@/hooks/useSocialProviders';

const schema = yup.object({
  username: yup.string().required('Kullanıcı adı gereklidir'),
  password: yup.string().min(8, 'Şifre en az 8 karakter olmalıdır').required('Şifre gereklidir'),
});

type LoginForm = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const { socialProviders, isLoading: providersLoading } = useSocialProviders();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      // Admin kullanıcısını manuel olarak admin paneline yönlendir
      const { user } = useAuth.getState();
      
      // TEMPORARY FIX: Admin username kontrolü
      if (user?.username === 'admin') {
        console.log('Admin user detected, redirecting to admin panel');
        router.replace('/admin/dashboard');
        return;
      }
      
      // Normal rol kontrolü
      const hasAdminAccess = user?.roles?.some(role => 
        ['admin', 'manager'].includes(role.toLowerCase())
      );
      
      if (hasAdminAccess) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.username, data.password);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleSocialLogin = (provider: any) => {
    window.location.href = provider.loginUrl;
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return <Google />;
      case 'microsoft':
        return <Microsoft />;
      default:
        return <Security />;
    }
  };

  if (isAuthenticated) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} sx={{ color: '#d32f2f' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 20px rgba(211, 47, 47, 0.3)'
              }}
            >
              <Security sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" fontWeight="bold" color="#d32f2f" mb={1}>
              İş Güvenliği Sistemi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Güvenli çalışma ortamı için giriş yapın
            </Typography>
          </Box>

          {/* Social Login Buttons */}
          {!providersLoading && socialProviders && socialProviders.length > 0 && (
            <>
              <Box mb={3}>
                {socialProviders.map((provider) => (
                  <Button
                    key={provider.provider}
                    fullWidth
                    variant="outlined"
                    startIcon={getProviderIcon(provider.provider)}
                    onClick={() => handleSocialLogin(provider)}
                    sx={{
                      mb: 1,
                      py: 1.5,
                      borderColor: provider.provider === 'google' ? '#db4437' : '#0078d4',
                      color: provider.provider === 'google' ? '#db4437' : '#0078d4',
                      '&:hover': {
                        borderColor: provider.provider === 'google' ? '#db4437' : '#0078d4',
                        backgroundColor: provider.provider === 'google' 
                          ? 'rgba(219, 68, 55, 0.04)' 
                          : 'rgba(0, 120, 212, 0.04)',
                      },
                    }}
                  >
                    {provider.displayName} ile Giriş Yap
                  </Button>
                ))}
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  veya
                </Typography>
              </Divider>
            </>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Kullanıcı Adı"
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={{ mb: 2 }}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Şifre"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 3 }}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                py: 1.5,
                mb: 2,
                background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #c62828 0%, #e53935 100%)',
                },
                '&:disabled': {
                  background: '#ccc',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Giriş Yap'
              )}
            </Button>
          </Box>

          {/* Footer */}
          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              © 2024 İş Güvenliği Sistemi - Güvenli çalışma ortamı için tasarlandı
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}