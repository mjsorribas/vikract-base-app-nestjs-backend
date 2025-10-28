# Pruebas de API con Postman

Este directorio contiene los archivos de Postman para testear todos los endpoints del API de Vikract Blog con autenticación JWT.

## Archivos incluidos

- `Vikract-Blog-API.postman_collection.json` - Colección completa con todos los endpoints y autenticación JWT
- `Vikract-Blog-Development.postman_environment.json` - Entorno de desarrollo con variables y tokens JWT
- `JWT_AUTHENTICATION_GUIDE.md` - Guía detallada sobre el uso de autenticación JWT

## Cómo usar

### 1. Importar en Postman

1. Abrir Postman
2. Hacer clic en "Import" (importar)
3. Seleccionar ambos archivos JSON desde este directorio
4. La colección y el entorno aparecerán en tu workspace

### 2. Configurar el entorno

1. Seleccionar el entorno "Vikract Blog Development" en la esquina superior derecha
2. La URL base está configurada como `http://localhost:3000/api`
3. Configurar credenciales de administrador:
   - `adminEmail`: tu email de administrador
   - `adminPassword`: tu contraseña de administrador
4. Los tokens JWT se guardarán automáticamente al hacer login

### 3. Flujo de Autenticación JWT

⚠️ **IMPORTANTE**: La mayoría de endpoints requieren autenticación JWT. Sigue este orden:

1. **Registro/Login** - Obtener token JWT
2. **El token se guarda automáticamente** en la variable `access_token`
3. **Usar endpoints protegidos** - El token se envía automáticamente

#### Primer uso:

1. **🔐 Authentication** → **Register User** - Crear cuenta
2. **🔐 Authentication** → **Login User** - Obtener token (se guarda automáticamente)
3. Ahora puedes usar cualquier endpoint protegido

#### Uso continuo:

- Si el token expira (24 horas), simplemente usa **Login User** nuevamente
- También puedes usar **🔑 API Keys** para autenticación persistente

### 4. Ejecutar las pruebas

#### Orden recomendado para las primeras pruebas:

1. **🏥 Health Check** - Verificar que el API está funcionando (público)
2. **🔐 Authentication** - Register/Login para obtener token JWT
3. **👥 Roles** - Crear roles (protegido con JWT)
4. **👤 Users** - Gestionar usuarios (protegido con JWT)
5. **🌍 Languages** - Crear idiomas (protegido con JWT)
6. **📝 Blogs** - Crear blogs (protegido con JWT)
7. **📂 Categories** - Crear categorías (protegido con JWT)
8. **🏷️ Tags** - Crear tags (protegido con JWT)
9. **📄 Articles** - Crear y gestionar artículos (protegido con JWT)

#### Variables dinámicas:

Los tokens JWT se gestionan automáticamente. Para otros recursos, copia los IDs de las respuestas:
- `access_token` - Token JWT (se guarda automáticamente al hacer login)
- `api_key` - Clave API persistente (opcional)
- `roleId` - ID del rol creado
- `userId` - ID del usuario creado
- `languageId` - ID del idioma creado
- `blogId` - ID del blog creado
- `categoryId` - ID de la categoría creada
- `tagId` - ID del tag creado
- `articleId` - ID del artículo creado

## Endpoints incluidos

### 🏥 Health Check (Públicos)
- `GET /` - Verificar estado del API

### � Authentication (JWT)
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión (guarda token automáticamente)
- `GET /auth/profile` - Obtener perfil del usuario autenticado
- `POST /auth/refresh` - Renovar token JWT

### 🔑 API Keys Management
- `GET /api-keys` - Obtener claves API del usuario
- `POST /api-keys` - Crear nueva clave API
- `DELETE /api-keys/:id` - Eliminar clave API

### �👥 Roles (Protegidos con JWT)
- `GET /roles` - Obtener todos los roles
- `POST /roles` - Crear rol
- `GET /roles/:id` - Obtener rol por ID
- `PATCH /roles/:id` - Actualizar rol
- `DELETE /roles/:id` - Eliminar rol

### 👤 Users (Protegidos con JWT)
- `GET /users` - Obtener todos los usuarios
- `POST /users` - Crear usuario
- `GET /users/:id` - Obtener usuario por ID
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

### 🌍 Languages (Protegidos con JWT)
- `GET /languages` - Obtener todos los idiomas
- `GET /languages/active` - Obtener idiomas activos
- `GET /languages/default` - Obtener idioma por defecto
- `POST /languages` - Crear idioma
- `GET /languages/:id` - Obtener idioma por ID
- `PATCH /languages/:id` - Actualizar idioma
- `DELETE /languages/:id` - Eliminar idioma

### 📝 Blogs (Protegidos con JWT)
- `GET /blogs` - Obtener todos los blogs
- `GET /blogs/active` - Obtener blogs activos
- `POST /blogs` - Crear blog
- `GET /blogs/:id` - Obtener blog por ID
- `PATCH /blogs/:id` - Actualizar blog
- `DELETE /blogs/:id` - Eliminar blog

