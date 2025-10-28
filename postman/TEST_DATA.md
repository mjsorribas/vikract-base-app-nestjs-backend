# Script de Datos de Prueba para Postman

## Datos de ejemplo listos para usar

Copia y pega estos JSON en el body de las requests de Postman:

### 1. Crear Rol Administrador
```json
{
  "name": "admin",
  "description": "Administrator role with full permissions",
  "permissions": ["read", "write", "edit", "delete", "publish", "manage_users", "manage_roles"]
}
```

### 2. Crear Rol Editor
```json
{
  "name": "editor",
  "description": "Editor role for content management",
  "permissions": ["read", "write", "edit", "publish"]
}
```

### 3. Crear Rol Autor
```json
{
  "name": "author",
  "description": "Author role for writing articles",
  "permissions": ["read", "write"]
}
```

### 4. Crear Usuario Administrador
```json
{
  "email": "admin@vikract.com",
  "firstName": "Admin",
  "lastName": "User",
  "username": "admin",
  "password": "secureAdminPass123",
  "roleIds": ["{{adminRoleId}}"]
}
```

### 5. Crear Usuario Editor
```json
{
  "email": "editor@vikract.com",
  "firstName": "Jane",
  "lastName": "Editor",
  "username": "jane_editor",
  "password": "secureEditorPass123",
  "roleIds": ["{{editorRoleId}}"]
}
```

### 6. Crear Usuario Autor
```json
{
  "email": "author@vikract.com",
  "firstName": "John",
  "lastName": "Author",
  "username": "john_author",
  "password": "secureAuthorPass123",
  "roleIds": ["{{authorRoleId}}"]
}
```

### 7. Crear Idioma Español (por defecto)
```json
{
  "code": "es",
  "name": "Español",
  "isDefault": true,
  "isActive": true
}
```

### 8. Crear Idioma Inglés
```json
{
  "code": "en",
  "name": "English",
  "isDefault": false,
  "isActive": true
}
```

### 9. Crear Idioma Francés
```json
{
  "code": "fr",
  "name": "Français",
  "isDefault": false,
  "isActive": true
}
```

### 10. Crear Blog de Tecnología
```json
{
  "title": "Tech Insights Blog",
  "description": "A comprehensive blog about technology trends, programming, and digital innovation",
  "ownerId": "{{adminUserId}}"
}
```

### 11. Crear Blog Personal
```json
{
  "title": "Personal Thoughts",
  "description": "Personal blog for sharing experiences and thoughts",
  "ownerId": "{{editorUserId}}"
}
```

### 12. Crear Categoría Tecnología
```json
{
  "name": "Technology",
  "description": "Articles about technology and innovation",
  "translations": [
    {
      "languageCode": "es",
      "name": "Tecnología",
      "description": "Artículos sobre tecnología e innovación"
    },
    {
      "languageCode": "fr",
      "name": "Technologie",
      "description": "Articles sur la technologie et l'innovation"
    }
  ]
}
```

### 13. Crear Categoría Programación
```json
{
  "name": "Programming",
  "description": "Programming tutorials and best practices",
  "translations": [
    {
      "languageCode": "es",
      "name": "Programación",
      "description": "Tutoriales de programación y mejores prácticas"
    },
    {
      "languageCode": "fr",
      "name": "Programmation",
      "description": "Tutoriels de programmation et meilleures pratiques"
    }
  ]
}
```

### 14. Crear Categoría DevOps
```json
{
  "name": "DevOps",
  "description": "DevOps practices, tools, and methodologies",
  "translations": [
    {
      "languageCode": "es",
      "name": "DevOps",
      "description": "Prácticas, herramientas y metodologías DevOps"
    },
    {
      "languageCode": "fr",
      "name": "DevOps",
      "description": "Pratiques, outils et méthodologies DevOps"
    }
  ]
}
```

### 15. Crear Tag JavaScript
```json
{
  "name": "JavaScript",
  "description": "JavaScript programming language",
  "translations": [
    {
      "languageCode": "es",
      "name": "JavaScript",
      "description": "Lenguaje de programación JavaScript"
    },
    {
      "languageCode": "fr",
      "name": "JavaScript",
      "description": "Langage de programmation JavaScript"
    }
  ]
}
```

