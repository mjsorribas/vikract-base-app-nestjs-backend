# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-10-28

### Added
- **🔐 JWT Authentication System**: Sistema completo de autenticación con JWT
  - Endpoints de registro y login (`/api/auth/register`, `/api/auth/login`)
  - JWT Strategy con Passport para validación de tokens
  - Tokens JWT con expiración de 24 horas
  - Perfil de usuario autenticado (`/api/auth/profile`)

- **🔑 API Keys Management**: Gestión avanzada de API Keys en base de datos
  - Tabla `api_keys` con campos: token hash, nombre, expiración, último uso, scopes
  - Endpoints CRUD para gestión de API Keys (`/api/api-keys/*`)
  - Validación dual: JWT estándar + API Keys con hash SHA-256
  - Revocación individual de tokens y auditoría completa
  - Scopes personalizados para permisos granulares

- **🛡️ Security Enhancements**: Mejoras de seguridad integral
  - JWT Guard global con protección automática de endpoints
  - Decorador `@Public()` para endpoints que no requieren autenticación
  - Endpoints públicos: artículos publicados y consulta por slug
  - Hash SHA-256 para tokens API Keys en base de datos
  - Validación de expiración y desactivación de tokens

### Security
- **JWT Secret**: Configuración de clave secreta para firma de tokens
- **Password Hashing**: Uso de bcryptjs para hash seguro de contraseñas
- **Token Validation**: Validación robusta con soporte para Bearer tokens
- **API Rate Protection**: Base preparada para limitación de requests

### Dependencies
- **@nestjs/jwt**: v10.2.0 - Gestión de JWT tokens
- **passport-jwt**: v4.0.1 - Strategy de autenticación JWT
- **@types/passport-jwt**: v3.0.13 - Tipos TypeScript para passport-jwt

## [0.0.1] - 2025-10-28

### Added
- Configuración inicial del proyecto NestJS con TypeScript
- Sistema de gestión completo de blog con soporte multiidioma
- Autenticación y gestión de usuarios con roles (Admin, Author, Editor, Translator)
- Gestión de contenido: Blogs, artículos, categorías y tags
- Soporte multiidioma con traducciones automáticas
- Sistema SEO automático con meta tags y JSON-LD
- Estados de artículo: draft, published, archived con soft delete
- Configuración de base de datos PGlite embebida
- Validación automática de datos con class-validator
- API RESTful completa con endpoints CRUD
- Sistema de seeding automático para datos iniciales
- Tests unitarios completos para controladores (45 tests)
- Colección de Postman para testing de APIs
- Documentación completa del proyecto

### Database
- **PGlite Integration**: Configuración híbrida con @electric-sql/pglite v0.3.11
- **TypeORM**: Soporte con better-sqlite3 driver para máxima compatibilidad
- **Persistent Storage**: Base de datos embebida en `./pglite_db/`
- **Automatic Seeding**: Datos iniciales (roles, idiomas, usuario admin)

### API Endpoints
- **Authentication & Users**: `/api/users` - CRUD completo
- **Roles Management**: `/api/roles` - Gestión de roles
- **Multi-language**: `/api/languages` - Soporte de idiomas
- **Blog Management**: `/api/blogs` - Gestión de blogs
- **Content Management**: `/api/articles` - Artículos con filtros avanzados
- **Categorization**: `/api/categories` - Categorías con traducciones
- **Tagging**: `/api/tags` - Sistema de etiquetas
- **SEO Features**: Slugs automáticos, meta tags, JSON-LD

### Entities
- **User Entity**: email, firstName, lastName, username, password, roles, timestamps
- **Role Entity**: name, description, permissions, timestamps, soft delete
- **Blog Entity**: title, description, owner, active status, timestamps
- **Article Entity**: title, slug, status, content, author, blog, categories, tags
- **Category/Tag Entities**: Soporte multiidioma con traducciones
- **Language Entity**: code, name, isDefault, isActive
- **Translation Entities**: ArticleTranslation, CategoryTranslation, TagTranslation

### Dependencies Added
- `@electric-sql/pglite`: ^0.3.11 - Base de datos PostgreSQL embebida
- `better-sqlite3`: ^12.4.1 - Driver SQLite para TypeORM
- `pg`: ^8.16.3 - Driver PostgreSQL nativo
- `@types/better-sqlite3`: ^7.6.13 - Tipos TypeScript para better-sqlite3
- `@types/pg`: ^8.15.6 - Tipos TypeScript para pg
- `@nestjs/typeorm`: ^11.0.0 - Integración TypeORM con NestJS
- `@nestjs/config`: ^3.2.2 - Gestión de configuración
- `@nestjs/passport`: ^10.0.3 - Sistema de autenticación
- `bcryptjs`: ^3.0.2 - Hash de contraseñas
- `class-validator`: ^0.14.2 - Validación de datos
- `class-transformer`: ^0.5.1 - Transformación de objetos
- `slug`: ^11.0.1 - Generación de slugs SEO-friendly
- `uuid`: ^13.0.0 - Generación de UUIDs

### Testing
- **Unit Tests**: 45 tests para controladores completamente funcionales
- **Test Coverage**: Cobertura completa de controladores
- **Mocking**: Sistema de mocks para servicios y repositorios
- **Jest Configuration**: Configuración personalizada con soporte para ES modules

### Documentation
- **README.md**: Documentación completa del proyecto
- **API Documentation**: Endpoints y ejemplos de uso
- **Database Schema**: Documentación de entidades y relaciones
- **Postman Collection**: Colección completa para testing de APIs
- **Development Guide**: Guía de instalación y desarrollo

### Configuration
- **TypeScript**: Configuración avanzada con paths mapping
- **ESLint & Prettier**: Formateo y linting automático
- **Jest**: Configuración de testing con coverage
- **Environment**: Variables de entorno para desarrollo y producción
- **Build Process**: Compilación optimizada para producción

### Infrastructure
- **Docker Ready**: Estructura preparada para contenedorización
- **Environment Variables**: Configuración flexible por entorno
- **Logging**: Sistema de logs estructurado
- **Error Handling**: Manejo centralizado de errores
- **CORS**: Configuración de CORS para frontend

### Security
- **Password Hashing**: Hash seguro de contraseñas con bcrypt
- **Input Validation**: Validación estricta de todas las entradas
- **Role-based Access**: Sistema de permisos basado en roles
- **Soft Delete**: Eliminación segura sin pérdida de datos

### Performance
- **Database Optimization**: Índices y relaciones optimizadas
- **Lazy Loading**: Carga perezosa de relaciones
- **Pagination**: Soporte para paginación en listados
- **Caching**: Preparado para implementación de caché

### Fixes Applied
- **Post-merge Review**: Corrección de duplicaciones en AppModule
- **Entity Fields**: Adición de campos faltantes en User y Role entities
- **DTO Validation**: Corrección de DTOs con campos requeridos
- **Build Process**: Resolución de errores de compilación TypeScript
- **Test Compatibility**: Corrección de mocks para ES modules
- **Database Schema**: Migración de enum a varchar para compatibilidad

### Known Issues
- Service unit tests requieren actualización de mocks tras cambio de configuración de DB
- Algunos tests de servicios fallan por dependencias de repositorio no mockeadas

### Technical Notes
- **Database Strategy**: Enfoque híbrido PGlite + better-sqlite3 para máxima compatibilidad
- **TypeORM Compatibility**: Uso de better-sqlite3 como driver principal
- **PostgreSQL Features**: Acceso a funciones avanzadas vía PGliteService
- **Development Experience**: Setup inmediato sin dependencias externas