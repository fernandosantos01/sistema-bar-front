import { api } from "./api";

export interface LoginCredentials {
  login: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  perfil: string; // <--- Novo campo
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
