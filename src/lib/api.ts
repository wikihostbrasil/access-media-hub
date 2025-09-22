// API client for PHP backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/arquivo-manager/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('access_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async signIn(email: string, password: string) {
    const response = await this.request<{ user: any; access_token: string }>('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.access_token);
    return response;
  }

  async signUp(email: string, password: string, full_name: string) {
    return this.request<{ message: string }>('/auth/register.php', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
  }

  signOut() {
    this.setToken(null);
    return Promise.resolve();
  }

  // Files methods
  async getFiles() {
    return this.request<any[]>('/files/list.php');
  }

  async uploadFile(formData: FormData) {
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}/files/upload.php`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  // Users methods
  async getUsers() {
    return this.request<any[]>('/users/list.php');
  }

  // Groups methods
  async getGroups() {
    return this.request<any[]>('/groups/list.php');
  }

  // Categories methods
  async getCategories() {
    return this.request<any[]>('/categories/list.php');
  }

  // Downloads methods
  async getDownloads() {
    return this.request<any[]>('/downloads/list.php');
  }

  async recordDownload(fileId: string) {
    return this.request('/downloads/record.php', {
      method: 'POST',
      body: JSON.stringify({ file_id: fileId }),
    });
  }

  // Plays methods
  async recordPlay(fileId: string) {
    return this.request('/plays/record.php', {
      method: 'POST',
      body: JSON.stringify({ file_id: fileId }),
    });
  }

  // Categories CRUD
  async createCategory(name: string, description?: string) {
    return this.request('/categories/create.php', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/delete.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Groups CRUD
  async createGroup(name: string, description?: string) {
    return this.request('/groups/create.php', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async deleteGroup(id: string) {
    return this.request(`/groups/delete.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Files CRUD
  async deleteFile(id: string) {
    return this.request(`/files/delete.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Reports/Stats
  async getStats() {
    return this.request<any>('/reports/stats.php');
  }

  // Auth
  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password.php', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);