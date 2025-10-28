# Vue 3+ - JWT Authentication Implementation Guide

## 📋 Resumen Ejecutivo

Esta guía proporciona una implementación completa de autenticación JWT para aplicaciones **Vue 3+** que se conecten con la API NestJS desarrollada, utilizando Composition API y las mejores prácticas modernas.

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
# Dependencias principales
npm install @vueuse/core pinia axios vue-router@4

# O con yarn
yarn add @vueuse/core pinia axios vue-router@4

# Dependencias para UI (opcional pero recomendado)
npm install @headlessui/vue @heroicons/vue tailwindcss
# O usar Vuetify
npm install vuetify@next @mdi/font
```

## 🔧 Configuración Base

### 1. Tipos e Interfaces

```typescript
// src/types/auth.ts
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

export interface ApiError {
  message: string;
  statusCode: number;
  error: string;
}
```

### 2. Configuración de Axios

```typescript
// src/lib/api.ts
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

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
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. Store de Autenticación con Pinia

```typescript
// src/stores/auth.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '@/lib/api';
import router from '@/router';
import type { User, AuthResponse, LoginCredentials, RegisterData } from '@/types/auth';

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
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);

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

      await router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Credenciales inválidas';
      error.value = errorMessage;
      throw new Error(errorMessage);
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

      await router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error en el registro';
      error.value = errorMessage;
      throw new Error(errorMessage);
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

  const clearError = () => {
    error.value = null;
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
    isLoading,
    hasError,
    
    // Actions
    login,
    register,
    getProfile,
    logout,
    clearError,
    initializeAuth,
  };
});
```

## 📊 Composables para API

### 4. Composable para peticiones API

```typescript
// src/composables/useApi.ts
import { ref, computed } from 'vue';
import { apiClient } from '@/lib/api';
import type { AxiosResponse, AxiosError } from 'axios';

export function useApi<T = any>() {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);
  const hasData = computed(() => !!data.value);

  const execute = async <R = T>(request: () => Promise<AxiosResponse<R>>): Promise<R> => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await request();
      data.value = response.data as unknown as T;
      
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      error.value = axiosError.response?.data?.message || axiosError.message || 'Error en la petición';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const get = <R = T>(endpoint: string) => 
    execute<R>(() => apiClient.get<R>(endpoint));
  
  const post = <R = T>(endpoint: string, payload: any) => 
    execute<R>(() => apiClient.post<R>(endpoint, payload));
  
  const put = <R = T>(endpoint: string, payload: any) => 
    execute<R>(() => apiClient.put<R>(endpoint, payload));
  
  const del = <R = T>(endpoint: string) => 
    execute<R>(() => apiClient.delete<R>(endpoint));

  const reset = () => {
    data.value = null;
    error.value = null;
    loading.value = false;
  };

  return {
    data,
    loading: isLoading,
    error,
    hasError,
    hasData,
    get,
    post,
    put,
    delete: del,
    reset,
  };
}
```

### 5. Composables específicos para datos

```typescript
// src/composables/useBlogs.ts
import { ref, onMounted } from 'vue';
import { useApi } from './useApi';

export function useBlogs() {
  const api = useApi();
  const blogs = ref([]);

  const fetchBlogs = async () => {
    try {
      const data = await api.get('/blogs');
      blogs.value = data;
      return data;
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  };

  const createBlog = async (blogData: any) => {
    try {
      const newBlog = await api.post('/blogs', blogData);
      blogs.value = [...blogs.value, newBlog];
      return newBlog;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  };

  const updateBlog = async (id: string, blogData: any) => {
    try {
      const updatedBlog = await api.put(`/blogs/${id}`, blogData);
      const index = blogs.value.findIndex((blog: any) => blog.id === id);
      if (index !== -1) {
        blogs.value[index] = updatedBlog;
      }
      return updatedBlog;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  };

  const deleteBlog = async (id: string) => {
    try {
      await api.delete(`/blogs/${id}`);
      blogs.value = blogs.value.filter((blog: any) => blog.id !== id);
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  };

  onMounted(() => {
    fetchBlogs();
  });

  return {
    blogs,
    loading: api.loading,
    error: api.error,
    fetchBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
  };
}
```