### 16. Crear Tag NestJS
```json
{
  "name": "NestJS",
  "description": "NestJS framework for Node.js",
  "translations": [
    {
      "languageCode": "es",
      "name": "NestJS",
      "description": "Framework NestJS para Node.js"
    },
    {
      "languageCode": "fr",
      "name": "NestJS",
      "description": "Framework NestJS pour Node.js"
    }
  ]
}
```

### 17. Crear Tag TypeScript
```json
{
  "name": "TypeScript",
  "description": "TypeScript programming language",
  "translations": [
    {
      "languageCode": "es",
      "name": "TypeScript",
      "description": "Lenguaje de programación TypeScript"
    },
    {
      "languageCode": "fr",
      "name": "TypeScript",
      "description": "Langage de programmation TypeScript"
    }
  ]
}
```

### 18. Crear Tag Docker
```json
{
  "name": "Docker",
  "description": "Docker containerization platform",
  "translations": [
    {
      "languageCode": "es",
      "name": "Docker",
      "description": "Plataforma de contenedorización Docker"
    },
    {
      "languageCode": "fr",
      "name": "Docker",
      "description": "Plateforme de conteneurisation Docker"
    }
  ]
}
```

### 19. Crear Artículo Completo - Introducción a NestJS
```json
{
  "title": "Getting Started with NestJS: A Comprehensive Guide",
  "excerpt": "Learn how to build scalable and maintainable Node.js applications using the NestJS framework. This guide covers the basics and advanced concepts.",
  "content": "# Getting Started with NestJS\n\nNestJS is a progressive Node.js framework for building efficient and scalable server-side applications. It uses TypeScript by default and combines elements of Object-Oriented Programming (OOP), Functional Programming (FP), and Functional Reactive Programming (FRP).\n\n## Key Features\n\n- **TypeScript Support**: Built with TypeScript from the ground up\n- **Modular Architecture**: Organize code into reusable modules\n- **Dependency Injection**: Powerful IoC container\n- **Decorators**: Extensive use of decorators for clean code\n- **Testing**: Built-in testing utilities\n\n## Installation\n\n```bash\nnpm i -g @nestjs/cli\nnest new project-name\n```\n\n## Creating Your First Controller\n\n```typescript\n@Controller('cats')\nexport class CatsController {\n  @Get()\n  findAll(): string {\n    return 'This action returns all cats';\n  }\n}\n```\n\nThis is just the beginning of what you can accomplish with NestJS!",
  "status": "published",
  "isPublished": true,
  "authorId": "{{editorUserId}}",
  "blogId": "{{techBlogId}}",
  "categoryIds": ["{{programmingCategoryId}}"],
  "tagIds": ["{{nestjsTagId}}", "{{typescriptTagId}}"],
  "translations": [
    {
      "languageCode": "es",
      "title": "Comenzando con NestJS: Una Guía Completa",
      "excerpt": "Aprende cómo construir aplicaciones Node.js escalables y mantenibles usando el framework NestJS. Esta guía cubre conceptos básicos y avanzados.",
      "content": "# Comenzando con NestJS\n\nNestJS es un framework progresivo de Node.js para construir aplicaciones del lado del servidor eficientes y escalables. Usa TypeScript por defecto y combina elementos de Programación Orientada a Objetos (POO), Programación Funcional (PF) y Programación Reactiva Funcional (PRF).\n\n## Características Clave\n\n- **Soporte TypeScript**: Construido con TypeScript desde el principio\n- **Arquitectura Modular**: Organiza el código en módulos reutilizables\n- **Inyección de Dependencias**: Potente contenedor IoC\n- **Decoradores**: Uso extensivo de decoradores para código limpio\n- **Testing**: Utilidades de testing incorporadas\n\n## Instalación\n\n```bash\nnpm i -g @nestjs/cli\nnest new project-name\n```\n\n## Creando tu Primer Controlador\n\n```typescript\n@Controller('cats')\nexport class CatsController {\n  @Get()\n  findAll(): string {\n    return 'Esta acción retorna todos los gatos';\n  }\n}\n```\n\n¡Esto es solo el comienzo de lo que puedes lograr con NestJS!"
    }
  ]
}
```

