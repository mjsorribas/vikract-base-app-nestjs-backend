# API Endpoints - Separación Admin/Public

Este documento describe los endpoints disponibles después de la separación entre endpoints administrativos y públicos.

## 📋 Estructura General

### Endpoints Administrativos
- Requieren autenticación JWT (`@UseGuards(JwtAuthGuard)`)
- Prefijo: `/admin/`
- Operaciones CRUD completas: GET, POST, PATCH, DELETE

### Endpoints Públicos
- No requieren autenticación
- Prefijo: sin prefijo especial (rutas directas)
- Solo operaciones de lectura para contenido publicado/activo

---

## 🏗️ Entidades y Endpoints

### 📄 Pages (Sistema jerárquico completo)
**Admin (requiere autenticación):**
- `POST /admin/pages` - Crear página
- `GET /admin/pages` - Listar todas las páginas
- `GET /admin/pages/hierarchy` - Estructura jerárquica
- `GET /admin/pages/menu/:type` - Estructura de menú (home/footer)
- `GET /admin/pages/parent/:id` - Páginas hijas
- `GET /admin/pages/root` - Páginas raíz
- `GET /admin/pages/:id` - Página por ID
- `GET /admin/pages/slug/:slug` - Página por slug
- `PATCH /admin/pages/:id` - Actualizar página
- `DELETE /admin/pages/:id` - Eliminar página

**Público:**
- `GET /pages` - Páginas publicadas
- `GET /pages/menu/:type` - Menús públicos
- `GET /pages/root` - Páginas raíz publicadas
- `GET /pages/parent/:id` - Páginas hijas publicadas
- `GET /pages/:slug` - Página pública por slug (incrementa contador)

### 📰 Articles
**Admin (requiere autenticación):**
- `POST /admin/articles` - Crear artículo
- `GET /admin/articles` - Listar todos los artículos
- `GET /admin/articles/:id` - Artículo por ID
- `GET /admin/articles/slug/:slug` - Artículo por slug
- `PATCH /admin/articles/:id` - Actualizar artículo
- `PATCH /admin/articles/:id/status` - Actualizar estado
- `DELETE /admin/articles/:id` - Eliminar artículo

**Público:**
- `GET /articles` - Artículos publicados
- `GET /articles/:slug` - Artículo público por slug

### 📂 Categories
**Admin (requiere autenticación):**
- `POST /admin/categories` - Crear categoría
- `GET /admin/categories` - Listar todas las categorías
- `GET /admin/categories/:id` - Categoría por ID
- `GET /admin/categories/slug/:slug` - Categoría por slug
- `PATCH /admin/categories/:id` - Actualizar categoría
- `DELETE /admin/categories/:id` - Eliminar categoría

**Público:**
- `GET /categories` - Categorías activas
- `GET /categories/:slug` - Categoría pública por slug

### 📝 Blogs
**Admin (requiere autenticación):**
- `POST /admin/blogs` - Crear blog
- `GET /admin/blogs` - Listar todos los blogs
- `GET /admin/blogs/:id` - Blog por ID
- `GET /admin/blogs/slug/:slug` - Blog por slug
- `PATCH /admin/blogs/:id` - Actualizar blog
- `DELETE /admin/blogs/:id` - Eliminar blog

**Público:**
- `GET /blogs` - Blogs activos
- `GET /blogs/:slug` - Blog público por slug

### 🏷️ Tags
**Admin (requiere autenticación):**
- `POST /admin/tags` - Crear tag
- `GET /admin/tags` - Listar todos los tags
- `GET /admin/tags/:id` - Tag por ID
- `GET /admin/tags/slug/:slug` - Tag por slug
- `PATCH /admin/tags/:id` - Actualizar tag
- `DELETE /admin/tags/:id` - Eliminar tag

**Público:**
- `GET /tags` - Tags activos
- `GET /tags/:slug` - Tag público por slug

### 🎠 Carousels
**Admin (requiere autenticación):**
- `POST /admin/carousels` - Crear carousel
- `GET /admin/carousels` - Listar todos los carousels
- `GET /admin/carousels/article/:articleId` - Carousels por artículo
- `GET /admin/carousels/page/:pageId` - Carousels por página
- `GET /admin/carousels/:id` - Carousel por ID
- `PATCH /admin/carousels/:id` - Actualizar carousel
- `PATCH /admin/carousels/:id/reorder` - Reordenar slides
- `DELETE /admin/carousels/:id` - Eliminar carousel

**Público:**
- `GET /carousels` - Carousels activos
- `GET /carousels/article/:articleId` - Carousels por artículo
- `GET /carousels/page/:pageId` - Carousels por página
- `GET /carousels/:id` - Carousel por ID

### 🌐 Languages
**Admin (requiere autenticación):**
- `POST /admin/languages` - Crear idioma
- `GET /admin/languages` - Listar todos los idiomas
- `GET /admin/languages/:id` - Idioma por ID
- `PATCH /admin/languages/:id` - Actualizar idioma
- `DELETE /admin/languages/:id` - Eliminar idioma

**Público:**
- `GET /languages` - Idiomas activos
- `GET /languages/default` - Idioma por defecto

### 👥 Users (Solo Admin)
**Admin (requiere autenticación):**
- `POST /admin/users` - Crear usuario
- `GET /admin/users` - Listar todos los usuarios
- `GET /admin/users/:id` - Usuario por ID
- `PATCH /admin/users/:id` - Actualizar usuario
- `DELETE /admin/users/:id` - Eliminar usuario

### 🔐 Roles (Solo Admin)
**Admin (requiere autenticación):**
- `POST /admin/roles` - Crear rol
- `GET /admin/roles` - Listar todos los roles
- `GET /admin/roles/:id` - Rol por ID
- `PATCH /admin/roles/:id` - Actualizar rol
- `DELETE /admin/roles/:id` - Eliminar rol

---

## 🔐 Autenticación

### Admin Endpoints
Requieren header de autorización:
```
Authorization: Bearer <jwt_token>
```

### Public Endpoints
No requieren autenticación, acceso libre para contenido público.

---

## 📊 Entidades ya separadas previamente

Las siguientes entidades ya tenían separación correcta:

### 🛍️ Products
- **Admin:** `/admin/products/*`
- **Público:** `/products/*`

### 🏷️ Product Categories
- **Admin:** `/admin/product-categories/*`
- **Público:** `/categories/*` (productos)

### 🏢 Brands
- **Admin:** `/admin/brands/*`
- **Público:** `/brands/*`

---

## ✅ Estado Final

**✅ Completamente separado:**
- Pages ✅
- Articles ✅
- Categories ✅
- Blogs ✅
- Tags ✅
- Carousels ✅
- Languages ✅
- Users ✅ (solo admin)
- Roles ✅ (solo admin)
- Products ✅ (ya estaba)
- Product Categories ✅ (ya estaba)
- Brands ✅ (ya estaba)

**🔧 Otros endpoints:**
- Auth: `/auth/*` (login, register, etc.)
- Storage: `/storage/*` y `/uploads/*`
- API Keys: Solo para uso interno

Todas las entidades ahora siguen el patrón de separación admin/public solicitado.