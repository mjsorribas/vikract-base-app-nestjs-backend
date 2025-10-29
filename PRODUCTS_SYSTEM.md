# Sistema de Gestión de Productos

## Descripción General

Este sistema proporciona una solución completa para la gestión de productos con categorías, soporte multimedia y endpoints diferenciados para administradores y usuarios públicos.

## Características Principales

### Categorías de Productos
- **Gestión completa**: Crear, leer, actualizar y eliminar categorías
- **Slug único**: URLs amigables para SEO
- **Estado activo/inactivo**: Control de visibilidad
- **Orden personalizable**: Sorting por orden y nombre
- **Relación con productos**: Una categoría puede tener múltiples productos

### Productos
- **Información completa**: Nombre, código, descripciones corta y larga
- **Precios flexibles**: Precio de venta, precio de oferta, control de ofertas activas
- **Gestión de inventario**: Stock disponible, límite de stock, alertas automáticas
- **Características físicas**: Peso, tamaño, medidas
- **Opciones de entrega**: Envío a domicilio y retiro en local/sucursal
- **URLs amigables**: Slug único para SEO
- **Propiedades computadas**: 
  - `isInStock`: Calcula automáticamente si hay stock
  - `currentPrice`: Devuelve el precio actual (oferta o regular)
  - `isOnSale`: Indica si está en oferta activa

### Sistema de Medios
- **Imágenes**: Hasta 10 imágenes por producto
- **Videos**: Hasta 5 videos por producto
- **Thumbnails**: Soporte para miniaturas small, medium y large
- **Orden personalizable**: Sorting de medios
- **Tipos validados**: Imagen principal y video principal distinguidos

## Estructura de Base de Datos

### Entidades

#### ProductCategory
```typescript
{
  id: string (UUID)
  name: string
  slug: string (único)
  description?: string
  imageUrl?: string
  isActive: boolean (default: true)
  sortOrder: number (default: 0)
  products: Product[] (relación)
  createdAt: Date
  updatedAt: Date
}
```

