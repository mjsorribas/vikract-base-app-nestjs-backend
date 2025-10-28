# Frontend Implementation Guide - JWT Authentication API

## 📋 Resumen Ejecutivo

Este documento proporciona una guía completa para implementar autenticación JWT en aplicaciones frontend modernas que se conecten con la API NestJS desarrollada. Incluye ejemplos específicos para **React 19+**, **Angular 19+** y **Vue 3+**.

## 🎯 API Endpoints Disponibles

### Base URL
```
http://localhost:3000/api
```

### Endpoints de Autenticación
```
POST /auth/register     - Registro de usuarios
POST /auth/login        - Inicio de sesión
GET  /auth/profile      - Perfil del usuario (protegido)
```

### Endpoints Protegidos (Requieren JWT)
```
GET    /blogs          - Listar blogs
POST   /blogs          - Crear blog
GET    /blogs/:id      - Obtener blog específico
PUT    /blogs/:id      - Actualizar blog
DELETE /blogs/:id      - Eliminar blog

GET    /articles       - Listar artículos
POST   /articles       - Crear artículo
GET    /articles/:id   - Obtener artículo específico
PUT    /articles/:id   - Actualizar artículo
DELETE /articles/:id   - Eliminar artículo

GET    /users          - Listar usuarios (admin)
GET    /users/:id      - Obtener usuario específico
```

## 🔐 Sistema de Autenticación

### JWT Token Format
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "isActive": true,
    "isEmailVerified": true,
    "roles": [...]
  }
}
```

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## ⚛️ REACT 19+ Implementation

### 📦 Dependencias Necesarias

```bash
npm install @tanstack/react-query axios react-router-dom zustand
# O con yarn
yarn add @tanstack/react-query axios react-router-dom zustand
```

### 🔧 Configuración Base

#### 1. Configuración de Axios
```typescript
// src/lib/axios.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir JWT automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 2. Store de Autenticación con Zustand
```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../lib/axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: any[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await apiClient.post('/auth/login', {
            email,
            password,
          });

          const { access_token, user } = response.data;

          localStorage.setItem('access_token', access_token);
          
          set({
            user,
            accessToken: access_token,
            isAuthenticated: true,
          });
        } catch (error) {
          throw new Error('Credenciales inválidas');
        }
      },

      register: async (userData: RegisterData) => {
        try {
          const response = await apiClient.post('/auth/register', userData);
          
          const { access_token, user } = response.data;

          localStorage.setItem('access_token', access_token);
          
          set({
            user,
            accessToken: access_token,
            isAuthenticated: true,
          });
        } catch (error) {
          throw new Error('Error en el registro');
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      getProfile: async () => {
        try {
          const response = await apiClient.get('/auth/profile');
          set({
            user: response.data,
            isAuthenticated: true,
          });
        } catch (error) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

#### 3. Componente de Login
```tsx
// src/components/Login.tsx
import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Iniciar Sesión</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};
```

#### 4. Hook para datos protegidos
```typescript
// src/hooks/useProtectedData.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';

export const useBlogs = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const response = await apiClient.get('/blogs');
      return response.data;
    },
  });
};

export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const response = await apiClient.get('/articles');
      return response.data;
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    },
  });
};
```

#### 5. Componente de Ruta Protegida
```tsx
// src/components/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, getProfile } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      getProfile();
    }
  }, [isAuthenticated, getProfile]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

#### 6. Configuración del Router
```tsx
// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

---

## 🅰️ ANGULAR 19+ Implementation

### 📦 Dependencias Necesarias

```bash
ng add @angular/material
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools
# O con yarn
yarn add @ngrx/store @ngrx/effects @ngrx/store-devtools
```

### 🔧 Configuración Base

#### 1. Servicio de API
```typescript
// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    });
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }
}
```

#### 2. Servicio de Autenticación
```typescript
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: any[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Verificar si hay token almacenado al iniciar
    const token = localStorage.getItem('access_token');
    if (token) {
      this.getProfile().subscribe();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access_token);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          return throwError(() => new Error('Credenciales inválidas'));
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', userData)
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access_token);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          return throwError(() => new Error('Error en el registro'));
        })
      );
  }

  getProfile(): Observable<User> {
    return this.apiService.get<User>('/auth/profile')
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
```

#### 3. Interceptor HTTP
```typescript
// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(error => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
```

#### 4. Guard de Autenticación
```typescript
// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }
}
```

#### 5. Componente de Login
```typescript
// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Iniciar Sesión</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email es requerido
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Email inválido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" required>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Contraseña es requerida
              </mat-error>
            </mat-form-field>

            <div *ngIf="error" class="error-message">
              {{ error }}
            </div>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="loginForm.invalid || loading" class="full-width">
              {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .error-message {
      color: #f44336;
      margin-bottom: 16px;
    }
    mat-card {
      max-width: 400px;
      width: 100%;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
    }
  }
}
```

#### 6. Configuración del App Module
```typescript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

