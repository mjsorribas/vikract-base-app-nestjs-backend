# Sistema de Gestión de Marcas (Brands)

## Descripción General

El sistema de marcas permite gestionar las marcas de productos con relaciones many-to-many con categorías de productos y one-to-many con productos.

## Características Principales

### Marcas
- **Gestión completa**: Crear, leer, actualizar y eliminar marcas
- **Slug único**: URLs amigables para SEO
- **Estado activo/inactivo**: Control de visibilidad
- **Información completa**: Logo, sitio web, país de origen, año de fundación
- **Orden personalizable**: Sorting por orden y nombre
- **Relaciones**:
  - Una marca puede tener múltiples productos (One-to-Many)
  - Una marca puede estar asociada a múltiples categorías (Many-to-Many)
  - Una categoría puede tener múltiples marcas (Many-to-Many)

## Estructura de Base de Datos

### Entidad Brand
```typescript
{
  id: string (UUID)
  name: string
  slug: string (único)
  description?: string
  logoUrl?: string
  websiteUrl?: string
  isActive: boolean (default: true)
  sortOrder: number (default: 0)
  countryOfOrigin?: string
  foundedYear?: number
  
  // Relaciones
  products: Product[] (One-to-Many)
  categories: ProductCategory[] (Many-to-Many)
  
  // Propiedades computadas
  activeProductsCount: number
  
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
```

### Tabla de Relación Brand-Categories
```sql
brand_categories:
  - brand_id: UUID (FK -> brands.id)
  - category_id: UUID (FK -> product_categories.id)
```

## Relaciones Implementadas

### 1. Brand ↔ Product (One-to-Many)
- **Brand → Products**: Una marca puede tener múltiples productos
- **Product → Brand**: Un producto pertenece a una marca (opcional)
- **Implementación**: `@ManyToOne` en Product, `@OneToMany` en Brand

### 2. Brand ↔ ProductCategory (Many-to-Many)
- **Brand → Categories**: Una marca puede estar en múltiples categorías
- **Category → Brands**: Una categoría puede tener múltiples marcas
- **Implementación**: `@ManyToMany` con tabla intermedia `brand_categories`

### 3. Actualización en Product Entity
```typescript
// Nuevo campo en Product
@ManyToOne(() => Brand, (brand) => brand.products, { nullable: true })
brand: Brand;
```

### 4. Actualización en ProductCategory Entity
```typescript
// Nueva relación en ProductCategory
@ManyToMany(() => Brand, (brand) => brand.categories)
brands: Brand[];
```

## API Endpoints

### Administración (Admin)

#### Marcas
- `GET /admin/brands` - Listar todas las marcas
- `GET /admin/brands/:id` - Obtener marca por ID
- `POST /admin/brands` - Crear nueva marca
- `PATCH /admin/brands/:id` - Actualizar marca
- `DELETE /admin/brands/:id` - Eliminar marca
- `POST /admin/brands/:id/categories` - Agregar categorías a marca
- `DELETE /admin/brands/:id/categories` - Remover categorías de marca

#### Productos (Actualizados)
- `GET /admin/products/brand/:brandId` - Productos por marca

### Usuario Público

#### Marcas
- `GET /public/brands` - Listar marcas activas
- `GET /public/brands/:slug` - Obtener marca por slug
- `GET /public/brands/category/:categoryId` - Marcas por categoría

#### Productos (Actualizados)
- `GET /public/products/brand/:brandId` - Productos públicos por marca

## DTOs (Data Transfer Objects)

### CreateBrandDto
```typescript
{
  name: string
  slug: string
  description?: string
  logoUrl?: string
  websiteUrl?: string
  isActive?: boolean
  sortOrder?: number
  countryOfOrigin?: string
  foundedYear?: number
  categoryIds?: string[]
}
```

### UpdateBrandDto
```typescript
// Extends PartialType(CreateBrandDto)
// Todos los campos opcionales
```

### PublicBrandDto
```typescript
{
  id: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
  websiteUrl?: string
  isActive: boolean
  countryOfOrigin?: string
  foundedYear?: number
  categories: ProductCategory[]
  activeProductsCount: number
  createdAt: Date
  updatedAt: Date
  // EXCLUYE: sortOrder (usando @Exclude decorator)
}
```

### CreateProductDto (Actualizado)
```typescript
{
  // ... campos existentes ...
  categoryId: string
  brandId?: string  // NUEVO CAMPO OPCIONAL
  // ... resto de campos ...
}
```

## Validaciones

### Marcas
- Nombre: obligatorio, máximo 100 caracteres
- Slug: obligatorio, único, máximo 100 caracteres
- Descripción: opcional, máximo 1000 caracteres
- URLs: validación de formato URL
- Año de fundación: mínimo 1800
- País de origen: máximo 100 caracteres

### Relaciones
- Al crear/actualizar marca: verificar que categorías existan
- Al crear/actualizar producto: verificar que marca exista (si se proporciona)
- Prevenir duplicación en relaciones many-to-many

## Servicios Implementados

