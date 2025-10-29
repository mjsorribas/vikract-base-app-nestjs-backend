# Sistema de Carousels de Imágenes

## Descripción General

El sistema de carousels permite crear y gestionar carousels de imágenes que pueden asociarse a artículos. Cada carousel puede contener múltiples slides con imágenes, títulos, descripciones y enlaces.

## Estructura de la Base de Datos

### Tabla `carousels`

- `id` - UUID único del carousel
- `name` - Nombre descriptivo del carousel
- `description` - Descripción opcional del carousel  
- `isActive` - Estado activo/inactivo (boolean)
- `autoplayDelay` - Tiempo de autoplay en milisegundos (0 = desactivado)
- `showIndicators` - Mostrar indicadores de navegación (boolean)
- `showNavigation` - Mostrar botones de navegación (boolean)
- `articleId` - ID del artículo asociado (opcional)
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de última actualización

### Tabla `carousel_slides`

- `id` - UUID único del slide
- `imageUrl` - URL de la imagen del slide
- `title` - Título opcional del slide
- `description` - Descripción opcional del slide
- `linkUrl` - URL de enlace opcional
- `linkTarget` - Target del enlace (_self, _blank, _parent, _top)
- `order` - Orden del slide en el carousel
- `isActive` - Estado activo/inactivo del slide
- `altText` - Texto alternativo para la imagen
- `carouselId` - ID del carousel al que pertenece
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de última actualización

## API Endpoints

### Carousels

#### `POST /carousels`
Crear un nuevo carousel con slides opcionales.

**Autenticación:** Requerida (JWT)

**Body ejemplo:**
```json
{
  "name": "Carousel Principal",
  "description": "Carousel para la página de inicio",
  "isActive": true,
  "autoplayDelay": 5000,
  "showIndicators": true,
  "showNavigation": true,
  "articleId": "article-uuid",
  "slides": [
    {
      "imageUrl": "https://example.com/image1.jpg",
      "title": "Slide 1",
      "description": "Descripción del slide 1",
      "linkUrl": "https://example.com/link1",
      "linkTarget": "_blank",
      "order": 1,
      "altText": "Imagen 1"
    }
  ]
}
```

#### `GET /carousels`
Obtener todos los carousels.

**Query Parameters:**
- `active=true` - Filtrar solo carousels activos

#### `GET /carousels/article/:articleId`
Obtener carousels asociados a un artículo específico.

#### `GET /carousels/:id`
Obtener un carousel específico por ID.

#### `PATCH /carousels/:id`
Actualizar un carousel existente.

**Autenticación:** Requerida (JWT)

#### `PATCH /carousels/:id/reorder`
Reordenar slides de un carousel.

**Autenticación:** Requerida (JWT)

**Body ejemplo:**
```json
[
  { "id": "slide-1-uuid", "order": 2 },
  { "id": "slide-2-uuid", "order": 1 }
]
```

#### `DELETE /carousels/:id`
Eliminar un carousel y todos sus slides.

**Autenticación:** Requerida (JWT)

## Características del Sistema

### 1. Asociación con Artículos
- Cada carousel puede asociarse opcionalmente a un artículo
- Un artículo puede tener múltiples carousels
- La relación es opcional (un carousel puede existir sin artículo)

### 2. Gestión de Slides
- Cada slide tiene un orden específico dentro del carousel
- Los slides se pueden reordenar mediante endpoint dedicado
- Cada slide puede tener imagen, título, descripción y enlace
- Los slides se eliminan automáticamente al eliminar el carousel

### 3. Configuración de Visualización
- Control de autoplay con tiempo configurable
- Opciones para mostrar/ocultar indicadores
- Opciones para mostrar/ocultar navegación
- Estado activo/inactivo para carousels y slides

### 4. Enlaces en Slides
- Cada slide puede tener un enlace opcional
- Control del target del enlace (_self, _blank, etc.)
- Validación de URLs

## Casos de Uso

### 1. Carousel de Hero en Artículos
```javascript
// Crear carousel para artículo
const heroCarousel = await carouselsService.create({
  name: 'Hero Carousel',
  articleId: 'article-123',
  autoplayDelay: 5000,
  slides: [
    {
      imageUrl: '/images/hero1.jpg',
      title: 'Título Principal',
      description: 'Descripción del artículo',
      order: 1
    }
  ]
});
```

### 2. Galería de Productos
```javascript
// Crear carousel independiente
const productGallery = await carouselsService.create({
  name: 'Galería de Productos',
  showIndicators: true,
  showNavigation: true,
  autoplayDelay: 0, // Sin autoplay
  slides: [
    {
      imageUrl: '/products/product1.jpg',
      title: 'Producto 1',
      linkUrl: '/products/1',
      order: 1
    },
    {
      imageUrl: '/products/product2.jpg',
      title: 'Producto 2',
      linkUrl: '/products/2',
      order: 2
    }
  ]
});
```

### 3. Reordenar Slides
```javascript
// Cambiar orden de slides
await carouselsService.reorderSlides('carousel-id', [
  { id: 'slide-2-id', order: 1 },
  { id: 'slide-1-id', order: 2 },
  { id: 'slide-3-id', order: 3 }
]);
```

## Validaciones

- **URL de imagen:** Requerida para cada slide
- **Orden:** Requerido y debe ser numérico
- **Target de enlace:** Debe ser uno de: _self, _blank, _parent, _top
- **URL de enlace:** Debe ser una URL válida si se proporciona
- **Nombre del carousel:** Requerido

## Tests

El sistema incluye tests completos para:
- Creación de carousels con y sin slides
- Filtrado por estado activo
- Asociación con artículos
- Reordenamiento de slides
- Validación de datos
- Manejo de errores

Para ejecutar los tests:
```bash
npm run test -- --testPathPattern=carousels
```

## Integración Frontend

### Ejemplo de uso con React/Vue
```typescript
// Obtener carousels de un artículo
const carousels = await fetch(`/api/carousels/article/${articleId}`);

// Renderizar carousel
carousels.forEach(carousel => {
  carousel.slides
    .sort((a, b) => a.order - b.order)
    .forEach(slide => {
      // Renderizar slide con imagen, título, descripción y enlace
    });
});
```

## Consideraciones de Performance

1. **Eager Loading:** Los slides se cargan automáticamente con el carousel
2. **Ordenamiento:** Los slides se ordenan por el campo `order` en las consultas
3. **Índices:** Se recomienda crear índices en `carouselId` y `order` para optimizar consultas
4. **Paginación:** Para carousels con muchos slides, considerar implementar paginación

## Migración y Deployment

Las tablas se crean automáticamente mediante TypeORM con `synchronize: true`. Para producción, se recomienda:

1. Deshabilitar `synchronize`
2. Crear migraciones explícitas
3. Ejecutar migraciones en el proceso de deployment