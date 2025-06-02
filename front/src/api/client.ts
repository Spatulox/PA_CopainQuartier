import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { User } from "./user"
import { popup } from '../app/scripts/popup-slide';

type AuthResponse = {
  accessToken: string,
  refreshToken: string
}

export type ErrorMessage = {
  message: string
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
  errors: ErrorMessage | any | null = null

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
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry && this.isConnected()) {
          originalRequest._retry = true;
          const newAccessToken = await this.refreshAccessToken();
          if (newAccessToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            this.errors = {message:""}
            return this.client(originalRequest);
          } else {
            alert("Déconnexion forcée")
            this.deconnection();
            
          }
        } else if(error.hasOwnProperty("response") && error.response.status !== 401) {
            alert(error.code + " " + error.response.statusText)
            console.log(error.response.data)
            this.errors = error.response.data
            if(this.errors && this.errors.hasOwnProperty("message")){
              popup(this.errors.message)
            }
        }

        return Promise.reject(error);
      }
    );
  }
  
  private goToLogin(): void{
    if(window.location.href != window.location.origin+"/login"){
      window.location.href = window.location.origin+"/login"
    }
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

  async refreshUser() {
    this.user = await this.getMe();
    if (this.user) {
      localStorage.setItem(this.userKey, JSON.stringify(this.user));
    }
  }

  async resetPassword(options: any): Promise<boolean> {
    try {
      await this.Post("/auth/reset", options);
      return true;
    } catch {
      return false;
    }
  }

  async getMe(): Promise<User> {
    const res = await this.Get('/users/@me');
    return res//.data;
  }

  async updateUser(id: string, data: any): Promise<void> {
    await this.Patch(`/users/${id}`, data);
  }

  isAdmin(){
    return this.user?.role === "admin"
  }


  // ----------- CONNECTION ----------- //

  isConnected(): boolean {
    return !!this.getAuthToken();
  }

  deconnection(): void {
    this.clearAuthToken();
    this.goToLogin()
  }

  private setAuthToken(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  getAuthToken(): string | null {
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
        const refreshToken = localStorage.getItem(this.refreshTokenKey)
        if(refreshToken){
          this.setAuthToken(response.data.accessToken, refreshToken);
          return response.data.accessToken;
        } else {
          this.deconnection()
          return null
        }
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
      return (await this.client.get(endpoint)).data
    } catch(e){
      //console.error(e)
      throw e
    }
  }

  protected async Post(endpoint: string, options: object): Promise<any> {
    try{
      return (await this.client.post(endpoint, options)).data
    } catch(e){
      //console.error(e)
      throw e
    }
  }

  protected async Patch(endpoint: string, options: object): Promise<any> {
    try{
      return (await this.client.patch(endpoint, options)).data
    } catch(e){
      //console.error(e)
      throw e
    }
  }

  protected async Put(endpoint: string, options: object): Promise<any> {
    try{
      return (await this.client.put(endpoint, options)).data
    } catch(e){
      //console.error(e)
      throw e
    }
  }

  protected async Delete(endpoint: string): Promise<any> {
    try{
      return (await this.client.delete(endpoint)).data
    } catch(e){
      //console.error(e)
      throw e
    }
  }
}