# Vikract NestJS Backend Application
## Blog Backend API with NestJS and PGlite
Sistema de gestión de blog completo con soporte multiidioma, SEO automático y gestión de roles.

-[Vikract NestJS Backend](https://github.com/mjsorribas/vikract-base-app-nestjs-backend) is a based on Nest framework TypeScript starter repository.

## 🚀 Estado del Proyecto

**Versión**: 0.0.1  
**Estado**: ✅ Funcionando completamente  
**Servidor**: http://localhost:3000/api  

Para ver el historial completo de cambios, consulta el [CHANGELOG.md](./docs/CHANGELOG.md).

### Quick Start
```bash
npm install
npm run start:dev
```

## Características

- **🔐 Autenticación JWT**: Sistema completo con tokens JWT y API Keys en base de datos
- **Gestión de Usuarios y Roles**: Admin, Author, Editor, Translator
- **Sistema Multiidioma**: Soporte para múltiples idiomas (español e inglés por defecto)
- **SEO Automático**: Generación automática de meta tags, JSON-LD y URLs amigables
- **Gestión de Contenido**: Blogs, artículos, categorías y tags
- **Estados de Artículo**: Publicado, borrador, no publicado, eliminado (soft delete)
- **Base de Datos**: PGlite integrada para portabilidad
- **Validación**: Validación automática de datos con class-validator

## Instalación

```bash
# Instalar dependencias
npm install

# Construir el proyecto
npm run build

# Iniciar en modo desarrollo
npm run start:dev

# Iniciar en modo producción
npm run start:prod
```

## API Endpoints

### 🔐 Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login con JWT
- `GET /api/auth/profile` - Perfil del usuario (requiere auth)

### 🔑 Gestión de API Keys
- `POST /api/api-keys` - Crear nueva API Key
- `GET /api/api-keys/my-keys` - Mis API Keys
- `PATCH /api/api-keys/:id/deactivate` - Desactivar token
- `DELETE /api/api-keys/:id` - Eliminar token

### 👥 Usuarios y Roles
- `GET /api/users` - Listar usuarios (requiere auth)
- `POST /api/users` - Crear usuario (requiere auth)
- `GET /api/users/:id` - Obtener usuario (requiere auth)
- `PATCH /api/users/:id` - Actualizar usuario (requiere auth)
- `DELETE /api/users/:id` - Eliminar usuario (requiere auth)

### Roles
- `GET /api/roles` - Listar roles
- `POST /api/roles` - Crear rol
- `GET /api/roles/:id` - Obtener rol

### Idiomas
- `GET /api/languages` - Listar idiomas
- `GET /api/languages/active` - Idiomas activos
- `POST /api/languages` - Crear idioma

### Blogs
- `GET /api/blogs` - Listar blogs
- `POST /api/blogs` - Crear blog
- `GET /api/blogs/slug/:slug` - Obtener blog por slug
- `GET /api/blogs/:id` - Obtener blog

### Artículos
- `GET /api/articles` - Listar artículos (requiere auth)
- `GET /api/articles/published` - Artículos publicados (público)
- `POST /api/articles` - Crear artículo (requiere auth)
- `GET /api/articles/slug/:slug` - Obtener artículo por slug (público)
- `PATCH /api/articles/:id/status` - Cambiar estado del artículo (requiere auth)

### Categorías
- `GET /api/categories?lang=es` - Listar categorías por idioma
- `POST /api/categories` - Crear categoría
- `GET /api/categories/slug/:slug?lang=es` - Obtener categoría por slug

### Tags
- `GET /api/tags?lang=es` - Listar tags por idioma
- `POST /api/tags` - Crear tag

## � Usuario por Defecto
```
Email: admin@example.com
Password: admin123
Roles: [Admin]
```

> **Nota**: Cambia las credenciales en producción para mayor seguridad.

## 🗄️ Base de Datos

El proyecto utiliza **PGlite** (PostgreSQL embebido) para máxima portabilidad:
- ✅ No requiere instalación de PostgreSQL
- ✅ Base de datos incluida en el proyecto  
- ✅ Setup inmediato para desarrollo local
- ✅ **Tabla `api_keys`** para gestión avanzada de tokens JWT

> Para detalles técnicos de configuración, consulta [docs/CHANGELOG.md](./docs/CHANGELOG.md) y [docs/PGLITE_ANALYSIS.md](./docs/PGLITE_ANALYSIS.md)

## 🔐 Autenticación

### **Sistema Híbrido JWT + API Keys**
- **JWT Tokens**: Para sesiones de usuario (24 horas de duración)
- **API Keys**: Tokens persistentes en base de datos con gestión avanzada
- **Validación Dual**: Acepta tanto JWT estándar como API Keys

### **Uso de la API**

#### 1. **Autenticación con JWT** (Recomendado para aplicaciones)
```bash
# Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","firstName":"John","lastName":"Doe","username":"johndoe","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Usar token en headers
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/users
```

#### 2. **API Keys** (Recomendado para integraciones)
```bash
# Crear API Key (requiere JWT)
curl -X POST http://localhost:3000/api/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mi Aplicación","expiresAt":"2025-12-31T23:59:59.000Z"}'

# Usar API Key
curl -H "Authorization: Bearer YOUR_API_KEY" http://localhost:3000/api/users
```

### **Endpoints Públicos** (No requieren autenticación)
- `GET /api/` - Información del API
- `GET /api/articles/published` - Artículos publicados
- `GET /api/articles/slug/:slug` - Artículo por slug
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

## 📚 Documentación

- **[docs/CHANGELOG.md](./docs/CHANGELOG.md)** - Historial completo de cambios y versiones
- **[docs/PGLITE_ANALYSIS.md](./docs/PGLITE_ANALYSIS.md)** - Análisis técnico de configuración PGlite
- **[docs/JWT_TESTS_SUMMARY.md](./docs/JWT_TESTS_SUMMARY.md)** - Resumen de tests de autenticación JWT
- **[postman/README.md](./postman/README.md)** - Guía de testing con Postman
- **[postman/TEST_DATA.md](./postman/TEST_DATA.md)** - Datos de prueba para APIs

### 🖥️ Implementación Frontend

Guías completas para integrar con frameworks modernos:

- **[docs/REACT-IMPLEMENTATION.md](./docs/REACT-IMPLEMENTATION.md)** - React 19+ con Zustand y React Query
- **[docs/ANGULAR-IMPLEMENTATION.md](./docs/ANGULAR-IMPLEMENTATION.md)** - Angular 19+ con servicios y guards
- **[docs/VUE-IMPLEMENTATION.md](./docs/VUE-IMPLEMENTATION.md)** - Vue 3+ con Pinia y Composition API
- **[docs/FRONTEND-IMPLEMENTATION.md](./docs/FRONTEND-IMPLEMENTATION.md)** - Guía general multiplataforma

## Autor

- Author - [Maximiliano José Sorribas](https://www.linkedin.com/in/maximilianosorribas/)
- Website - [https://naimara.com/vikract](https://naimara.com/vikract)
- Twitter - [@naimarasoftware](https://twitter.com/naimarasoftware)

## Licencia

Vikract is [MIT licensed](LICENSE).
