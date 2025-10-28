# Angular 19+ - JWT Authentication Implementation Guide

## 📋 Resumen Ejecutivo

Esta guía proporciona una implementación completa de autenticación JWT para aplicaciones **Angular 19+** que se conecten con la API NestJS desarrollada.

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
ng add @angular/material
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools

# O con yarn
yarn add @ngrx/store @ngrx/effects @ngrx/store-devtools

# Para manejo de formularios reactivos
ng add @angular/forms
```

## 🔧 Configuración Base

### 1. Interfaces y Modelos

```typescript
// src/app/models/auth.models.ts
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

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
```

### 2. Servicio de API

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

### 3. Servicio de Autenticación

```typescript
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';

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
      this.getProfile().subscribe({
        error: () => this.logout()
      });
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

### 4. Interceptor HTTP

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

### 5. Guard de Autenticación

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

## 🔒 Componentes de Autenticación

### 6. Componente de Login

```typescript
// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
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

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

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

```html
<!-- src/app/components/login/login.component.html -->
<div class="login-container">
  <mat-card class="login-card">
    <mat-card-header>
      <mat-card-title>Iniciar Sesión</mat-card-title>
    </mat-card-header>

    <mat-card-content>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" required>
          <mat-error *ngIf="email?.hasError('required')">
            Email es requerido
          </mat-error>
          <mat-error *ngIf="email?.hasError('email')">
            Email inválido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Contraseña</mat-label>
          <input matInput type="password" formControlName="password" required>
          <mat-error *ngIf="password?.hasError('required')">
            Contraseña es requerida
          </mat-error>
        </mat-form-field>

        <mat-error *ngIf="error" class="error-message">
          {{ error }}
        </mat-error>

        <button 
          mat-raised-button 
          color="primary" 
          type="submit" 
          [disabled]="loginForm.invalid || loading" 
          class="full-width submit-button">
          {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <div class="register-link">
        ¿No tienes cuenta? 
        <a routerLink="/register" mat-button color="primary">Regístrate aquí</a>
      </div>
    </mat-card-content>
  </mat-card>
</div>
```

```scss
/* src/app/components/login/login.component.scss */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-card {
  max-width: 400px;
  width: 100%;
}

.full-width {
  width: 100%;
  margin-bottom: 16px;
}

.submit-button {
  margin-top: 16px;
}

.error-message {
  color: #f44336;
  margin: 16px 0;
  display: block;
}

.register-link {
  text-align: center;
  margin-top: 16px;
}
```

### 7. Componente de Registro

```typescript
// src/app/components/register/register.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';

      this.authService.register(this.registerForm.value).subscribe({
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

```html
<!-- src/app/components/register/register.component.html -->
<div class="register-container">
  <mat-card class="register-card">
    <mat-card-header>
      <mat-card-title>Crear Cuenta</mat-card-title>
    </mat-card-header>

    <mat-card-content>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="name-row">
          <mat-form-field appearance="fill" class="half-width">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="firstName" required>
            <mat-error *ngIf="firstName?.hasError('required')">
              Nombre es requerido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="half-width">
            <mat-label>Apellido</mat-label>
            <input matInput formControlName="lastName" required>
            <mat-error *ngIf="lastName?.hasError('required')">
              Apellido es requerido
            </mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nombre de usuario</mat-label>
          <input matInput formControlName="username" required>
          <mat-error *ngIf="username?.hasError('required')">
            Nombre de usuario es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" required>
          <mat-error *ngIf="email?.hasError('required')">
            Email es requerido
          </mat-error>
          <mat-error *ngIf="email?.hasError('email')">
            Email inválido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Contraseña</mat-label>
          <input matInput type="password" formControlName="password" required>
          <mat-error *ngIf="password?.hasError('required')">
            Contraseña es requerida
          </mat-error>
          <mat-error *ngIf="password?.hasError('minlength')">
            Contraseña debe tener al menos 8 caracteres
          </mat-error>
        </mat-form-field>

        <mat-error *ngIf="error" class="error-message">
          {{ error }}
        </mat-error>

        <button 
          mat-raised-button 
          color="primary" 
          type="submit" 
          [disabled]="registerForm.invalid || loading" 
          class="full-width submit-button">
          {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
        </button>
      </form>

      <div class="login-link">
        ¿Ya tienes cuenta? 
        <a routerLink="/login" mat-button color="primary">Inicia sesión aquí</a>
      </div>
    </mat-card-content>
  </mat-card>
</div>
```

```scss
/* src/app/components/register/register.component.scss */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.register-card {
  max-width: 450px;
  width: 100%;
}

.name-row {
  display: flex;
  gap: 16px;
}

.half-width {
  flex: 1;
}

.full-width {
  width: 100%;
  margin-bottom: 16px;
}

.submit-button {
  margin-top: 16px;
}

.error-message {
  color: #f44336;
  margin: 16px 0;
  display: block;
}

.login-link {
  text-align: center;
  margin-top: 16px;
}
```

## 🖥️ Componente Dashboard

### 8. Dashboard Principal

```typescript
// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/auth.models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user$: Observable<User | null>;
  blogs: any[] = [];
  articles: any[] = [];
  loading = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {
    this.user$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    // Cargar blogs
    this.apiService.get<any[]>('/blogs').subscribe({
      next: (blogs) => {
        this.blogs = blogs;
      },
      error: (error) => {
        console.error('Error cargando blogs:', error);
      }
    });

    // Cargar artículos
    this.apiService.get<any[]>('/articles').subscribe({
      next: (articles) => {
        this.articles = articles;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando artículos:', error);
        this.loading = false;
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
```

```html
<!-- src/app/components/dashboard/dashboard.component.html -->
<div class="dashboard-container">
  <!-- Header -->
  <mat-toolbar color="primary">
    <span>Dashboard</span>
    <span class="spacer"></span>
    <div *ngIf="user$ | async as user" class="user-info">
      <span>Hola, {{ user.firstName }} {{ user.lastName }}</span>
      <button mat-button (click)="logout()">
        <mat-icon>logout</mat-icon>
        Cerrar Sesión
      </button>
    </div>
  </mat-toolbar>

  <!-- Main Content -->
  <div class="content">
    <div class="grid-container">
      <!-- Blogs Section -->
      <mat-card class="data-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>article</mat-icon>
            Blogs
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="loading" class="loading">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Cargando blogs...</p>
          </div>
          
          <div *ngIf="!loading && blogs.length > 0" class="items-list">
            <div *ngFor="let blog of blogs" class="item">
              <h4>{{ blog.title }}</h4>
              <p>{{ blog.description }}</p>
              <mat-chip-list>
                <mat-chip color="primary" selected>Blog</mat-chip>
              </mat-chip-list>
            </div>
          </div>
          
          <div *ngIf="!loading && blogs.length === 0" class="no-data">
            <mat-icon>info</mat-icon>
            <p>No hay blogs disponibles</p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Articles Section -->
      <mat-card class="data-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>description</mat-icon>
            Artículos
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="loading" class="loading">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Cargando artículos...</p>
          </div>
          
          <div *ngIf="!loading && articles.length > 0" class="items-list">
            <div *ngFor="let article of articles" class="item">
              <h4>{{ article.title }}</h4>
              <p>{{ article.excerpt }}</p>
              <mat-chip-list>
                <mat-chip color="accent" selected>Artículo</mat-chip>
              </mat-chip-list>
            </div>
          </div>
          
          <div *ngIf="!loading && articles.length === 0" class="no-data">
            <mat-icon>info</mat-icon>
            <p>No hay artículos disponibles</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  </div>
</div>
```

```scss
/* src/app/components/dashboard/dashboard.component.scss */
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.spacer {
  flex: 1 1 auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.content {
  padding: 24px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.data-card {
  min-height: 300px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  
  p {
    margin-top: 16px;
    color: #666;
  }
}

.items-list {
  .item {
    border-left: 4px solid #3f51b5;
    padding: 16px;
    margin-bottom: 16px;
    background-color: #fafafa;
    border-radius: 4px;
    
    h4 {
      margin: 0 0 8px 0;
      font-weight: 500;
    }
    
    p {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }
  }
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #666;
  
  mat-icon {
    font-size: 48px;
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
  }
}
```

## 🔄 Configuración del Módulo y Routing

### 9. App Routing Module

```typescript
// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

### 10. App Module Principal

```typescript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    
    // Angular Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
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

## 🚨 Consideraciones de Seguridad

### 1. Validadores Personalizados

```typescript
// src/app/validators/custom-validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null;
      }

      const hasNumber = /[0-9]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasSpecial = /[#?!@$%^&*-]/.test(value);
      
      const valid = hasNumber && hasUpper && hasLower && hasSpecial && value.length >= 8;
      
      if (!valid) {
        return { strongPassword: true };
      }
      
      return null;
    };
  }

  static noWhitespace(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isWhitespace = (control.value || '').trim().length === 0;
      return isWhitespace ? { whitespace: true } : null;
    };
  }
}
```

### 2. Manejo de Errores

```typescript
// src/app/services/error-handler.service.ts
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: HttpErrorResponse): string {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Credenciales inválidas';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor';
    }

    this.showError(errorMessage);
    return errorMessage;
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}
```

## 🎯 Resumen de Implementación

### Pasos para implementar:

1. **Crear proyecto Angular** con Material Design
2. **Configurar módulos** e interceptores HTTP
3. **Implementar servicios** de autenticación y API
4. **Crear guards** para rutas protegidas
5. **Desarrollar componentes** de login, registro y dashboard
6. **Configurar routing** con protección
7. **Añadir manejo de errores** y validaciones

### Estructura del proyecto:
```
src/app/
├── components/
│   ├── login/
│   ├── register/
│   └── dashboard/
├── services/
│   ├── auth.service.ts
│   ├── api.service.ts
│   └── error-handler.service.ts
├── guards/
│   └── auth.guard.ts
├── interceptors/
│   └── auth.interceptor.ts
├── models/
│   └── auth.models.ts
└── validators/
    └── custom-validators.ts
```

### Flujo de autenticación:
1. Usuario se autentica → Recibe JWT
2. JWT se almacena en localStorage
3. Interceptor añade JWT a requests automáticamente
4. Guards protegen rutas según autenticación
5. Manejo automático de errores y redirecciones

Esta implementación proporciona una base robusta y escalable para aplicaciones Angular empresariales con autenticación JWT completa.