### BrandsService
```typescript
// CRUD básico
create(createBrandDto: CreateBrandDto): Promise<Brand>
findAll(): Promise<Brand[]>
findActive(): Promise<Brand[]>
findOne(id: string): Promise<Brand>
findBySlug(slug: string): Promise<Brand>
update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand>
remove(id: string): Promise<void>

// Métodos públicos
findPublicBrands(): Promise<PublicBrandDto[]>
findPublicBySlug(slug: string): Promise<PublicBrandDto>

// Relaciones
findByCategory(categoryId: string): Promise<Brand[]>
addCategories(brandId: string, categoryIds: string[]): Promise<Brand>
removeCategories(brandId: string, categoryIds: string[]): Promise<Brand>
```

### ProductsService (Actualizado)
```typescript
// Nuevos métodos
findByBrand(brandId: string): Promise<Product[]>
findPublicByBrand(brandId: string): Promise<PublicProductDto[]>

// Métodos actualizados para incluir relación brand
create() // Ahora maneja brandId opcional
update() // Ahora maneja brandId opcional
findAll(), findOne(), etc. // Incluyen relación 'brand'
```

## Ejemplos de Uso

### Crear Marca con Categorías
```typescript
POST /admin/brands
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
```typescript
POST /admin/products
{
  "name": "iPhone 15 Pro",
  "productCode": "APL-IP15P-128",
  "shortDescription": "El iPhone más avanzado",
  "longDescription": "iPhone 15 Pro con chip A17 Pro...",
  "salePrice": 999.99,
  "categoryId": "smartphones-uuid",
  "brandId": "apple-uuid",  // NUEVO CAMPO
  // ... resto de campos ...
}
```

### Respuesta Pública de Marca
```typescript
GET /public/brands/apple
{
  "id": "apple-uuid",
  "name": "Apple",
  "slug": "apple",
  "description": "Technology company focused on consumer electronics",
  "logoUrl": "https://example.com/apple-logo.png",
  "websiteUrl": "https://apple.com",
  "isActive": true,
  "countryOfOrigin": "USA",
  "foundedYear": 1976,
  "categories": [
    {
      "id": "electronics-uuid",
      "name": "Electronics",
      "slug": "electronics"
    },
    {
      "id": "smartphones-uuid", 
      "name": "Smartphones",
      "slug": "smartphones"
    }
  ],
  "activeProductsCount": 15,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
  // NOTA: sortOrder NO está incluido (excluido por @Exclude)
}
```

### Agregar Categorías a Marca
```typescript
POST /admin/brands/apple-uuid/categories
{
  "categoryIds": ["tablets-uuid", "computers-uuid"]
}
```

### Buscar Productos por Marca
```typescript
GET /public/products/brand/apple-uuid
// Devuelve array de PublicProductDto con productos de Apple
```

## Tests

El sistema incluye tests unitarios completos para:
- Servicio de marcas (`BrandsService`)
- CRUD de marcas
- Relaciones many-to-many con categorías
- Métodos públicos con filtrado de datos
- Manejo de errores y excepciones

Para ejecutar los tests:
```bash
npm test src/brands/brands.service.spec.ts
```

## Consideraciones de Arquitectura

### Relaciones de Base de Datos
1. **Brand → Product**: Relación opcional (producto puede no tener marca)
2. **Brand ↔ Category**: Relación flexible (marca puede estar en múltiples categorías)
3. **Soft Delete**: Implementado para mantener integridad referencial

### Performance
- Índices automáticos en claves foráneas
- Lazy loading de relaciones en consultas específicas
- Caching recomendado para marcas populares

### Seguridad
- Endpoints públicos filtran información sensible (sortOrder)
- Validación robusta de entrada
- Autorización requerida para endpoints administrativos

## Casos de Uso Comunes

### 1. E-commerce por Marcas
```typescript
// Obtener todas las marcas de una categoría
GET /public/brands/category/electronics-uuid

// Obtener productos de una marca específica
GET /public/products/brand/apple-uuid

// Buscar marca por slug
GET /public/brands/apple
```

### 2. Gestión Administrativa
```typescript
// Crear nueva marca
POST /admin/brands

// Asociar marca a múltiples categorías
POST /admin/brands/:id/categories

// Actualizar información de marca
PATCH /admin/brands/:id

// Ver todos los productos de una marca (admin)
GET /admin/products/brand/:brandId
```

### 3. Filtrado y Búsqueda
```typescript
// Productos por categoría Y marca
GET /public/products/category/electronics-uuid
// + filtro por brandId en frontend

// Marcas activas en una categoría
GET /public/brands/category/electronics-uuid
```

## Próximos Pasos

1. **Búsqueda avanzada**: Implementar filtros combinados (marca + categoría)
2. **Estadísticas**: Agregar métricas de marcas más populares
3. **Cache**: Implementar cache para marcas frecuentemente consultadas
4. **Imágenes**: Ampliar soporte para múltiples imágenes de marca
5. **SEO**: Agregar meta tags específicos por marca