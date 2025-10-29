# Colección de Postman - API Documentation

Esta colección de Postman contiene todos los endpoints disponibles en la API del sistema.

## 📁 Estructura de la Colección

### 1. **Authentication**
- Login de usuarios
- Registro de nuevos usuarios
- Renovación de tokens JWT
- Logout

### 2. **Users**
- CRUD completo de usuarios
- Gestión de perfiles
- Cambio de contraseñas
- Activación/desactivación de cuentas

### 3. **Roles**
- Gestión de roles del sistema
- Asignación de permisos
- Endpoints administrativos

### 4. **Languages**
- Gestión de idiomas soportados
- Configuración multiidioma

### 5. **API Keys**
- Generación y gestión de claves API
- Control de acceso por aplicaciones

### 6. **Blogs**
- CRUD completo de blogs
- Gestión de estado (activo/inactivo)
- Endpoints públicos y administrativos

### 7. **Articles**
- Gestión completa de artículos
- Publicación y borradores
- Asociación con blogs y categorías
- Sistema de tags

### 8. **Categories**
- Categorías de artículos
- Jerarquía y organización
- Endpoints públicos y administrativos

### 9. **Tags**
- Sistema de etiquetas
- Asociación con artículos
- Gestión completa

### 10. **Storage**
- Carga de archivos
- Gestión de archivos por blog/usuario
- Estadísticas de almacenamiento
- Filtrado por tipo de archivo

### 11. **Carousels**
- Carruseles de imágenes para artículos
- Gestión de slides
- Reordenamiento
- Control de estado

### 12. **Product Categories**
- Categorías de productos
- Endpoints administrativos y públicos
- Gestión completa con CRUD

### 13. **Products**
- **Sistema completo de productos**
- Gestión de inventario
- Precios y ofertas
- Asociación con categorías y marcas
- Control de stock
- Productos por categoría y marca

### 14. **Brands** ⭐ **NUEVO**
- **Sistema completo de marcas**
- CRUD administrativo completo
- Endpoints públicos
- Asociación many-to-many con categorías
- Información completa (logo, sitio web, país de origen)
- Gestión de relaciones categoría-marca

## 🔧 Configuración del Entorno

### Variables de Entorno
Configura las siguientes variables en Postman:

```
baseUrl: http://localhost:3000
jwt_token: [Se configura automáticamente tras login]
```

### Variables Dinámicas
- `{{baseUrl}}`: URL base de la API
- `{{jwt_token}}`: Token JWT para autenticación
- Varios UUIDs de ejemplo para IDs de entidades

## 🚀 Cómo Usar la Colección

### 1. Importar la Colección
1. Abre Postman
2. Haz clic en "Import"
3. Selecciona el archivo `postman-collection.json`
4. La colección se importará con todas las carpetas organizadas

### 2. Configurar Autenticación
1. Ejecuta el endpoint `Authentication > Login` con credenciales válidas
2. El token JWT se guarda automáticamente en `{{jwt_token}}`
3. Los endpoints protegidos usarán automáticamente este token

### 3. Flujo Recomendado de Pruebas

#### Para Productos y Marcas:
```
1. Login → Authentication > Login
2. Crear Categoría → Product Categories > Admin - Create Category
3. Crear Marca → Brands > Admin - Create Brand
4. Asociar Categorías a Marca → Brands > Admin - Add Categories to Brand
5. Crear Producto → Products > Admin - Create Product
6. Consultar Productos por Marca → Products > Public - Get Products by Brand
```

#### Para Blogs y Artículos:
```
1. Login → Authentication > Login
2. Crear Blog → Blogs > Admin - Create Blog
3. Crear Categoría → Categories > Admin - Create Category
4. Crear Artículo → Articles > Admin - Create Article
5. Subir Imagen → Storage > Upload File
6. Ver Artículos Públicos → Articles > Public - Get Published Articles
```

## 📋 Endpoints por Módulo

### Brands (Marcas) - Nuevos Endpoints
- **Admin Endpoints:**
  - `POST /admin/brands` - Crear marca
  - `GET /admin/brands` - Listar todas las marcas
  - `GET /admin/brands/:id` - Obtener marca por ID
  - `PATCH /admin/brands/:id` - Actualizar marca
  - `DELETE /admin/brands/:id` - Eliminar marca
  - `POST /admin/brands/:id/categories` - Añadir categorías a marca
  - `DELETE /admin/brands/:id/categories` - Remover categorías de marca

- **Public Endpoints:**
  - `GET /public/brands` - Obtener marcas activas
  - `GET /public/brands/:slug` - Obtener marca por slug
  - `GET /public/brands/category/:categoryId` - Marcas por categoría

### Products (Productos) - Actualizados
- Ahora incluyen soporte para `brandId`
- Filtrado por marca disponible
- Relaciones con marcas en respuestas

## 🔒 Autenticación

Todos los endpoints administrativos requieren autenticación JWT:
```
Authorization: Bearer {{jwt_token}}
```

Los endpoints públicos no requieren autenticación.

## 📝 Ejemplos de Request Bodies

### Crear Marca
```json
{
  "name": "Apple",
  "slug": "apple",
  "description": "Technology company focused on consumer electronics",
  "logoUrl": "https://example.com/apple-logo.png",
  "websiteUrl": "https://apple.com",
  "countryOfOrigin": "USA",
  "foundedYear": 1976,
  "isActive": true,
  "sortOrder": 1,
  "categoryIds": ["electronics-uuid", "smartphones-uuid"]
}
```

### Crear Producto con Marca
```json
{
  "name": "iPhone 15 Pro",
  "productCode": "APL-IP15P-128",
  "slug": "iphone-15-pro",
  "shortDescription": "El iPhone más avanzado",
  "salePrice": 999.99,
  "categoryId": "category-uuid",
  "brandId": "brand-uuid",
  "isActive": true
}
```

## 🎯 Testing y Validación

La colección incluye:
- ✅ Todos los endpoints documentados
- ✅ Headers correctos para autenticación
- ✅ Request bodies de ejemplo
- ✅ Variables de entorno configuradas
- ✅ Organización por módulos
- ✅ Endpoints públicos y administrativos separados

## 📚 Notas Adicionales

1. **IDs de Ejemplo**: Reemplaza los UUIDs de ejemplo con IDs reales de tu base de datos
2. **Paginación**: Muchos endpoints soportan parámetros de paginación
3. **Filtros**: Los endpoints GET incluyen parámetros de filtrado opcionales
4. **Validación**: Todos los endpoints incluyen validación de datos
5. **Relaciones**: Las respuestas incluyen relaciones cuando es apropiado

## 🔧 Troubleshooting

- **Token Expirado**: Re-ejecuta el login para obtener un nuevo token
- **404 Not Found**: Verifica que la URL base esté correcta
- **403 Forbidden**: Asegúrate de estar autenticado y tener los permisos necesarios
- **Validation Errors**: Revisa que los request bodies cumplan con el schema requerido

---

**Última actualización**: Incluye el nuevo sistema de marcas con relaciones many-to-many con categorías y one-to-many con productos.