### 📂 Categories (Protegidos con JWT)
- `GET /categories` - Obtener todas las categorías
- `POST /categories` - Crear categoría
- `GET /categories/:id` - Obtener categoría por ID
- `PATCH /categories/:id` - Actualizar categoría
- `DELETE /categories/:id` - Eliminar categoría

### 🏷️ Tags (Protegidos con JWT)
- `GET /tags` - Obtener todos los tags
- `POST /tags` - Crear tag
- `GET /tags/:id` - Obtener tag por ID
- `PATCH /tags/:id` - Actualizar tag
- `DELETE /tags/:id` - Eliminar tag

### 📄 Articles (Protegidos con JWT)
- `GET /articles` - Obtener todos los artículos
- `GET /articles/published` - Obtener artículos publicados
- `POST /articles` - Crear artículo
- `GET /articles/:id` - Obtener artículo por ID
- `PATCH /articles/:id` - Actualizar artículo
- `PATCH /articles/:id` - Publicar artículo
- `PATCH /articles/:id` - Despublicar artículo
- `DELETE /articles/:id` - Eliminar artículo

### 🔍 Search & Filtering (Públicos)
- `GET /articles?blogId=:id` - Artículos por blog
- `GET /articles?categoryId=:id` - Artículos por categoría
- `GET /articles?tagId=:id` - Artículos por tag
- `GET /articles?authorId=:id` - Artículos por autor

## Autenticación

### JWT Tokens
- **Duración**: 24 horas
- **Guardado automático**: El token se guarda en la variable `access_token` al hacer login
- **Uso automático**: Todos los endpoints protegidos usan el token automáticamente
- **Renovación**: Hacer login nuevamente cuando el token expire

### API Keys (Alternativa)
- **Persistencia**: No expiran (hasta que las elimines)
- **Gestión**: Crear/eliminar desde la sección 🔑 API Keys Management
- **Uso manual**: Copia la API key y úsala en el header `x-api-key` si prefieres no usar JWT

## Ejemplos de datos de prueba

### Registrar usuario (Authentication)
```json
{
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User",
  "username": "admin",
  "password": "admin123"
}
```

### Login (Authentication)
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Crear un rol
```json
{
  "name": "editor",
  "description": "Editor role for content management",
  "permissions": ["read", "write", "edit"]
}
```

### Crear un usuario
```json
{
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "password": "securePassword123",
  "roleIds": ["{{roleId}}"]
}
```

### Crear un idioma
```json
{
  "code": "fr",
  "name": "Français",
  "isDefault": false,
  "isActive": true
}
```

### Crear un blog
```json
{
  "title": "My Technology Blog",
  "description": "A blog about the latest technology trends",
  "ownerId": "{{userId}}"
}
```

### Crear una categoría con traducciones
```json
{
  "name": "Technology",
  "description": "Articles about technology and innovation",
  "translations": [
    {
      "languageCode": "es",
      "name": "Tecnología",
      "description": "Artículos sobre tecnología e innovación"
    }
  ]
}
```

### Crear un artículo completo
```json
{
  "title": "Introduction to NestJS",
  "excerpt": "Learn the basics of NestJS framework",
  "content": "NestJS is a progressive Node.js framework...",
  "authorId": "{{userId}}",
  "blogId": "{{blogId}}",
  "categoryIds": ["{{categoryId}}"],
  "tagIds": ["{{tagId}}"],
  "translations": [
    {
      "languageCode": "es",
      "title": "Introducción a NestJS",
      "excerpt": "Aprende los fundamentos del framework NestJS",
      "content": "NestJS es un framework progresivo de Node.js..."
    }
  ]
}
```

## Notas importantes

### Autenticación y Seguridad
- **La mayoría de endpoints requieren autenticación JWT**
- Los tokens JWT expiran en 24 horas (usa login para renovar)
- Las API Keys no expiran pero se pueden revocar
- Los endpoints públicos son: Health Check y algunos de consulta de artículos

### Datos y Estados
- Todos los endpoints de eliminación son "soft delete" (no borran físicamente el registro)
- Los artículos tienen estados: `draft`, `published`, `archived`
- Las categorías y tags soportan traducciones en múltiples idiomas
- Los usuarios pueden tener múltiples roles
- Los blogs pertenecen a un propietario (usuario)

### Flujo de trabajo recomendado
1. **Autenticarse primero** (Register → Login)
2. **Crear estructura básica** (Roles → Users → Languages)
3. **Crear contenido** (Blogs → Categories → Tags → Articles)
4. **Los tokens se gestionan automáticamente** en Postman

## Configuración de desarrollo

Asegúrate de que el servidor esté corriendo en `http://localhost:3000` antes de ejecutar las pruebas:

```bash
npm run start:dev
```

El API estará disponible en `http://localhost:3000/api`.

## Documentación adicional

- Ver `JWT_AUTHENTICATION_GUIDE.md` para detalles sobre autenticación JWT
- Consultar `/docs` para guías de implementación frontend (React, Angular, Vue)