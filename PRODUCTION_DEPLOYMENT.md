# 🚀 Guía de Despliegue en Producción

## 📋 Configuración de Base de Datos

### Configuración PostgreSQL para Producción

Para usar PostgreSQL en producción, actualiza tu archivo `.env`:

```bash
# ==========================================
# CONFIGURACIÓN PARA PRODUCCIÓN
# ==========================================

# Configuración de Base de Datos
DATABASE_MODE=postgres  # sqlite | postgres | hybrid
NODE_ENV=production

# Configuración PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=vikract_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=vikract_production
POSTGRES_SSL=true

# Configuración TypeORM (opcional)
DATABASE_SYNCHRONIZE=false  # ¡IMPORTANTE! Usar migraciones en producción
DATABASE_LOGGING=false      # Desactivar logs de queries en producción
```

### Configuración Completa por Ambientes

#### 🔧 Desarrollo Local
```bash
DATABASE_MODE=hybrid    # SQLite + PGlite para desarrollo ágil
NODE_ENV=development
# No necesitas configurar PostgreSQL
```

#### 🧪 Testing/Staging
```bash
DATABASE_MODE=postgres  # PostgreSQL para pruebas realistas
NODE_ENV=testing
POSTGRES_HOST=staging-db.example.com
POSTGRES_PORT=5432
POSTGRES_USERNAME=vikract_staging
POSTGRES_PASSWORD=staging_password
POSTGRES_DB=vikract_staging
POSTGRES_SSL=true
```

#### 🏭 Producción
```bash
DATABASE_MODE=postgres  # PostgreSQL para máximo rendimiento
NODE_ENV=production
POSTGRES_HOST=prod-db.example.com
POSTGRES_PORT=5432
POSTGRES_USERNAME=vikract_prod
POSTGRES_PASSWORD=super_secure_production_password
POSTGRES_DB=vikract_production
POSTGRES_SSL=true
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=false
```

## 🐳 Docker Compose para Producción

### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - DATABASE_MODE=postgres
      - NODE_ENV=production
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_USERNAME=vikract_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=vikract_production
      - POSTGRES_SSL=false  # false en Docker interno
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=vikract_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=vikract_production
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vikract_user -d vikract_production"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
```

## 🔧 Scripts de Migración

### 1. Generar Migración
```bash
npm run migration:generate -- -n CreateInitialSchema
```

### 2. Ejecutar Migraciones
```bash
npm run migration:run
```

### 3. Revertir Migración
```bash
npm run migration:revert
```

## 📊 Monitoreo y Logs

### Configuración de Logs para Producción
```typescript
// src/main.ts
if (process.env.NODE_ENV === 'production') {
  app.useLogger(['error', 'warn']);
} else {
  app.useLogger(['log', 'debug', 'error', 'verbose', 'warn']);
}
```

### Variables de Entorno para Monitoreo
```bash
# Configuración de Logs
LOG_LEVEL=warn              # error | warn | log | debug | verbose
DATABASE_LOGGING=false      # Desactivar queries en producción
ENABLE_METRICS=true         # Habilitar métricas
```

## 🚀 Despliegue Paso a Paso

### 1. Preparación del Servidor
```bash
# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Crear usuario y base de datos
sudo -u postgres createuser --interactive vikract_user
sudo -u postgres createdb vikract_production -O vikract_user
```

### 2. Configuración de la Aplicación
```bash
# Clonar repositorio
git clone <repository-url>
cd vikract-base-app-nestjs-backend

# Instalar dependencias
npm ci --only=production

# Configurar variables de entorno
cp .env.production .env
nano .env  # Editar con tus configuraciones

# Ejecutar migraciones
npm run migration:run

# Construir aplicación
npm run build
```

### 3. Configuración de PM2 (Process Manager)
```bash
# Instalar PM2
npm install -g pm2

# Crear archivo ecosystem
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'vikract-api',
    script: './dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Iniciar aplicación
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Configuración de Nginx (Proxy Reverso)
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Configuración SSL
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d api.yourdomain.com

# Auto-renovación
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📈 Optimizaciones de Rendimiento

### 1. Pool de Conexiones PostgreSQL
```bash
# En .env de producción
POSTGRES_MAX_CONNECTIONS=100
POSTGRES_IDLE_TIMEOUT=30000
POSTGRES_CONNECTION_TIMEOUT=2000
```

### 2. Configuración TypeORM para Producción
```typescript
// src/database/database.module.ts
const productionConfig = {
  extra: {
    max: 100,                    // máximo de conexiones
    min: 10,                     // mínimo de conexiones
    acquire: 30000,              // tiempo máximo para obtener conexión
    idle: 30000,                 // tiempo antes de cerrar conexión inactiva
    evict: 1000,                 // tiempo entre verificaciones de conexiones
    handleDisconnects: true,     // manejo automático de desconexiones
  },
  retryAttempts: 3,              // reintentos en caso de error
  retryDelay: 3000,              // delay entre reintentos
};
```

## 🔍 Troubleshooting

### Verificar Estado de la Aplicación
```bash
# Verificar aplicación
curl http://localhost:3000/api/auth

# Verificar logs
pm2 logs vikract-api

# Verificar estado PostgreSQL
sudo systemctl status postgresql
```

### Comandos Útiles de Depuración
```bash
# Verificar conexión PostgreSQL
psql -h localhost -U vikract_user -d vikract_production -c "\dt"

# Verificar variables de entorno
npm run debug:env

# Reiniciar aplicación
pm2 restart vikract-api

# Monitoreo en tiempo real
pm2 monit
```

## 📋 Checklist de Despliegue

- [ ] Configurar variables de entorno de producción
- [ ] Configurar PostgreSQL y crear base de datos
- [ ] Ejecutar migraciones de base de datos
- [ ] Configurar SSL/TLS
- [ ] Configurar proxy reverso (Nginx)
- [ ] Configurar proceso manager (PM2)
- [ ] Configurar logs y monitoreo
- [ ] Configurar backup automático de base de datos
- [ ] Verificar configuración de seguridad
- [ ] Probar endpoints críticos
- [ ] Configurar alertas de monitoreo

## 🎯 Resultado Esperado

Con esta configuración tendrás:

✅ **Arquitectura híbrida flexible**: Desarrollo ágil con SQLite/PGlite, producción robusta con PostgreSQL  
✅ **Máximo rendimiento**: PostgreSQL optimizado para cargas de producción  
✅ **Zero downtime**: Configuración con PM2 cluster y reinicio automático  
✅ **Seguridad**: SSL/TLS, configuración segura de PostgreSQL  
✅ **Escalabilidad**: Pool de conexiones optimizado, modo cluster  
✅ **Monitoreo**: Logs estructurados, métricas de rendimiento  

Tu aplicación estará lista para manejar tráfico de producción manteniendo la flexibilidad de desarrollo que ofrece la arquitectura híbrida.
