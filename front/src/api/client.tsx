import axios, { AxiosInstance } from 'axios';

export type User = {
  id: string,
  email: string,
  username: string,
}

export class ApiClient {
  private client: AxiosInstance;
  private tokenKey = 'authToken';
  private baseURL = "http://localhost:3000"
  private username = ""
  private password = ""

  constructor(username: string | null, password: string | null) {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
    if(username && password){
      this.username = username
      this.password = password
    }
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem(this.tokenKey);
      config.headers.Authorization = token ? `Bearer ${token}` : '';
      return config;
    });
  }

  private async login(username: string, password: string): Promise<void> {
    try {
      const response = await this.client.post('/auth/login', {
        email: username,
        password: password
      });
      
      if (response.data.accessToken) {
        this.setAuthToken(response.data.accessToken);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async connect(): Promise<void> {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      await this.login(this.username, this.password);
    }
  }

  deconnection(): void{
    this.clearAuthToken()
  }

  private setAuthToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private clearAuthToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  async getMe(): Promise<User> {
    const data = await this.client.get('/users/@me');
    return data.data
  }

  async updateUser(id: string, data: any): Promise<User> {
    return this.client.patch(`/users/${id}`, data);
  }
}