```typescript
// src/composables/useArticles.ts
import { ref, onMounted } from 'vue';
import { useApi } from './useApi';

export function useArticles() {
  const api = useApi();
  const articles = ref([]);

  const fetchArticles = async () => {
    try {
      const data = await api.get('/articles');
      articles.value = data;
      return data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  };

  const createArticle = async (articleData: any) => {
    try {
      const newArticle = await api.post('/articles', articleData);
      articles.value = [...articles.value, newArticle];
      return newArticle;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  };

  const updateArticle = async (id: string, articleData: any) => {
    try {
      const updatedArticle = await api.put(`/articles/${id}`, articleData);
      const index = articles.value.findIndex((article: any) => article.id === id);
      if (index !== -1) {
        articles.value[index] = updatedArticle;
      }
      return updatedArticle;
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      await api.delete(`/articles/${id}`);
      articles.value = articles.value.filter((article: any) => article.id !== id);
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  };

  onMounted(() => {
    fetchArticles();
  });

  return {
    articles,
    loading: api.loading,
    error: api.error,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
  };
}
```

## 🔒 Componentes de Autenticación

### 6. Componente de Login

```vue
<!-- src/views/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2 class="login-title">Iniciar Sesión</h2>
        <p class="login-subtitle">Accede a tu cuenta</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            :disabled="authStore.isLoading"
            class="form-input"
            :class="{ 'input-error': emailError }"
            @blur="validateEmail"
          />
          <span v-if="emailError" class="field-error">{{ emailError }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            :disabled="authStore.isLoading"
            class="form-input"
            :class="{ 'input-error': passwordError }"
            @blur="validatePassword"
          />
          <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
        </div>

        <div v-if="authStore.error" class="error-message">
          <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading || !isFormValid"
          class="login-button"
        >
          <svg v-if="authStore.isLoading" class="spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
          </svg>
          {{ authStore.isLoading ? 'Iniciando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <div class="register-link">
        ¿No tienes cuenta? 
        <router-link to="/register" class="link">Regístrate aquí</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
});

const emailError = ref('');
const passwordError = ref('');

const isFormValid = computed(() => 
  form.email.trim() !== '' && 
  form.password.trim() !== '' && 
  !emailError.value && 
  !passwordError.value
);

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email) {
    emailError.value = 'Email es requerido';
  } else if (!emailRegex.test(form.email)) {
    emailError.value = 'Email inválido';
  } else {
    emailError.value = '';
  }
};

const validatePassword = () => {
  if (!form.password) {
    passwordError.value = 'Contraseña es requerida';
  } else if (form.password.length < 6) {
    passwordError.value = 'Contraseña debe tener al menos 6 caracteres';
  } else {
    passwordError.value = '';
  }
};

const handleLogin = async () => {
  validateEmail();
  validatePassword();
  
  if (!isFormValid.value) return;

  try {
    await authStore.login({
      email: form.email,
      password: form.password,
    });
  } catch (error) {
    // Error ya manejado en el store
  }
};

onMounted(() => {
  authStore.clearError();
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.login-subtitle {
  color: #6b7280;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background-color: #f9fafb;
  opacity: 0.6;
  cursor: not-allowed;
}

.input-error {
  border-color: #ef4444;
}

.field-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.error-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  margin-top: 0.5rem;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>
```

### 7. Componente de Registro

```vue
<!-- src/views/Register.vue -->
<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h2 class="register-title">Crear Cuenta</h2>
        <p class="register-subtitle">Únete a nuestra plataforma</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="name-row">
          <div class="form-group">
            <label for="firstName" class="form-label">Nombre</label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              :disabled="authStore.isLoading"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="lastName" class="form-label">Apellido</label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              :disabled="authStore.isLoading"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="username" class="form-label">Nombre de usuario</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            :disabled="authStore.isLoading"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            :disabled="authStore.isLoading"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            :disabled="authStore.isLoading"
            class="form-input"
          />
          <span class="password-hint">Mínimo 8 caracteres</span>
        </div>

        <div v-if="authStore.error" class="error-message">
          <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading || !isFormValid"
          class="register-button"
        >
          <svg v-if="authStore.isLoading" class="spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
          </svg>
          {{ authStore.isLoading ? 'Registrando...' : 'Crear Cuenta' }}
        </button>
      </form>

      <div class="login-link">
        ¿Ya tienes cuenta? 
        <router-link to="/login" class="link">Inicia sesión aquí</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const form = reactive({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
});

const isFormValid = computed(() => 
  form.firstName.trim() !== '' &&
  form.lastName.trim() !== '' &&
  form.username.trim() !== '' &&
  form.email.trim() !== '' &&
  form.password.length >= 8
);

const handleRegister = async () => {
  if (!isFormValid.value) return;

  try {
    await authStore.register(form);
  } catch (error) {
    // Error ya manejado en el store
  }
};

onMounted(() => {
  authStore.clearError();
});
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.register-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 450px;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.register-subtitle {
  color: #6b7280;
  margin: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.name-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background-color: #f9fafb;
  opacity: 0.6;
  cursor: not-allowed;
}

.password-hint {
  color: #6b7280;
  font-size: 0.75rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.error-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.register-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  margin-top: 0.5rem;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>
```

