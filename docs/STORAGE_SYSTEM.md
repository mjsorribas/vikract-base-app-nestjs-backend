# Sistema de Almacenamiento de Archivos

Este módulo proporciona un sistema completo de almacenamiento de archivos multimedia para la aplicación Vikract Blog.

## 🎯 Características

### Tipos de Archivos Soportados
- **Audio**: MP3, OGG (máximo 50MB)
- **Video**: MP4 (máximo 100MB)
- **Imágenes**: JPG, JPEG, PNG, WEBP (máximo 10MB)
- **Documentos**: PDF, DOC, DOCX, XLS, XLSX, TXT (máximo 20MB)

### Funcionalidades
- ✅ Subida de archivos con validación automática
- ✅ Organización automática por carpetas `/blog/fecha/archivo`
- ✅ Generación de nombres únicos
- ✅ Validación de tipos y tamaños
- ✅ Tracking completo en base de datos
- ✅ URLs públicas para acceso
- ✅ Gestión de archivos (copiar, mover, eliminar)
- ✅ Estadísticas de almacenamiento
- ✅ Filtrado por blog, usuario y tipo
- ⏳ Compresión de imágenes (pendiente)
- ⏳ Procesamiento de videos (pendiente)

## 📁 Estructura de Directorios

```
uploads/
├── blog/
│   └── {blogId}/
│       └── 2025/
│           └── 10/
│               └── 28/
│                   ├── imagen_1698521832_abc123.jpg
│                   ├── video_1698521833_def456.mp4
│                   └── audio_1698521834_ghi789.mp3
└── uploads/
    └── 2025/
        └── 10/
            └── 28/
                └── documento_1698521835_jkl012.pdf
```

## 🛠️ Uso del API

### Autenticación
Todos los endpoints requieren autenticación JWT. Incluir en el header:
```
Authorization: Bearer {token}
```

### Endpoints Disponibles

#### 📤 Subir Archivos

**Subida General**
```http
POST /storage/upload
Content-Type: multipart/form-data

{
  "file": [archivo],
  "blogId": "blog-uuid-123",
  "folder": "custom",
  "generateThumbnail": true,
  "compress": true,
  "quality": 85
}
```

**Subida Específica por Tipo**
```http
POST /storage/upload/images    # Solo imágenes
POST /storage/upload/videos    # Solo videos  
POST /storage/upload/audio     # Solo audio
POST /storage/upload/documents # Solo documentos
```

#### 📋 Listar Archivos

**Listar todos los archivos**
```http
GET /storage/files?directory=blog/blog-uuid&limit=20&offset=0
```

**Filtrar por blog**
```http
GET /storage/blog/{blogId}/files
```

**Filtrar por usuario**
```http
GET /storage/user/{userId}/files
```

**Filtrar por tipo**
```http
GET /storage/type/image/files
```

#### 📄 Obtener Archivo

```http
GET /storage/files/{fileId}
```

#### 🗑️ Eliminar Archivo

```http
DELETE /storage/files/{fileId}
```

#### 📊 Estadísticas

```http
GET /storage/stats
```

### 🖼️ Acceso a Archivos

Los archivos son accesibles públicamente a través de:
```
GET /uploads/{path}
```

Ejemplo:
```
GET /uploads/blog/blog-uuid/2025/10/28/imagen_1698521832_abc123.jpg
```

## 💻 Uso en Código

### Inyectar el Servicio

```typescript
import { StorageService } from './storage/storage.service';

@Injectable()
export class MyService {
  constructor(private readonly storageService: StorageService) {}
}
```

### Subir Archivo

```typescript
async uploadFile(file: Express.Multer.File, userId: string) {
  const result = await this.storageService.uploadFile(file, {
    blogId: 'blog-uuid-123',
    uploadedById: userId,
    compress: true,
    generateThumbnail: true
  });
  
  return result;
}
```

### Obtener Archivos

```typescript
// Por blog
const blogFiles = await this.storageService.getFilesByBlog('blog-uuid');

// Por usuario  
const userFiles = await this.storageService.getFilesByUser('user-uuid');

// Por tipo
const images = await this.storageService.getFilesByType(FileType.IMAGE);
```

### Eliminar Archivo

```typescript
const deleted = await this.storageService.deleteFile('file-uuid');
```

## ⚙️ Configuración

### Variables de Entorno

```env
# Configuración de almacenamiento
STORAGE_PROVIDER=local          # local | minio | s3
APP_URL=http://localhost:3000   # URL base para acceso a archivos

# Para MinIO (futuro)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=vikract-files

# Para AWS S3 (futuro)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=vikract-files
```

### Límites de Archivos

Los límites están definidos en `storage.utils.ts`:

```typescript
export const FILE_SIZE_LIMITS = {
  [FileType.AUDIO]: 50 * 1024 * 1024,     // 50MB
  [FileType.VIDEO]: 100 * 1024 * 1024,    // 100MB  
  [FileType.IMAGE]: 10 * 1024 * 1024,     // 10MB
  [FileType.DOCUMENT]: 20 * 1024 * 1024,  // 20MB
};
```

## 🗄️ Base de Datos

### Tabla `files`

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY,
  filename VARCHAR NOT NULL,
  originalName VARCHAR NOT NULL,
  path VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  size INTEGER NOT NULL,
  mimeType VARCHAR NOT NULL,
  type ENUM('audio', 'video', 'image', 'document') NOT NULL,
  format ENUM('mp3', 'ogg', 'mp4', 'jpg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt') NOT NULL,
  blogId UUID NULL,
  uploadedById UUID NULL,
  processedVersions JSON NULL,
  metadata JSON NULL,
  folder VARCHAR NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  deletedAt TIMESTAMP NULL
);
```

## 🚀 Ejemplos Frontend

### HTML + JavaScript

```html
<form id="uploadForm" enctype="multipart/form-data">
  <input type="file" id="fileInput" accept="image/*,video/*,audio/*,.pdf,.doc,.docx">
  <input type="text" id="blogId" placeholder="Blog ID">
  <button type="submit">Subir Archivo</button>
</form>

<script>
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('file', document.getElementById('fileInput').files[0]);
  formData.append('blogId', document.getElementById('blogId').value);
  
  const response = await fetch('/storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: formData
  });
  
  const result = await response.json();
  console.log('Archivo subido:', result.data);
});
</script>
```

### React

```tsx
import { useState } from 'react';

export const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('blogId', 'your-blog-id');
    
    try {
      const response = await fetch('/storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const result = await response.json();
      console.log('Archivo subido:', result.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Subiendo...' : 'Subir Archivo'}
      </button>
    </div>
  );
};
```

## 🔄 Expansión Futura

### MinIO Provider
- Almacenamiento compatible con S3
- Auto-escalable con Docker
- CDN integrable

### AWS S3 Provider  
- Almacenamiento en la nube
- CDN con CloudFront
- Backup automático

### Procesamiento Avanzado
- Compresión de imágenes con Sharp
- Procesamiento de videos con FFmpeg
- Generación de thumbnails
- Detección de contenido

## 🛡️ Seguridad

- ✅ Validación estricta de tipos MIME
- ✅ Límites de tamaño por tipo
- ✅ Nombres de archivo únicos
- ✅ Autenticación JWT requerida
- ✅ Tracking de usuario que sube
- ⏳ Escaneo de malware (futuro)
- ⏳ Watermarking (futuro)

## 📈 Rendimiento

- ✅ Streaming de archivos grandes
- ✅ Organización por fechas
- ✅ Índices de base de datos optimizados
- ⏳ CDN para entrega rápida (futuro)
- ⏳ Compresión automática (futuro)