---

## 💚 VUE 3+ Implementation

### 📦 Dependencias Necesarias

```bash
npm install @vueuse/core pinia axios vue-router@4
# O con yarn
yarn add @vueuse/core pinia axios vue-router@4
```

### 🔧 Configuración Base

#### 1. Configuración de Axios
```typescript
// src/lib/api.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
    }
    return Promise.reject(error);
  }
);
```

#### 2. Store de Autenticación con Pinia
```typescript
// src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '@/lib/api';
import router from '@/router';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: any[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const fullName = computed(() => 
    user.value ? `${user.value.firstName} ${user.value.lastName}` : ''
  );

  // Actions
  const login = async (credentials: LoginCredentials) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      const { access_token, user: userData } = response.data;

      accessToken.value = access_token;
      user.value = userData;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      router.push('/dashboard');
    } catch (err: any) {
      error.value = 'Credenciales inválidas';
      throw new Error('Credenciales inválidas');
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      const { access_token, user: newUser } = response.data;

      accessToken.value = access_token;
      user.value = newUser;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(newUser));

      router.push('/dashboard');
    } catch (err: any) {
      error.value = 'Error en el registro';
      throw new Error('Error en el registro');
    } finally {
      loading.value = false;
    }
  };

  const getProfile = async () => {
    try {
      const response = await apiClient.get<User>('/auth/profile');
      user.value = response.data;
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (err) {
      logout();
    }
  };

  const logout = () => {
    user.value = null;
    accessToken.value = null;
    error.value = null;
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    router.push('/login');
  };

  const initializeAuth = () => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      accessToken.value = token;
      user.value = JSON.parse(savedUser);
      getProfile(); // Verificar que el token sigue siendo válido
    }
  };

  return {
    // State
    user,
    accessToken,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    fullName,
    
    // Actions
    login,
    register,
    getProfile,
    logout,
    initializeAuth,
  };
});
```

#### 3. Composable para datos protegidos
```typescript
// src/composables/useApi.ts
import { ref, computed } from 'vue';
import { apiClient } from '@/lib/api';

export function useApi<T>() {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);

  const execute = async (request: () => Promise<any>) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await request();
      data.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.message || 'Error en la petición';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const get = (endpoint: string) => execute(() => apiClient.get(endpoint));
  const post = (endpoint: string, payload: any) => 
    execute(() => apiClient.post(endpoint, payload));
  const put = (endpoint: string, payload: any) => 
    execute(() => apiClient.put(endpoint, payload));
  const del = (endpoint: string) => execute(() => apiClient.delete(endpoint));

  return {
    data,
    loading: isLoading,
    error,
    hasError,
    get,
    post,
    put,
    delete: del,
  };
}

// Composables específicos
export function useBlogs() {
  const api = useApi();
  
  const fetchBlogs = () => api.get('/blogs');
  const createBlog = (blogData: any) => api.post('/blogs', blogData);
  const updateBlog = (id: string, blogData: any) => api.put(`/blogs/${id}`, blogData);
  const deleteBlog = (id: string) => api.delete(`/blogs/${id}`);

  return {
    ...api,
    fetchBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
  };
}

export function useArticles() {
  const api = useApi();
  
  const fetchArticles = () => api.get('/articles');
  const createArticle = (articleData: any) => api.post('/articles', articleData);
  const updateArticle = (id: string, articleData: any) => api.put(`/articles/${id}`, articleData);
  const deleteArticle = (id: string) => api.delete(`/articles/${id}`);

  return {
    ...api,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
  };
}
```

