# Vikract NestJS Backend Application
## Blog Backend API with NestJS and PGlite
Sistema de gestión de blog completo con soporte multiidioma, SEO automático y gestión de roles.

-[Vikract NestJS Backend](https://github.com/mjsorribas/vikract-base-app-nestjs-backend) is a based on Nest framework TypeScript starter repository.

## 🚀 Estado del Proyecto

**Versión**: 0.0.1  
**Estado**: ✅ Funcionando completamente  
**Servidor**: http://localhost:3000/api  

Para ver el historial completo de cambios, consulta el [CHANGELOG.md](./CHANGELOG.md).

### Quick Start
```bash
npm install
npm run start:dev
```

## Características

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

### Autenticación y Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/:id` - Obtener usuario
- `PATCH /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

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
- `GET /api/articles` - Listar artículos (con filtros)
- `GET /api/articles/published` - Artículos publicados
- `POST /api/articles` - Crear artículo
- `GET /api/articles/slug/:slug` - Obtener artículo por slug
- `PATCH /api/articles/:id/status` - Cambiar estado del artículo

### Categorías
- `GET /api/categories?lang=es` - Listar categorías por idioma
- `POST /api/categories` - Crear categoría
- `GET /api/categories/slug/:slug?lang=es` - Obtener categoría por slug

### Tags
- `GET /api/tags?lang=es` - Listar tags por idioma
- `POST /api/tags` - Crear tag

## 🗄️ Base de Datos

El proyecto utiliza **PGlite** (PostgreSQL embebido) para máxima portabilidad:
- ✅ No requiere instalación de PostgreSQL
- ✅ Base de datos incluida en el proyecto  
- ✅ Setup inmediato para desarrollo local

> Para detalles técnicos de configuración, consulta [CHANGELOG.md](./CHANGELOG.md) y [docs/PGLITE_ANALYSIS.md](./docs/PGLITE_ANALYSIS.md)

## Usuario por Defecto
```
Email: admin@example.com
Password: admin123
Roles: [Admin]
```

## 📚 Documentación

- **[CHANGELOG.md](./CHANGELOG.md)** - Historial completo de cambios y versiones
- **[docs/PGLITE_ANALYSIS.md](./docs/PGLITE_ANALYSIS.md)** - Análisis técnico de configuración PGlite
- **[postman/README.md](./postman/README.md)** - Guía de testing con Postman
- **[postman/TEST_DATA.md](./postman/TEST_DATA.md)** - Datos de prueba para APIs

## Autor

- Author - [Maximiliano José Sorribas](https://www.linkedin.com/in/maximilianosorribas/)
- Website - [https://naimara.com/vikract](https://naimara.com/vikract)
- Twitter - [@naimarasoftware](https://twitter.com/naimarasoftware)

## Licencia

Vikract is [MIT licensed](LICENSE).