## 🖥️ Componente Dashboard

### 8. Dashboard Principal

```vue
<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">Dashboard</h1>
        <div class="user-menu">
          <div class="user-info">
            <span class="user-greeting">Hola, {{ authStore.fullName }}</span>
            <button @click="handleLogout" class="logout-button">
              <svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-main">
      <div class="dashboard-grid">
        <!-- Blogs Section -->
        <section class="data-section">
          <div class="section-header">
            <h2 class="section-title">
              <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Blogs
            </h2>
            <span class="section-count">{{ blogsData.blogs.value?.length || 0 }}</span>
          </div>
          
          <div class="section-content">
            <div v-if="blogsData.loading.value" class="loading-state">
              <div class="spinner-large"></div>
              <p>Cargando blogs...</p>
            </div>
            
            <div v-else-if="blogsData.error.value" class="error-state">
              <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <p>{{ blogsData.error.value }}</p>
              <button @click="blogsData.fetchBlogs" class="retry-button">Reintentar</button>
            </div>
            
            <div v-else-if="blogsData.blogs.value?.length > 0" class="items-grid">
              <div v-for="blog in blogsData.blogs.value" :key="blog.id" class="item-card blog-card">
                <h3 class="item-title">{{ blog.title }}</h3>
                <p class="item-description">{{ blog.description }}</p>
                <div class="item-meta">
                  <span class="item-badge blog-badge">Blog</span>
                  <span class="item-date">{{ formatDate(blog.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-state">
              <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No hay blogs disponibles</p>
            </div>
          </div>
        </section>

        <!-- Articles Section -->
        <section class="data-section">
          <div class="section-header">
            <h2 class="section-title">
              <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Artículos
            </h2>
            <span class="section-count">{{ articlesData.articles.value?.length || 0 }}</span>
          </div>
          
          <div class="section-content">
            <div v-if="articlesData.loading.value" class="loading-state">
              <div class="spinner-large"></div>
              <p>Cargando artículos...</p>
            </div>
            
            <div v-else-if="articlesData.error.value" class="error-state">
              <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <p>{{ articlesData.error.value }}</p>
              <button @click="articlesData.fetchArticles" class="retry-button">Reintentar</button>
            </div>
            
            <div v-else-if="articlesData.articles.value?.length > 0" class="items-grid">
              <div v-for="article in articlesData.articles.value" :key="article.id" class="item-card article-card">
                <h3 class="item-title">{{ article.title }}</h3>
                <p class="item-description">{{ article.excerpt }}</p>
                <div class="item-meta">
                  <span class="item-badge article-badge">Artículo</span>
                  <span class="item-date">{{ formatDate(article.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-state">
              <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No hay artículos disponibles</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useBlogs } from '@/composables/useBlogs';
import { useArticles } from '@/composables/useArticles';

const authStore = useAuthStore();
const blogsData = useBlogs();
const articlesData = useArticles();

const handleLogout = () => {
  authStore.logout();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f8fafc;
}

.dashboard-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-greeting {
  color: #64748b;
  font-size: 0.875rem;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background: #dc2626;
}

.logout-icon {
  width: 1rem;
  height: 1rem;
}

.dashboard-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.data-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.section-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.section-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #3b82f6;
}

.section-count {
  background: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.section-content {
  padding: 1.5rem;
  min-height: 300px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #64748b;
  min-height: 200px;
}

.spinner-large {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #ef4444;
  min-height: 200px;
}

.error-icon {
  width: 3rem;
  height: 3rem;
}

.retry-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.retry-button:hover {
  background: #2563eb;
}

.items-grid {
  display: grid;
  gap: 1rem;
}

.item-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.item-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.blog-card {
  border-left: 4px solid #3b82f6;
}

.article-card {
  border-left: 4px solid #10b981;
}

.item-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.item-description {
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.blog-badge {
  background: #dbeafe;
  color: #1e40af;
}

.article-badge {
  background: #d1fae5;
  color: #065f46;
}

.item-date {
  color: #94a3b8;
  font-size: 0.875rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #94a3b8;
  min-height: 200px;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
}
</style>
```