#### Product
```typescript
{
  id: string (UUID)
  name: string
  productCode: string (único)
  shortDescription: string
  longDescription: string
  salePrice: number
  offerPrice?: number
  isOfferActive: boolean (default: false)
  availableStock: number
  weight: number
  size: string
  slug: string (único)
  stockLimit: number
  hasShipping: boolean (default: true)
  hasPickup: boolean (default: true)
  purchasePrice: number
  isActive: boolean (default: true)
  categoryId: string
  category: ProductCategory (relación)
  media: ProductMedia[] (relación)
  // Propiedades computadas
  isInStock: boolean
  currentPrice: number
  isOnSale: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### ProductMedia
```typescript
{
  id: string (UUID)
  type: 'image' | 'video'
  fileUrl: string
  thumbnailSmallUrl: string
  thumbnailMediumUrl: string
  thumbnailLargeUrl: string
  sortOrder: number (default: 0)
  productId: string
  product: Product (relación)
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

### Administración (Admin)

#### Categorías de Productos
- `GET /admin/product-categories` - Listar todas las categorías
- `GET /admin/product-categories/:id` - Obtener categoría por ID
- `POST /admin/product-categories` - Crear nueva categoría
- `PATCH /admin/product-categories/:id` - Actualizar categoría
- `DELETE /admin/product-categories/:id` - Eliminar categoría

#### Productos
- `GET /admin/products` - Listar todos los productos (con datos sensibles)
- `GET /admin/products/:id` - Obtener producto por ID (con datos sensibles)
- `POST /admin/products` - Crear nuevo producto
- `PATCH /admin/products/:id` - Actualizar producto
- `DELETE /admin/products/:id` - Eliminar producto
- `PATCH /admin/products/:id/stock` - Actualizar stock

### Usuario Público

#### Categorías de Productos
- `GET /public/product-categories` - Listar categorías activas
- `GET /public/product-categories/:slug` - Obtener categoría por slug

#### Productos
- `GET /public/products` - Listar productos activos (sin datos sensibles)
- `GET /public/products/:slug` - Obtener producto por slug (sin datos sensibles)
- `GET /public/products/category/:categoryId` - Productos por categoría

### Diferencias entre Endpoints

#### Datos Administrativos (Solo Admin)
- `purchasePrice`: Precio de compra
- `stockLimit`: Límite mínimo de stock
- Productos inactivos
- Categorías inactivas

#### Datos Públicos
- Excluye información sensible de precios y stock
- Solo productos y categorías activos
- Incluye propiedades computadas (`isInStock`, `currentPrice`, `isOnSale`)

## DTOs (Data Transfer Objects)

### CreateProductDto
```typescript
{
  name: string
  productCode: string
  shortDescription: string
  longDescription: string
  salePrice: number
  offerPrice?: number
  isOfferActive?: boolean
  availableStock: number
  weight: number
  size: string
  slug: string
  stockLimit: number
  hasShipping?: boolean
  hasPickup?: boolean
  purchasePrice: number
  isActive?: boolean
  categoryId: string
  media?: CreateProductMediaDto[]
}
```

### PublicProductDto
```typescript
{
  id: string
  name: string
  productCode: string
  shortDescription: string
  longDescription: string
  salePrice: number
  offerPrice?: number
  isOfferActive: boolean
  availableStock: number
  weight: number
  size: string
  slug: string
  hasShipping: boolean
  hasPickup: boolean
  isActive: boolean
  categoryId: string
  category: ProductCategory
  media: ProductMedia[]
  // Propiedades computadas
  isInStock: boolean
  currentPrice: number
  isOnSale: boolean
  createdAt: Date
  updatedAt: Date
  // EXCLUYE: purchasePrice, stockLimit
}
```

## Validaciones

### Productos
- Nombre: obligatorio, mínimo 3 caracteres
- Código de producto: obligatorio, único
- Precios: números positivos
- Stock: número entero positivo
- Slug: único, formato URL amigable
- Categoría: debe existir

### Categorías
- Nombre: obligatorio, mínimo 2 caracteres
- Slug: único, formato URL amigable

### Medios
- Máximo 10 imágenes por producto
- Máximo 5 videos por producto
- URLs válidas para archivos y thumbnails

## Ejemplos de Uso

### Crear Producto
```typescript
POST /admin/products
{
  "name": "iPhone 15 Pro",
  "productCode": "APL-IP15P-128",
  "shortDescription": "El iPhone más avanzado",
  "longDescription": "iPhone 15 Pro con chip A17 Pro...",
  "salePrice": 999.99,
  "offerPrice": 899.99,
  "isOfferActive": true,
  "availableStock": 50,
  "weight": 0.187,
  "size": "6.1 pulgadas",
  "slug": "iphone-15-pro",
  "stockLimit": 5,
  "hasShipping": true,
  "hasPickup": true,
  "purchasePrice": 700.00,
  "categoryId": "electronics-uuid",
  "media": [
    {
      "type": "image",
      "fileUrl": "https://example.com/iphone15pro.jpg",
      "thumbnailSmallUrl": "https://example.com/iphone15pro-small.jpg",
      "thumbnailMediumUrl": "https://example.com/iphone15pro-medium.jpg",
      "thumbnailLargeUrl": "https://example.com/iphone15pro-large.jpg",
      "sortOrder": 0
    }
  ]
}
```

### Respuesta Pública del Producto
```typescript
GET /public/products/iphone-15-pro
{
  "id": "product-uuid",
  "name": "iPhone 15 Pro",
  "productCode": "APL-IP15P-128",
  "shortDescription": "El iPhone más avanzado",
  "longDescription": "iPhone 15 Pro con chip A17 Pro...",
  "salePrice": 999.99,
  "offerPrice": 899.99,
  "isOfferActive": true,
  "availableStock": 50,
  "weight": 0.187,
  "size": "6.1 pulgadas",
  "slug": "iphone-15-pro",
  "hasShipping": true,
  "hasPickup": true,
  "isActive": true,
  "categoryId": "electronics-uuid",
  "category": { /* datos de categoría */ },
  "media": [ /* array de medios */ ],
  "isInStock": true,
  "currentPrice": 899.99,
  "isOnSale": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
  // NOTA: purchasePrice y stockLimit NO están incluidos
}
```

## Tests

El sistema incluye tests unitarios completos para:
- Servicios de categorías (`ProductCategoriesService`)
- Servicios de productos (`ProductsService`)
- Validación de DTOs
- Manejo de errores y excepciones

Para ejecutar los tests:
```bash
npm test src/product-categories/product-categories.service.spec.ts
npm test src/products/products.service.spec.ts
```

## Consideraciones de Seguridad

1. **Separación de datos**: Los endpoints públicos nunca exponen información sensible
2. **Validación robusta**: Todos los inputs son validados usando class-validator
3. **Relaciones controladas**: Las relaciones entre entidades están correctamente definidas
4. **Autenticación requerida**: Los endpoints de administración requieren autenticación JWT

## Próximos Pasos

1. Implementar búsqueda y filtrado avanzado
2. Agregar sistema de reviews y ratings
3. Implementar cache para mejorar performance
4. Agregar audit logging para cambios administrativos
5. Implementar bulk operations para administración masiva