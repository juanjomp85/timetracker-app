# TimeTracker - Control de Horario Empresarial

Una aplicación moderna e intuitiva para el control de horarios empresariales, construida con React, TypeScript y Tailwind CSS.

## 🚀 Características

- **Dashboard en tiempo real** - Reloj en vivo y sistema de fichaje
- **Historial completo** - Registro detallado de entradas y salidas
- **Análisis estadísticos** - Gráficos y métricas de productividad
- **Interfaz responsive** - Optimizada para desktop y móvil
- **Tema claro/oscuro** - Diseño adaptable según preferencias del usuario

## 🛠️ Tecnologías

- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **UI Components**: Shadcn/ui, Lucide React
- **Gráficos**: Recharts
- **Backend**: Supabase Edge Functions
- **Base de datos**: Supabase PostgreSQL
- **Deployment**: Netlify

## 📦 Instalación Local

1. **Clona el repositorio**
   ```bash
   git clone <repository-url>
   cd time-tracker-app
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   Crea un archivo `.env.local`:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## 🌐 Despliegue en Netlify

### Opción 1: Deploy automático desde Git

1. **Conecta tu repositorio a Netlify**
   - Ve a [Netlify](https://app.netlify.com)
   - Click en "New site from Git"
   - Selecciona tu repositorio

2. **Configuración de build**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Variables de entorno**
   En Netlify Dashboard → Site settings → Environment variables, añade:
   ```
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

### Opción 2: Deploy manual

1. **Construye el proyecto**
   ```bash
   npm run build
   ```

2. **Sube la carpeta dist a Netlify**
   - Arrastra la carpeta `dist` a netlify.com
   - O usa Netlify CLI: `netlify deploy --prod --dir=dist`

## 🔧 Configuración de Supabase

### 1. Edge Functions

Las funciones del backend están en `/supabase/functions/server/`. Para desplegarlas:

```bash
# Instala Supabase CLI
npm install -g supabase

# Login a Supabase
supabase login

# Despliega las funciones
supabase functions deploy server
```

### 2. Base de datos

El proyecto usa una tabla `kv_store` para almacenamiento. La tabla se crea automáticamente cuando se ejecutan las funciones.

### 3. Variables de entorno en Supabase

Configura estas variables en tu proyecto de Supabase:

```
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## 🔒 Seguridad

- Las claves de servicio solo se usan en el backend
- CORS configurado para el dominio de producción
- Headers de seguridad incluidos en netlify.toml
- Validación de entrada en todas las APIs

## 📝 Comandos disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa del build
npm run lint         # Linter de código
```

## 🚨 Troubleshooting

### Error de CORS
Verifica que el URL de Supabase esté correctamente configurado y que las funciones estén desplegadas.

### Variables de entorno no definidas
Asegúrate de que todas las variables de entorno estén configuradas tanto en Netlify como en Supabase.

### Problemas de build
Verifica que la versión de Node.js sea 18 o superior y que todas las dependencias estén instaladas.

## 📞 Soporte

Si tienes problemas con el despliegue:

1. Revisa los logs de build en Netlify
2. Verifica que las funciones de Supabase estén activas
3. Confirma que todas las variables de entorno estén configuradas

## 🔗 Enlaces útiles

- [Documentación de Netlify](https://docs.netlify.com)
- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Tailwind CSS v4](https://tailwindcss.com/docs)
- [Componentes Shadcn/ui](https://ui.shadcn.com)