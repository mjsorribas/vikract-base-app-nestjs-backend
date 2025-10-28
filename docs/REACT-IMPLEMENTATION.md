# React 19+ - JWT Authentication Implementation Guide

## 📋 Resumen Ejecutivo

Esta guía proporciona una implementación completa de autenticación JWT para aplicaciones **React 19+** que se conecten con la API NestJS desarrollada.

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

## 📦 Dependencias Necesarias

```bash
npm install @tanstack/react-query axios react-router-dom zustand
# O con yarn
yarn add @tanstack/react-query axios react-router-dom zustand

# Dependencias adicionales para UI (opcional)
npm install @headlessui/react @heroicons/react tailwindcss
```

## 🔧 Configuración Base

### 1. Configuración de Axios

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

### 2. Store de Autenticación con Zustand

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

## 🔒 Componentes de Autenticación

### 3. Componente de Login

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Dirección de email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### 4. Componente de Registro

```tsx
// src/components/Register.tsx
import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError('Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Nombre"
              />
              <input
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Apellido"
              />
            </div>
            
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nombre de usuario"
            />
            
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Email"
            />
            
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Contraseña"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

## 🛡️ Rutas Protegidas

### 5. Componente de Ruta Protegida

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

## 📊 Hooks para Datos Protegidos

### 6. Hooks personalizados con React Query

```typescript
// src/hooks/useProtectedData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';

// Hook para blogs
export const useBlogs = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const response = await apiClient.get('/blogs');
      return response.data;
    },
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (blogData: any) => {
      const response = await apiClient.post('/blogs', blogData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

// Hook para artículos
export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const response = await apiClient.get('/articles');
      return response.data;
    },
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (articleData: any) => {
      const response = await apiClient.post('/articles', articleData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

// Hook para perfil de usuario
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

## 🖥️ Componente Dashboard

### 7. Dashboard Principal

```tsx
// src/components/Dashboard.tsx
import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useBlogs, useArticles } from '../hooks/useProtectedData';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { data: blogs, isLoading: blogsLoading } = useBlogs();
  const { data: articles, isLoading: articlesLoading } = useArticles();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Hola, {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blogs Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Blogs
                </h3>
                {blogsLoading ? (
                  <p>Cargando blogs...</p>
                ) : (
                  <div className="space-y-2">
                    {blogs?.length > 0 ? (
                      blogs.map((blog: any) => (
                        <div key={blog.id} className="border-l-4 border-blue-400 pl-4">
                          <h4 className="font-semibold">{blog.title}</h4>
                          <p className="text-sm text-gray-600">{blog.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No hay blogs disponibles</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Articles Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Artículos
                </h3>
                {articlesLoading ? (
                  <p>Cargando artículos...</p>
                ) : (
                  <div className="space-y-2">
                    {articles?.length > 0 ? (
                      articles.map((article: any) => (
                        <div key={article.id} className="border-l-4 border-green-400 pl-4">
                          <h4 className="font-semibold">{article.title}</h4>
                          <p className="text-sm text-gray-600">{article.excerpt}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No hay artículos disponibles</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
```

## 🔄 Configuración del Router

### 8. App Principal y Router

```tsx
// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

## 🚨 Consideraciones de Seguridad

### 1. Validación en el Frontend

```typescript
// src/utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};
```

### 2. Manejo de Errores

```typescript
// src/utils/errorHandler.ts
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 401) {
    return 'Credenciales inválidas';
  }
  
  if (error.response?.status === 403) {
    return 'No tienes permisos para realizar esta acción';
  }
  
  return 'Ha ocurrido un error inesperado';
};
```

## 🎯 Resumen de Implementación

### Pasos para implementar:

1. **Instalar dependencias** necesarias
2. **Configurar Axios** con interceptores
3. **Crear store de autenticación** con Zustand
4. **Implementar componentes** de login y registro
5. **Configurar rutas protegidas** con guards
6. **Crear hooks personalizados** para datos de API
7. **Configurar React Query** para caching
8. **Implementar dashboard** principal

### Flujo de autenticación:
1. Usuario se autentica → Recibe JWT
2. JWT se almacena en localStorage
3. Axios incluye JWT automáticamente
4. Rutas protegidas validan autenticación
5. Logout limpia estado y redirecciona

Esta implementación proporciona una base sólida y escalable para aplicaciones React modernas con autenticación JWT.