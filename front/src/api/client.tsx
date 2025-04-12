import axios, { AxiosInstance } from 'axios';
import config from '../config.json'

class ApiClient {
  private client: AxiosInstance;
  private tokenKey = 'authToken';

  constructor(username: string, password: string) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });

    // Configuration des intercepteurs
    this.setupInterceptors();
    this.login(username, password);
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem(this.tokenKey);
      config.headers.Authorization = token ? `Bearer ${token}` : '';
      return config;
    });
  }

  private async login(username: string, password: string) {
    try {
      const response = await this.client.post('/auth/login', {
        username: username,
        password: password
      });
      
      if (response.data.token) {
        this.setAuthToken(response.data.token);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  deconnection(){
    this.clearAuthToken()
  }

  private setAuthToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  private clearAuthToken() {
    localStorage.removeItem(this.tokenKey);
  }

  async getMe() {
    return this.client.get('/users/me');
  }

  async updateUser(id: string, data: any) {
    return this.client.patch(`/users/${id}`, data);
  }
}