#### 4. Componente de Login
```vue
<!-- src/views/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">Iniciar Sesión</h2>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            :disabled="authStore.loading"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            :disabled="authStore.loading"
            class="form-input"
          />
        </div>

        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading || !isFormValid"
          class="login-button"
        >
          {{ authStore.loading ? 'Iniciando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <p class="register-link">
        ¿No tienes cuenta? 
        <router-link to="/register">Regístrate aquí</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
});

const isFormValid = computed(() => 
  form.email.trim() !== '' && form.password.trim() !== ''
);

const handleLogin = async () => {
  try {
    await authStore.login({
      email: form.email,
      password: form.password,
    });
  } catch (error) {
    // Error ya manejado en el store
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.form-input:disabled {
  background-color: #f8f9fa;
  opacity: 0.6;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.login-button {
  background-color: #007bff;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.register-link a {
  color: #007bff;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
```

#### 5. Guard de Navegación
```typescript
// src/router/guards.ts
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();
  
  if (authStore.isAuthenticated) {
    next();
  } else {
    next('/login');
  }
};

export const guestGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();
  
  if (!authStore.isAuthenticated) {
    next();
  } else {
    next('/dashboard');
  }
};
```

#### 6. Configuración del Router
```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { authGuard, guestGuard } from './guards';
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import Register from '@/views/Register.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: guestGuard,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    beforeEnter: guestGuard,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: authGuard,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

#### 7. Configuración Principal de la App
```typescript
// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Inicializar autenticación al arrancar la app
const authStore = useAuthStore();
authStore.initializeAuth();

app.mount('#app');
```

---

## 🔧 Configuración de CORS en el Backend

Para que los frontends puedan conectarse correctamente, asegúrate de que el backend tenga CORS configurado:

```typescript
// src/main.ts (en el backend NestJS)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS
  app.enableCors({
    origin: [
      'http://localhost:3001', // React
      'http://localhost:4200', // Angular
      'http://localhost:5173', // Vite (Vue)
      'http://localhost:8080', // Vue CLI
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
```

---

## 🚨 Consideraciones de Seguridad

### 1. Almacenamiento de Tokens
```typescript
// ❌ Evitar almacenamiento en localStorage para aplicaciones de alta seguridad
localStorage.setItem('access_token', token);

// ✅ Alternativas más seguras
// - HttpOnly cookies (requiere configuración del backend)
// - Secure session storage
// - Variables de entorno en tiempo de ejecución
```

### 2. Interceptores de Respuesta
```typescript
// Manejo automático de tokens expirados
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Auto-logout en tokens expirados
      authStore.logout();
    }
    return Promise.reject(error);
  }
);
```

### 3. Validación del Frontend
```typescript
// Validar siempre en el frontend antes de enviar
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password: string) => password.length >= 8;
```

---

## 📱 Consideraciones de UX

### 1. Estados de Carga
```typescript
// Mostrar estados de carga apropiados
const { loading, error, data } = useApi();

// En el template
{loading && <Spinner />}
{error && <ErrorMessage message={error} />}
{data && <DataComponent data={data} />}
```

### 2. Persistencia de Sesión
```typescript
// Restaurar sesión al recargar la página
useEffect(() => {
  const token = localStorage.getItem('access_token');
  if (token) {
    authStore.getProfile();
  }
}, []);
```

### 3. Logout Automático
```typescript
// Logout automático en múltiples pestañas
window.addEventListener('storage', (e) => {
  if (e.key === 'access_token' && !e.newValue) {
    authStore.logout();
  }
});
```

---

## 🎯 Resumen de Implementación

### Para cada framework:

1. **Instalación de dependencias** específicas
2. **Configuración de cliente HTTP** con interceptores
3. **Store/Servicio de autenticación** centralizado
4. **Componentes de login/registro** con validación
5. **Guards/Middleware** para rutas protegidas
6. **Manejo de errores** y estados de carga
7. **Persistencia de sesión** entre recargas

### Flujo general:
1. Usuario se autentica → Recibe JWT
2. JWT se almacena localmente
3. Todas las peticiones incluyen JWT automáticamente
4. Frontend maneja expiración y renovación
5. Logout limpia el estado y redirecciona

Esta implementación proporciona una base sólida y segura para integrar cualquier frontend moderno con la API NestJS desarrollada.