### 20. Crear Artículo - Docker para Desarrolladores
```json
{
  "title": "Docker Best Practices for Developers",
  "excerpt": "Essential Docker practices every developer should know to containerize applications effectively and securely.",
  "content": "# Docker Best Practices for Developers\n\nDocker has revolutionized how we develop, ship, and run applications. Here are essential best practices every developer should follow.\n\n## 1. Use Official Base Images\n\nAlways start with official images from Docker Hub:\n\n```dockerfile\nFROM node:18-alpine\n```\n\n## 2. Minimize Layer Count\n\nCombine RUN commands to reduce image size:\n\n```dockerfile\nRUN apt-get update && \\\n    apt-get install -y curl && \\\n    apt-get clean\n```\n\n## 3. Use .dockerignore\n\nExclude unnecessary files:\n\n```\nnode_modules\n.git\n.env\n```\n\n## 4. Run as Non-Root User\n\n```dockerfile\nUSER node\n```\n\n## Security Considerations\n\n- Keep images updated\n- Scan for vulnerabilities\n- Use secrets management\n- Limit container capabilities\n\nFollowing these practices will help you create more secure and efficient Docker containers.",
  "status": "draft",
  "isPublished": false,
  "authorId": "{{authorUserId}}",
  "blogId": "{{techBlogId}}",
  "categoryIds": ["{{devopsCategoryId}}"],
  "tagIds": ["{{dockerTagId}}"],
  "translations": [
    {
      "languageCode": "es",
      "title": "Mejores Prácticas de Docker para Desarrolladores",
      "excerpt": "Prácticas esenciales de Docker que todo desarrollador debería conocer para contenerizar aplicaciones de manera efectiva y segura.",
      "content": "# Mejores Prácticas de Docker para Desarrolladores\n\nDocker ha revolucionado cómo desarrollamos, enviamos y ejecutamos aplicaciones. Aquí están las prácticas esenciales que todo desarrollador debería seguir.\n\n## 1. Usar Imágenes Base Oficiales\n\nSiempre comienza con imágenes oficiales de Docker Hub:\n\n```dockerfile\nFROM node:18-alpine\n```\n\n## 2. Minimizar el Número de Capas\n\nCombina comandos RUN para reducir el tamaño de la imagen:\n\n```dockerfile\nRUN apt-get update && \\\n    apt-get install -y curl && \\\n    apt-get clean\n```\n\n## 3. Usar .dockerignore\n\nExcluye archivos innecesarios:\n\n```\nnode_modules\n.git\n.env\n```\n\n## 4. Ejecutar como Usuario No-Root\n\n```dockerfile\nUSER node\n```\n\n## Consideraciones de Seguridad\n\n- Mantener imágenes actualizadas\n- Escanear en busca de vulnerabilidades\n- Usar gestión de secretos\n- Limitar capacidades del contenedor\n\nSeguir estas prácticas te ayudará a crear contenedores Docker más seguros y eficientes."
    }
  ]
}
```

## Variables para el entorno de Postman

Después de crear cada recurso, asigna estos valores a las variables del entorno:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `adminRoleId` | ID del rol administrador | `550e8400-e29b-41d4-a716-446655440001` |
| `editorRoleId` | ID del rol editor | `550e8400-e29b-41d4-a716-446655440002` |
| `authorRoleId` | ID del rol autor | `550e8400-e29b-41d4-a716-446655440003` |
| `adminUserId` | ID del usuario administrador | `550e8400-e29b-41d4-a716-446655440004` |
| `editorUserId` | ID del usuario editor | `550e8400-e29b-41d4-a716-446655440005` |
| `authorUserId` | ID del usuario autor | `550e8400-e29b-41d4-a716-446655440006` |
| `spanishLangId` | ID del idioma español | `550e8400-e29b-41d4-a716-446655440007` |
| `englishLangId` | ID del idioma inglés | `550e8400-e29b-41d4-a716-446655440008` |
| `techBlogId` | ID del blog de tecnología | `550e8400-e29b-41d4-a716-446655440009` |
| `programmingCategoryId` | ID de la categoría programación | `550e8400-e29b-41d4-a716-44665544000a` |
| `devopsCategoryId` | ID de la categoría DevOps | `550e8400-e29b-41d4-a716-44665544000b` |
| `nestjsTagId` | ID del tag NestJS | `550e8400-e29b-41d4-a716-44665544000c` |
| `dockerTagId` | ID del tag Docker | `550e8400-e29b-41d4-a716-44665544000d` |