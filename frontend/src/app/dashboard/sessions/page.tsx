'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Computer as ComputerIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { apiService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface UserSession {
  id: string;
  sessionId: string;
  deviceInfo: {
    platform?: string;
    mobile?: string;
    userAgent?: string;
    browser?: string;
    os?: string;
  };
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
}

export default function SessionsPage() {
  const [logoutAllDialog, setLogoutAllDialog] = useState(false);
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null);
  const { user, logoutAll } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading, error, refetch } = useQuery<UserSession[]>({
    queryKey: ['user-sessions'],
    queryFn: () => apiService.getSessions(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const terminateSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiService.terminateSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      toast.success('Oturum sonlandırıldı');
      setSessionToTerminate(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Oturum sonlandırılamadı');
    },
  });

  const handleLogoutAll = async () => {
    try {
      await logoutAll();
      setLogoutAllDialog(false);
    } catch (error) {
      console.error('Logout all failed:', error);
    }
  };

  const getDeviceIcon = (deviceInfo: UserSession['deviceInfo']) => {
    if (deviceInfo?.mobile === '"?1"' || deviceInfo?.platform?.includes('Mobile')) {
      return <SmartphoneIcon color="primary" />;
    }
    if (deviceInfo?.platform?.includes('Tablet')) {
      return <TabletIcon color="primary" />;
    }
    return <ComputerIcon color="primary" />;
  };

  const getDeviceInfo = (session: UserSession) => {
    const { deviceInfo, userAgent } = session;
    
    // Parse user agent for better device info
    let browser = 'Bilinmeyen Tarayıcı';
    let os = 'Bilinmeyen İşletim Sistemi';

    if (userAgent) {
      if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';

      if (userAgent.includes('Windows')) os = 'Windows';
      else if (userAgent.includes('Mac')) os = 'macOS';
      else if (userAgent.includes('Linux')) os = 'Linux';
      else if (userAgent.includes('Android')) os = 'Android';
      else if (userAgent.includes('iOS')) os = 'iOS';
    }

    return { browser, os };
  };

  const getCurrentSessionId = () => {
    // This would typically be stored when logging in
    return localStorage.getItem('current_session_id');
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Oturumlar yüklenirken hata oluştu. Lütfen sayfayı yenileyin.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Aktif Oturumlar
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Yenile
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<SecurityIcon />}
              onClick={() => setLogoutAllDialog(true)}
              disabled={!sessions || sessions.length === 0}
            >
              Tüm Oturumları Sonlandır
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Hesabınızda aktif olan tüm oturumları görüntüleyebilir ve yönetebilirsiniz.
          Güvenliğiniz için tanımadığınız oturumları sonlandırın.
        </Typography>
      </Box>

      {/* Sessions Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SecurityIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {sessions?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aktif Oturum
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocationIcon color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {new Set(sessions?.map(s => s.ipAddress)).size || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Farklı IP Adresi
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ComputerIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {new Set(sessions?.map(s => getDeviceInfo(s).browser)).size || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Farklı Tarayıcı
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sessions List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Oturum Detayları
          </Typography>
          
          {isLoading ? (
            <Box py={4} textAlign="center">
              <Typography>Oturumlar yükleniyor...</Typography>
            </Box>
          ) : sessions && sessions.length > 0 ? (
            <List>
              {sessions.map((session, index) => {
                const { browser, os } = getDeviceInfo(session);
                const isCurrentSession = session.sessionId === getCurrentSessionId();
                
                return (
                  <ListItem
                    key={session.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 2,
                      bgcolor: isCurrentSession ? 'action.hover' : 'background.paper',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getDeviceIcon(session.deviceInfo)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {browser} - {os}
                          </Typography>
                          {isCurrentSession && (
                            <Chip 
                              label="Mevcut Oturum" 
                              color="primary" 
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            <LocationIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                            IP: {session.ipAddress}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <ScheduleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                            Son Aktivite: {format(new Date(session.lastActivity), 'dd MMM yyyy HH:mm', { locale: tr })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Başlangıç: {format(new Date(session.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      {!isCurrentSession && (
                        <Tooltip title="Oturumu Sonlandır">
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => setSessionToTerminate(session.id)}
                            disabled={terminateSessionMutation.isPending}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box py={4} textAlign="center">
              <SecurityIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aktif oturum bulunamadı
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Şu anda hiçbir aktif oturumunuz bulunmamaktadır.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Logout All Dialog */}
      <Dialog
        open={logoutAllDialog}
        onClose={() => setLogoutAllDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tüm Oturumları Sonlandır</DialogTitle>
        <DialogContent>
          <Typography>
            Bu işlem tüm aktif oturumlarınızı sonlandıracak ve yeniden giriş yapmanızı gerektirecektir.
            Devam etmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutAllDialog(false)}>
            İptal
          </Button>
          <Button
            onClick={handleLogoutAll}
            color="error"
            variant="contained"
          >
            Tüm Oturumları Sonlandır
          </Button>
        </DialogActions>
      </Dialog>

      {/* Terminate Session Dialog */}
      <Dialog
        open={!!sessionToTerminate}
        onClose={() => setSessionToTerminate(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Oturumu Sonlandır</DialogTitle>
        <DialogContent>
          <Typography>
            Bu oturumu sonlandırmak istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionToTerminate(null)}>
            İptal
          </Button>
          <Button
            onClick={() => sessionToTerminate && terminateSessionMutation.mutate(sessionToTerminate)}
            color="error"
            variant="contained"
            disabled={terminateSessionMutation.isPending}
          >
            Oturumu Sonlandır
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}