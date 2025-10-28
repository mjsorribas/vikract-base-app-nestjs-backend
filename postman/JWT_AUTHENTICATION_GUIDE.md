# 🔐 Guía de Autenticación JWT - Postman Collection

## 📋 Resumen de Actualización

La colección de Postman ha sido **completamente actualizada** para usar **autenticación JWT** en lugar de acceso sin restricciones. Todos los endpoints protegidos ahora requieren un token de autenticación válido.

## 🚀 Flujo de Autenticación

### 1. **Primera vez - Login Admin**
```
1. Ejecutar: "🔐 Authentication" → "Login Admin"
2. El token se guarda automáticamente en {{access_token}}
3. Usar este token para todas las demás operaciones
```

### 2. **Crear nuevos usuarios**
```
1. Ejecutar: "🔐 Authentication" → "Register User"
2. O usar: "Users" → "Create User" (requiere auth admin)
3. Luego login con las nuevas credenciales
```

## 🔑 Variables de Entorno Actualizadas

### Variables Nuevas:
```json
{
  "access_token": "",           // JWT token (se llena automáticamente)
  "adminEmail": "admin@example.com",
  "adminPassword": "admin123",
  "api_key": ""                 // Para API Keys (opcional)
}
```

### Variables Existentes:
```json
{
  "baseUrl": "http://localhost:3000/api",
  "userId": "",
  "roleId": "",
  "blogId": "",
  "categoryId": "",
  "tagId": "",
  "articleId": "",
  "languageId": ""
}
```

## 📚 Estructura de la Colección Actualizada

### 🔐 **Authentication** (Nuevo)
- **Register User** - Registro + auto-login
- **Login Admin** - Login con credenciales admin
- **Login Custom User** - Login personalizado
- **Get Profile** - Verificar usuario autenticado

### 🔑 **API Keys Management** (Nuevo)
- **Create API Key** - Crear token persistente
- **Get My API Keys** - Listar mis tokens

### 🏠 **Health Check** (Sin cambios)
- **API Health** - Verificar estado del API

### 👥 **Roles** (Autenticación requerida)
- ✅ **Get All Roles** - Requiere JWT
- ✅ **Create Role** - Requiere JWT  
- ✅ **Get Role by ID** - Requiere JWT

### 👤 **Users** (Autenticación requerida)
- ✅ **Get All Users** - Requiere JWT
- ✅ **Create User** - Requiere JWT
- ✅ **Get User by ID** - Requiere JWT
- ✅ **Update User** - Requiere JWT
- ✅ **Delete User** - Requiere JWT

### 🌍 **Languages** (Público)
- ⚪ **Get All Languages** - Público
- ⚪ **Get Active Languages** - Público
- ✅ **Create Language** - Requiere JWT

### 📚 **Blogs** (Autenticación requerida)
- ✅ **Get All Blogs** - Requiere JWT
- ⚪ **Get Active Blogs** - Público
- ✅ **Create Blog** - Requiere JWT
- ✅ **Get Blog by ID** - Requiere JWT
- ✅ **Update Blog** - Requiere JWT
- ✅ **Delete Blog** - Requiere JWT

### 📁 **Categories** (Mixto)
- ⚪ **Get All Categories** - Público (con ?lang=)
- ✅ **Create Category** - Requiere JWT
- ✅ **Get Category by ID** - Requiere JWT
- ✅ **Update Category** - Requiere JWT
- ✅ **Delete Category** - Requiere JWT

### 🏷️ **Tags** (Mixto)
- ⚪ **Get All Tags** - Público (con ?lang=)
- ✅ **Create Tag** - Requiere JWT
- ✅ **Get Tag by ID** - Requiere JWT
- ✅ **Update Tag** - Requiere JWT
- ✅ **Delete Tag** - Requiere JWT