## 🔄 Router y Guards

### 9. Guards de Navegación

```typescript
// src/router/guards.ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
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

### 10. Configuración del Router

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { authGuard, guestGuard } from './guards';

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    beforeEnter: guestGuard,
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    beforeEnter: guestGuard,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    beforeEnter: authGuard,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/dashboard',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

### 11. Configuración Principal de la App

```typescript
// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';
import './style.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Inicializar autenticación al arrancar la app
const authStore = useAuthStore();
authStore.initializeAuth();

// Manejar logout en múltiples pestañas
window.addEventListener('storage', (e) => {
  if (e.key === 'access_token' && !e.newValue) {
    authStore.logout();
  }
});

app.mount('#app');
```

## 🚨 Consideraciones de Seguridad

### 1. Validadores de Formularios

```typescript
// src/utils/validators.ts
export const validators = {
  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email es requerido';
    if (!emailRegex.test(value)) return 'Email inválido';
    return null;
  },

  password: (value: string): string | null => {
    if (!value) return 'Contraseña es requerida';
    if (value.length < 8) return 'Contraseña debe tener al menos 8 caracteres';
    return null;
  },

  required: (value: string, fieldName: string): string | null => {
    if (!value || value.trim().length === 0) {
      return `${fieldName} es requerido`;
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (value.length < min) {
      return `${fieldName} debe tener al menos ${min} caracteres`;
    }
    return null;
  },
};
```

### 2. Manejo de Errores Global

```typescript
// src/utils/errorHandler.ts
import type { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error: string;
}

export const handleApiError = (error: AxiosError<ApiErrorResponse>): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  switch (error.response?.status) {
    case 401:
      return 'Credenciales inválidas';
    case 403:
      return 'No tienes permisos para realizar esta acción';
    case 404:
      return 'Recurso no encontrado';
    case 422:
      return 'Datos inválidos';
    case 500:
      return 'Error interno del servidor';
    default:
      return 'Ha ocurrido un error inesperado';
  }
};
```

## 🎯 Resumen de Implementación

### Pasos para implementar:

1. **Crear proyecto Vue 3** con Vite o Vue CLI
2. **Instalar dependencias** (Pinia, Vue Router, Axios)
3. **Configurar Pinia** para gestión de estado
4. **Implementar store de autenticación** con Composition API
5. **Crear composables** para peticiones API
6. **Desarrollar componentes** de autenticación
7. **Configurar router** con guards de navegación
8. **Implementar dashboard** con datos protegidos

### Estructura del proyecto:
```
src/
├── components/
├── composables/
│   ├── useApi.ts
│   ├── useBlogs.ts
│   └── useArticles.ts
├── lib/
│   └── api.ts
├── router/
│   ├── index.ts
│   └── guards.ts
├── stores/
│   └── auth.ts
├── types/
│   └── auth.ts
├── utils/
│   ├── validators.ts
│   └── errorHandler.ts
├── views/
│   ├── Login.vue
│   ├── Register.vue
│   └── Dashboard.vue
└── main.ts
```

### Flujo de autenticación:
1. Usuario se autentica → Recibe JWT
2. JWT se almacena en localStorage
3. Axios incluye JWT automáticamente en requests
4. Router guards protegen rutas según autenticación
5. Composables manejan estado de carga y errores
6. Logout sincronizado entre pestañas

Esta implementación proporciona una base moderna y reactiva para aplicaciones Vue 3 con autenticación JWT completa, utilizando las mejores prácticas del ecosistema Vue.