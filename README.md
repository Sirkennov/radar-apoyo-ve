# RadarApoyoVE 🇻🇪

Plataforma web estática para conectar necesidades críticas con voluntarios en tiempo real durante emergencias en Venezuela.

## Características

- **SPA Ultra-ligera**: Optimizada para conexiones móviles lentas (3G/Edge)
- **Caché inteligente**: 60 segundos de caché en localStorage para reducir consumo de datos
- **Integración WhatsApp**: Contacto directo sin intermediarios
- **Filtros por sector y categoría**: Organización eficiente de recursos
- **Temporizador de vigencia**: Control automático de expiración de ofertas
- **Arquitectura $0**: Vercel + Supabase (plan gratuito)

## Stack Tecnológico

- **Frontend**: React + TypeScript + Vite
- **Estilos**: TailwindCSS
- **Base de datos**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Iconos**: Lucide React

## Setup Local

1. **Clonar el repositorio**
   ```bash
   git clone <repositorio>
   cd radarapoyove
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url_aqui
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
   ```

4. **Configurar base de datos en Supabase**
   
   Ejecutar el script SQL en `supabase-schema.sql` en el editor SQL de Supabase para crear las tablas:
   - `puntos_asistencia`
   - `necesidades`
   - `ofertas_voluntarios`

5. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

## Despliegue en Vercel

1. **Crear cuenta en [Vercel](https://vercel.com)**

2. **Conectar repositorio** (GitHub, GitLab, o Bitbucket)

3. **Configurar variables de entorno** en Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Desplegar** automáticamente al hacer push a la rama principal

## Optimizaciones de Rendimiento

- **Queries optimizadas**: Solo se seleccionan columnas necesarias
- **Caché agresivo**: 60 segundos en localStorage
- **Sin SSR**: Build estático puro para CDN global
- **Cloudflare**: Configurar caché de 1 minuto para peticiones GET a Supabase

## Estructura del Proyecto

```
src/
├── components/       # Componentes UI
│   ├── TabNavigation.tsx
│   ├── NecesidadesView.tsx
│   └── VoluntariosView.tsx
├── hooks/           # Custom hooks
│   └── useCache.ts
├── lib/             # Configuraciones
│   └── supabase.ts
├── services/        # Lógica de negocio
│   └── supabaseService.ts
├── types/           # Definiciones TypeScript
│   └── index.ts
└── App.tsx          # Componente principal
```

## Contribuir

Este proyecto es de código abierto y busca colaboradores para mejorar la plataforma de ayuda humanitaria.

## Licencia

MIT License - Libre para uso humanitario
