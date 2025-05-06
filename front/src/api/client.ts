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


  // ----------- INIT CLASS ----------- //

  private setupInterceptors() {
    this.client.interceptors.request.use(config => {
      const token = this.getAuthToken();
      if (token && config.headers) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      return config;
    });
  
    this.client.interceptors.response.use(
      response => response,
      async error => {
        alert("Refresh Token")
        const originalRequest = error.config;
  
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newAccessToken = await this.refreshAccessToken();
          if (newAccessToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);
          } else {
            this.deconnection();
          }
        }
        return Promise.reject(error);
      }
    );
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


  // ----------- USER ----------- //

  async login(username: string, password: string): Promise<boolean> {
    return this.handleAuth('/auth/login', { email: username, password });
  }

  async register(options: any): Promise<boolean> {
    return this.handleAuth('/auth/register', options);
  }

  private async refreshUser() {
    this.user = await this.getMe();
    if (this.user) {
      localStorage.setItem(this.userKey, JSON.stringify(this.user));
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

  async getMe(): Promise<User> {
    const res = await this.Get('/users/@me');
    return res.data;
  }

  async updateUser(id: string, data: any): Promise<User> {
    const res = await this.Patch(`/users/${id}`, data);
    return res.data;
  }


  // ----------- CONNECTION ----------- //

  isConnected(): boolean {
    return !!this.getAuthToken();
  }

  deconnection(): void {
    this.clearAuthToken();
  }

  private setAuthToken(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  private getAuthToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  private clearAuthToken(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.user = null;
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (!refreshToken){
      this.deconnection();
      return null;
    }
  
    try {
      const response = await this.client.post<AuthResponse>('/auth/refresh', { refreshToken });
      if (response.data.accessToken) {
        this.setAuthToken(response.data.accessToken, response.data.refreshToken);
        return response.data.accessToken;
      }
      return null;
    } catch (error) {
      this.deconnection();
      return null;
    }
  }


  // ----------- INTERNET REQUESTS ----------- //

  protected async Get(endpoint: string): Promise<any> {
    try{
      return await this.client.get(endpoint)
    } catch(e){
      console.error(e)
      throw e
    }
  }

  protected async Post(endpoint: string, options: any): Promise<any> {
    try{
      return await this.client.post(endpoint, options)
    } catch(e){
      console.error(e)
      throw e
    }
  }

  protected async Patch(endpoint: string, options: any): Promise<any> {
    try{
      return await this.client.patch(endpoint, options)
    } catch(e){
      console.error(e)
      throw e
    }
  }

  protected async Put(endpoint: string, options: any): Promise<any> {
    try{
      return await this.client.put(endpoint, options)
    } catch(e){
      console.error(e)
      throw e
    }
  }

  protected async Delete(endpoint: string): Promise<any> {
    try{
      return await this.client.delete(endpoint)
    } catch(e){
      console.error(e)
      throw e
    }
  }
}