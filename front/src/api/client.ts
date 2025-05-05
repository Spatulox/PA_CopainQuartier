import axios, { AxiosInstance } from 'axios';

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

export class ApiClient {
  protected client: AxiosInstance;
  protected tokenKey = 'authToken';
  baseURL = "http://localhost:3000"
  private username = ""
  private password = ""
  user : User = null

  constructor(username: string | null = null, password: string | null = null) {
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

  private async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await this.client.post('/auth/login', {
        email: username,
        password: password
      });
      
      if (response.data.accessToken) {
        this.setAuthToken(response.data.accessToken);
        // Récupère l'utilisateur après login et stocke-le
        this.user = await this.getMe();
        if(this.user){
          localStorage.setItem("user", JSON.stringify(this.user));
        }
        return true;
      }
      return false;
    } catch (error) {
      //console.error('Login failed:', error);
      throw error;
    }
  }
  
  async register(options: any): Promise<boolean> {
    const res = await this.client.post("/auth/register", options)
    if (res.data.accessToken) {
      this.setAuthToken(res.data.accessToken);
      this.user = await this.getMe();
      if(this.user){
        localStorage.setItem("user", JSON.stringify(this.user));
      }
      return true;
    }
    return false;
  }

  async connect(): Promise<boolean> {
    try{
      const token = localStorage.getItem(this.tokenKey);
      if (!token) {
        return await this.login(this.username, this.password);
      }
      // Toujours rafraîchir le user depuis l'API pour être à jour (optionnel)
      // this.user = await this.getMe();
      // localStorage.setItem("user", JSON.stringify(this.user));
      // return true;
    
      // Sinon, utilise le cache localStorage
      const user = localStorage.getItem("user");
      if(!user) {
        this.user = await this.getMe();
        if(this.user){
          localStorage.setItem("user", JSON.stringify(this.user));
        }
      } else {
        this.user = JSON.parse(user);
      }
      return true;
    } catch(e){
      console.error(e)
      //return false
      throw e
    }
  }

  deconnection(): void{
    this.clearAuthToken()
  }

  private setAuthToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isConnected(): boolean {
    return localStorage.getItem(this.tokenKey) ? true : false
  }

  clearAuthToken(): void {
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
