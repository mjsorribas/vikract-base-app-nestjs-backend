# Tests Unitarios del Sistema de Storage

Este documento describe los tests unitarios implementados para el sistema de storage local del proyecto Vikract Blog.

## Tests Implementados y Funcionando

### 1. Storage Utils Tests (`storage.utils.simple.spec.ts`)
✅ **5 tests pasando**

**Funciones probadas:**
- `validateFile()`: Validación de archivos subidos
  - ✅ Validar archivo de imagen válido
  - ✅ Rechazar archivo que excede el tamaño límite

- `generateFilePath()`: Generación de rutas de archivos
  - ✅ Generar ruta correcta con formato fecha

- `generateUniqueFilename()`: Generación de nombres únicos
  - ✅ Generar nombre único con timestamp y formato

- `formatFileSize()`: Formateo de tamaños de archivo
  - ✅ Formatear bytes, KB, MB, GB correctamente

### 2. Local Storage Provider Tests (`local.provider.simple.spec.ts`)
✅ **1 test pasando**

**Funcionalidades probadas:**
- ✅ Instanciación correcta del provider
- ✅ Configuración de mocks para fs, fs-extra, path, uuid, sharp

### 3. Uploads Controller Tests (`uploads.controller.spec.ts`)
✅ **6 tests pasando**

**Endpoints probados:**
- `serveFile()`: Servir archivos estáticos
  - ✅ Servir archivo existente correctamente
  - ✅ Lanzar NotFoundException para archivo inexistente
  - ✅ Manejar errores del sistema de archivos
  - ✅ Manejar rutas de archivo vacías
  - ✅ Manejar rutas con caracteres especiales
  - ✅ Manejar rutas anidadas profundas

## Configuración de Testing

### Jest Configuration
```json
{
  "moduleNameMapper": {
    "^uuid$": "<rootDir>/../__mocks__/uuid.js"
  },
  "transformIgnorePatterns": [
    "node_modules/(?!(uuid)/)"
  ]
}
```

### Mocks Implementados
- **fs**: Sistema de archivos
- **fs-extra**: Operaciones extendidas de archivos
- **path**: Manipulación de rutas
- **uuid**: Generación de IDs únicos
- **sharp**: Procesamiento de imágenes

## Cobertura de Tests

### ✅ Componentes Probados
1. **Storage Utils** - Funciones utilitarias
2. **LocalStorageProvider** - Instanciación básica
3. **UploadsController** - Servir archivos estáticos

### 🔄 Pendientes de Implementación Completa
1. **StorageService** - Lógica de negocio completa
2. **StorageController** - Endpoints REST completos
3. **LocalStorageProvider** - Operaciones CRUD completas

## Ejecución de Tests

```bash
# Ejecutar todos los tests simples
npm test -- --testPathPattern="simple.spec.ts"

# Ejecutar test específico
npm test -- src/storage/__tests__/storage.utils.simple.spec.ts
npm test -- src/storage/__tests__/local.provider.simple.spec.ts
npm test -- src/storage/__tests__/uploads.controller.spec.ts

# Ejecutar todos los tests de storage
npm test -- src/storage/__tests__/
```

## Resultado Actual

**Total: 12 tests pasando**
- ✅ Storage Utils: 5 tests
- ✅ Local Provider: 1 test
- ✅ Uploads Controller: 6 tests

Los tests unitarios básicos están funcionando correctamente y proporcionan una base sólida para el sistema de storage local. Se han implementado mocks apropiados para todas las dependencias externas y se ha configurado Jest para manejar los módulos ES correctamente.