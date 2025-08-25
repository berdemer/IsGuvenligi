import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      timeout: 15000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const token = this.getToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.api(originalRequest);
          } catch (refreshError) {
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const { access_token } = response.data;
      this.setToken(access_token);
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  private handleAuthError(): void {
    this.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  private handleApiError(error: any): void {
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Bir hata oluştu';

    console.error('API Error:', {
      status: error.response?.status,
      message,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Don't show toast for 401 errors (handled by auth logic)
    if (error.response?.status !== 401) {
      toast.error(message);
    }
  }

  // Auth methods
  async login(username: string, password: string) {
    const response = await this.api.post('/auth/login', {
      username,
      password,
    });

    const { access_token, user } = response.data;
    this.setToken(access_token);

    return { access_token, user };
  }

  async logout() {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
    }
  }

  async logoutAll() {
    try {
      await this.api.post('/auth/logout-all');
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      this.removeToken();
    }
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  async checkToken() {
    const response = await this.api.get('/auth/check');
    return response.data;
  }

  async getSessions() {
    const response = await this.api.get('/auth/sessions');
    return response.data;
  }

  async terminateSession(sessionId: string) {
    const response = await this.api.post(`/auth/sessions/${sessionId}/terminate`);
    return response.data;
  }

  async getSocialProviders() {
    const response = await this.api.get('/auth/social-providers');
    return response.data;
  }

  // Users methods
  async getUsers(params?: any) {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUser(id: string) {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.api.post('/users', data);
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.api.put(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // Admin methods
  async getSystemSettings() {
    const response = await this.api.get('/admin/settings');
    return response.data;
  }

  async updateSystemSetting(key: string, value: any) {
    const response = await this.api.put(`/admin/settings/${key}`, { value });
    return response.data;
  }

  async getSocialSettings() {
    const response = await this.api.get('/admin/social-settings');
    return response.data;
  }

  async updateSocialSetting(provider: string, data: any) {
    const response = await this.api.put(`/admin/social-settings/${provider}`, data);
    return response.data;
  }

  async getAuditLogs(params?: any) {
    const response = await this.api.get('/admin/audit-logs', { params });
    return response.data;
  }

  // Safety methods
  async getSafetyRecords(params?: any) {
    const response = await this.api.get('/safety/records', { params });
    return response.data;
  }

  async createSafetyRecord(data: any) {
    const response = await this.api.post('/safety/records', data);
    return response.data;
  }

  async updateSafetyRecord(id: string, data: any) {
    const response = await this.api.put(`/safety/records/${id}`, data);
    return response.data;
  }

  async deleteSafetyRecord(id: string) {
    const response = await this.api.delete(`/safety/records/${id}`);
    return response.data;
  }

  async getTrainingRecords(params?: any) {
    const response = await this.api.get('/safety/training', { params });
    return response.data;
  }

  async createTrainingRecord(data: any) {
    const response = await this.api.post('/safety/training', data);
    return response.data;
  }

  // Generic methods
  async get(url: string, config?: AxiosRequestConfig) {
    const response = await this.api.get(url, config);
    return response.data;
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    const response = await this.api.delete(url, config);
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;