### 📄 **Articles** (Mixto)
- ✅ **Get All Articles** - Requiere JWT
- ⚪ **Get Published Articles** - Público
- ✅ **Create Article** - Requiere JWT
- ✅ **Get Article by ID** - Requiere JWT
- ⚪ **Get Article by Slug** - Público
- ✅ **Update Article** - Requiere JWT
- ✅ **Delete Article** - Requiere JWT

## 🎯 Endpoints Públicos vs Protegidos

### ⚪ **Endpoints Públicos** (No requieren autenticación):
```
GET  /                          # Health check
GET  /languages                 # Listar idiomas
GET  /languages/active          # Idiomas activos
GET  /blogs/active              # Blogs activos
GET  /categories?lang=es        # Categorías públicas
GET  /categories/slug/:slug     # Categoría por slug
GET  /tags?lang=es              # Tags públicos  
GET  /tags/slug/:slug           # Tag por slug
GET  /articles/published        # Artículos publicados
GET  /articles/slug/:slug       # Artículo por slug
POST /auth/register             # Registro de usuarios
POST /auth/login                # Login
```

### ✅ **Endpoints Protegidos** (Requieren JWT):
```
GET  /auth/profile              # Perfil del usuario
GET  /roles                     # Gestión de roles
GET  /users                     # Gestión de usuarios
GET  /blogs                     # Gestión de blogs
GET  /articles                  # Gestión de artículos
POST /categories                # Crear/modificar categorías
POST /tags                      # Crear/modificar tags
POST /api-keys                  # Gestión de API Keys
```

## 📝 Uso Paso a Paso

### **Paso 1: Configurar Environment**
1. Importar `Vikract-Blog-Development.postman_environment.json`
2. Verificar que `baseUrl` apunte a tu servidor

### **Paso 2: Autenticarse**
1. Ir a "🔐 Authentication" → "Login Admin"
2. Ejecutar la petición
3. Verificar que `{{access_token}}` se llenó automáticamente

### **Paso 3: Testear Endpoints**
1. Probar endpoints públicos sin autenticación
2. Usar endpoints protegidos con el token obtenido
3. El token se renueva automáticamente en cada login

### **Paso 4: Crear Datos de Prueba**
```
1. Languages → Create Language (si es necesario)
2. Roles → Create Role (si es necesario)  
3. Users → Create User
4. Blogs → Create Blog
5. Categories → Create Category
6. Tags → Create Tag
7. Articles → Create Article
```

## 🔄 Scripts de Automatización

### **Auto-save Token**
Cada request de login incluye un script que guarda automáticamente el token:

```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set('access_token', response.access_token);
    pm.environment.set('userId', response.user.id);
    console.log('Token saved automatically');
}
```

### **Auto-save IDs**
Los requests de creación guardan automáticamente los IDs para usar en otros endpoints.

## ⚠️ Consideraciones Importantes

### **Expiración de Tokens**
- Los JWT expiran en **24 horas**
- Si recibes error 401, volver a hacer login
- Los API Keys son persistentes hasta que se eliminen

### **Roles y Permisos**
- El usuario `admin@example.com` tiene permisos completos
- Otros usuarios pueden tener limitaciones según sus roles
- Verificar permisos si un endpoint falla con 403

### **Endpoints Públicos**
- No necesitan autenticación
- Útiles para probar el frontend sin login
- Limitados a operaciones de lectura

## 🆘 Troubleshooting

### **Error 401 Unauthorized**
```
Solución: Ejecutar login nuevamente
Verificar: Token en {{access_token}}
```

### **Error 403 Forbidden**
```
Solución: Verificar permisos del usuario
Usar: Cuenta admin para operaciones administrativas
```

### **Error 404 Not Found**
```
Verificar: URL del endpoint
Verificar: Que el recurso existe (crear primero)
```

### **Token no se guarda**
```
Verificar: Script de post-request en login
Verificar: Formato de respuesta del servidor
```

## 🎉 ¡Listo para usar!

La colección está completamente configurada para trabajar con el nuevo sistema de autenticación JWT. Todos los endpoints están organizados, documentados y listos para probar la funcionalidad completa del API.