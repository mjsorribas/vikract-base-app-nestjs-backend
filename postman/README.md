# Pruebas de API con Postman

Este directorio contiene los archivos de Postman para testear todos los endpoints del API de Vikract Blog.

## Archivos incluidos

- `Vikract-Blog-API.postman_collection.json` - Colección completa con todos los endpoints
- `Vikract-Blog-Development.postman_environment.json` - Entorno de desarrollo con variables

## Cómo usar

### 1. Importar en Postman

1. Abrir Postman
2. Hacer clic en "Import" (importar)
3. Seleccionar ambos archivos JSON desde este directorio
4. La colección y el entorno aparecerán en tu workspace

### 2. Configurar el entorno

1. Seleccionar el entorno "Vikract Blog Development" en la esquina superior derecha
2. La URL base está configurada como `http://localhost:3000/api`
3. Las variables para IDs se configurarán automáticamente al ejecutar las pruebas

### 3. Ejecutar las pruebas

#### Orden recomendado para las primeras pruebas:

1. **Health Check** - Verificar que el API está funcionando
2. **Roles** - Crear roles primero (necesarios para usuarios)
3. **Users** - Crear usuarios (necesarios como autores/propietarios)
4. **Languages** - Crear idiomas (necesarios para traducciones)
5. **Blogs** - Crear blogs (necesarios para artículos)
6. **Categories** - Crear categorías para organizar artículos
7. **Tags** - Crear tags para etiquetar artículos
8. **Articles** - Crear, actualizar y gestionar artículos

#### Variables dinámicas:

Después de crear recursos, copia los IDs de las respuestas y asígnalos a las variables del entorno:
- `roleId` - ID del rol creado
- `userId` - ID del usuario creado
- `languageId` - ID del idioma creado
- `blogId` - ID del blog creado
- `categoryId` - ID de la categoría creada
- `tagId` - ID del tag creado
- `articleId` - ID del artículo creado

## Endpoints incluidos

### 🏥 Health Check
- `GET /` - Verificar estado del API

### 👥 Roles
- `GET /roles` - Obtener todos los roles
- `POST /roles` - Crear rol
- `GET /roles/:id` - Obtener rol por ID
- `PATCH /roles/:id` - Actualizar rol
- `DELETE /roles/:id` - Eliminar rol

### 👤 Users
- `GET /users` - Obtener todos los usuarios
- `POST /users` - Crear usuario
- `GET /users/:id` - Obtener usuario por ID
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

### 🌍 Languages
- `GET /languages` - Obtener todos los idiomas
- `GET /languages/active` - Obtener idiomas activos
- `GET /languages/default` - Obtener idioma por defecto
- `POST /languages` - Crear idioma
- `GET /languages/:id` - Obtener idioma por ID
- `PATCH /languages/:id` - Actualizar idioma
- `DELETE /languages/:id` - Eliminar idioma

### 📝 Blogs
- `GET /blogs` - Obtener todos los blogs
- `GET /blogs/active` - Obtener blogs activos
- `POST /blogs` - Crear blog
- `GET /blogs/:id` - Obtener blog por ID
- `PATCH /blogs/:id` - Actualizar blog
- `DELETE /blogs/:id` - Eliminar blog

### 📂 Categories
- `GET /categories` - Obtener todas las categorías
- `POST /categories` - Crear categoría
- `GET /categories/:id` - Obtener categoría por ID
- `PATCH /categories/:id` - Actualizar categoría
- `DELETE /categories/:id` - Eliminar categoría

### 🏷️ Tags
- `GET /tags` - Obtener todos los tags
- `POST /tags` - Crear tag
- `GET /tags/:id` - Obtener tag por ID
- `PATCH /tags/:id` - Actualizar tag
- `DELETE /tags/:id` - Eliminar tag

### 📄 Articles
- `GET /articles` - Obtener todos los artículos
- `GET /articles/published` - Obtener artículos publicados
- `POST /articles` - Crear artículo
- `GET /articles/:id` - Obtener artículo por ID
- `PATCH /articles/:id` - Actualizar artículo
- `PATCH /articles/:id` - Publicar artículo
- `PATCH /articles/:id` - Despublicar artículo
- `DELETE /articles/:id` - Eliminar artículo

### 🔍 Search & Filtering
- `GET /articles?blogId=:id` - Artículos por blog
- `GET /articles?categoryId=:id` - Artículos por categoría
- `GET /articles?tagId=:id` - Artículos por tag
- `GET /articles?authorId=:id` - Artículos por autor

## Ejemplos de datos de prueba

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

- Todos los endpoints de eliminación son "soft delete" (no borran físicamente el registro)
- Los artículos tienen estados: `draft`, `published`, `archived`
- Las categorías y tags soportan traducciones en múltiples idiomas
- Los usuarios pueden tener múltiples roles
- Los blogs pertenecen a un propietario (usuario)

## Configuración de desarrollo

Asegúrate de que el servidor esté corriendo en `http://localhost:3000` antes de ejecutar las pruebas:

```bash
npm run start:dev
```

El API estará disponible en `http://localhost:3000/api`.