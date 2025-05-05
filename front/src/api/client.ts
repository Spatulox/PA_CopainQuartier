import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export type User = {
  _id: string,
  name: string,
  lastname: string,
  email: string,
  password: string,
  address: string,
  verified: boolean,
  role: string,
  group_chat_list_ids: [],
  troc_score: string | number | null,
  phone: string
} | null

type AuthResponse = {
  accessToken: string,
  refreshToken: string
}

export class ApiClient {
  protected client: AxiosInstance;
  protected readonly accessTokenKey = 'accessToken';
  protected readonly refreshTokenKey = 'refreshToken';
  protected readonly userKey = 'user';
  baseURL = "http://localhost:3000"
  private username = ""
  private password = ""
  user: User = null

  // You can create an ApiClient instance in two way :
  // new ApiClient(username, password) => Get the token from the API
  // new ApiClient() => Get the Token from the localStorage
  constructor(username: string | null = null, password: string | null = null) {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: { 'Content-Type': 'application/json' },
    });
    this.setupInterceptors();
    if (username && password) {
      this.username = username;
      this.password = password;
    }
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(config => {
      const token = this.getAuthToken();
      if (token && config.headers) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      return config;
    });
  }  

  private async handleAuth(endpoint: string, payload: any): Promise<boolean> {
    try {
      const res = await this.client.post<AuthResponse>(endpoint, payload);
      if (res.data.accessToken) {
        this.setAuthToken(res.data.accessToken, res.data.refreshToken);
        await this.refreshUser();
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  private async refreshUser() {
    this.user = await this.getMe();
    if (this.user) {
      localStorage.setItem(this.userKey, JSON.stringify(this.user));
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    return this.handleAuth('/auth/login', { email: username, password });
  }

  async register(options: any): Promise<boolean> {
    return this.handleAuth('/auth/register', options);
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.getAuthToken()) {
        return await this.login(this.username, this.password);
      }
      const userCache = localStorage.getItem(this.userKey);
      if (!userCache) {
        await this.refreshUser();
      } else {
        this.user = JSON.parse(userCache);
      }
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async resetPassword(options: any): Promise<boolean> {
    try {
      await this.client.post("/auth/reset", options);
      return true;
    } catch {
      return false;
    }
  }

  deconnection(): void {
    this.clearAuthToken();
  }

  private setAuthToken(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  isConnected(): boolean {
    return !!this.getAuthToken();
  }

  clearAuthToken(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.user = null;
  }

  async getMe(): Promise<User> {
    const res = await this.client.get('/users/@me');
    return res.data;
  }

  async updateUser(id: string, data: any): Promise<User> {
    const res = await this.client.patch(`/users/${id}`, data);
    return res.data;
  }
}