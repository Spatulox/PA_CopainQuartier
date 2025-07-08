import axios, { AxiosInstance, AxiosRequestConfig, ResponseType } from 'axios';
import { User } from "./user"
import { popup } from '../app/scripts/popup-slide';



export type Query = Record<string, string | number | boolean | undefined | null>


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
  baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000"
  private username = ""
  private password = ""
  user: User = null
  errors: ErrorMessage | any | null = null
  private tryConnection = 0;

  // You can create an ApiClient instance in two way :
  // new ApiClient(username, password) => Get the token from the API
  // new ApiClient() => Get the Token from the localStorage
  constructor(username: string | null = null, password: string | null = null, type: "register" | "login" = "login") {
    this.client = axios.create({
      baseURL: this.baseURL,
      //headers: { 'Content-Type': 'application/json' },
    });
    this.setupInterceptors();
    if (username && password) {
      this.username = username;
      this.password = password;
    }
    if(type == "login"){
      this.connect()
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
            popup("Déconnexion forcée")
            this.deconnection();
            
          }
        } else if(error.hasOwnProperty("response") && error.response.status !== 401) {
            alert(error.code + " " + error.response.statusText)
            console.error(error.response.data)
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
        if(this.username === "" || this.password === ""){
          return false;
        }
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

  async resetPassword(email: string): Promise<void> {
    try {
      await this.Post("/auth/reset-password", {email});
    } catch {
      throw new Error("Erreur lors de la réinitialisation du mot de passe");
    }
  }

  async resetPasswordCode(options: {email: string, id: string, password: string}): Promise<void> {
    try {
      await this.Post("/auth/reset-password/valid", options);
    } catch {
      throw new Error("Erreur lors de la réinitialisation du mot de passe");
    }
  }

  async getMe(): Promise<User> {
    return await this.Get('/users/@me');
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

  haveLocalToken(): boolean {
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

  protected async Get(endpoint: string, query?: object, responseType?: ResponseType): Promise<any> {
    if (query) {
      endpoint += this.queryToString(query);
    }
    try {
      const config: AxiosRequestConfig = {};
      if (responseType) {
        config.responseType = responseType;
        return await this.client.get(endpoint, config);
      }
      return (await this.client.get(endpoint)).data;
      
    } catch (e) {
      throw e;
    }
  }


  protected async Post(endpoint: string, options: object, query?: object): Promise<any> {
    if(query){
      endpoint +=this.queryToString(query)
    }
    try{
      return (await this.client.post(endpoint, options)).data
    } catch(e){
      //console.error(e)
      throw e
    }
  }

  protected async Patch(endpoint: string, options: object, query?: object): Promise<any> {
    if(query){
      endpoint +=this.queryToString(query)
    }
    try{
      return (await this.client.patch(endpoint, options)).data
    } catch(e){
      //console.error(e)
      throw e
    }
  }

  protected async Put(endpoint: string, options: object, query?: object): Promise<any> {
    if(query){
      endpoint +=this.queryToString(query)
    }
    try{
      return (await this.client.put(endpoint, options)).data
    } catch(e){
      //console.error(e)
      throw e
    }
  }

  protected async Delete(endpoint: string, query?: object): Promise<any> {
    if(query){
      endpoint +=this.queryToString(query)
    }
    try{
      return (await this.client.delete(endpoint)).data
    } catch(e){
      //console.error(e)
      throw e
    }
  }

  private queryToString(query: any): string{
    let url = ""
    if (query) {
        const params = new URLSearchParams(query); // Transform an object into a string for request
        url += `?${params.toString()}`;
    }
    return url
  }
}