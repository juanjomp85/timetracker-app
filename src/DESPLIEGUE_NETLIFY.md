# 🚀 Guía Completa: Desplegar en Netlify

Esta guía te llevará paso a paso para desplegar tu aplicación TimeTracker en Netlify desde cero.

## 📋 Prerrequisitos

Antes de empezar, asegúrate de tener:
- [ ] Una cuenta en [GitHub](https://github.com) (recomendado) o GitLab
- [ ] Una cuenta en [Netlify](https://netlify.com)
- [ ] Una cuenta en [Supabase](https://supabase.com)
- [ ] Node.js 18+ instalado en tu computadora
- [ ] Git instalado en tu computadora

---

## 🎯 PASO 1: Subir el Código a GitHub

### 1.1 Crear un repositorio en GitHub

1. **Ve a GitHub.com** y haz login
2. **Haz click en el botón "+"** en la esquina superior derecha
3. **Selecciona "New repository"**
4. **Configura el repositorio:**
   - Repository name: `timetracker-app` (o el nombre que prefieras)
   - Description: `Aplicación de control de horario empresarial`
   - Visibilidad: **Public** (o Private si prefieres)
   - ✅ **NO marques** "Add a README file" (ya tenemos uno)
   - ✅ **NO marques** "Add .gitignore"
   - ✅ **NO marques** "Choose a license"
5. **Haz click en "Create repository"**

### 1.2 Subir tu código al repositorio

Abre una terminal en la carpeta de tu proyecto y ejecuta:

```bash
# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Crear el primer commit
git commit -m "🎉 Versión inicial de TimeTracker"

# Conectar con tu repositorio (reemplaza USERNAME y REPOSITORY)
git remote add origin https://github.com/TU_USUARIO/timetracker-app.git

# Subir el código
git branch -M main
git push -u origin main
```

**¿No tienes Git configurado?** Ejecuta primero:
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@ejemplo.com"
```

---

## 🌐 PASO 2: Conectar Netlify con GitHub

### 2.1 Crear un nuevo site en Netlify

1. **Ve a [app.netlify.com](https://app.netlify.com)** y haz login
2. **Haz click en "Add new site"**
3. **Selecciona "Import an existing project"**
4. **Elige "Deploy with GitHub"**
5. **Autoriza a Netlify** para acceder a tus repositorios
6. **Busca y selecciona** tu repositorio `timetracker-app`

### 2.2 Configurar el build

En la pantalla de configuración:

```
📁 Base directory: (dejar vacío)
🔧 Build command: npm run build
📂 Publish directory: dist
🔧 Functions directory: (dejar vacío)
```

### 2.3 Configurar variables de entorno

**¡IMPORTANTE!** No despliegues todavía. Antes necesitas configurar las variables de entorno.

1. **Haz click en "Advanced build settings"**
2. **Haz click en "New variable"** y añade estas variables (las necesitarás del siguiente paso):

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**Guarda esta pantalla** porque necesitarás volver aquí una vez que tengas las claves de Supabase.

---

## 🗄️ PASO 3: Configurar Supabase

### 3.1 Crear un proyecto en Supabase

1. **Ve a [supabase.com](https://supabase.com)** y haz login
2. **Haz click en "New project"**
3. **Selecciona tu organización**
4. **Configura el proyecto:**
   - Name: `TimeTracker`
   - Database Password: **Genera una contraseña segura y guárdala**
   - Region: **Selecciona la más cercana a tu ubicación**
5. **Haz click en "Create new project"**

⏰ **Espera 1-2 minutos** mientras Supabase configura tu base de datos.

### 3.2 Obtener las claves de API

1. **Ve a Settings → API** en tu proyecto de Supabase
2. **Copia estas claves:**
   - Project URL: `https://xxxxx.supabase.co`
   - `anon` `public` key: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`
   - `service_role` `secret` key: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`

⚠️ **IMPORTANTE:** Nunca compartas la `service_role` key públicamente.

### 3.3 Volver a configurar variables en Netlify

1. **Regresa a Netlify** (la pantalla que dejaste abierta)
2. **Configura las variables de entorno:**

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

3. **Haz click en "Deploy site"**

---

## ⚡ PASO 4: Desplegar las Edge Functions

### 4.1 Instalar Supabase CLI

```bash
# Con npm
npm install -g supabase

# Con macOS (si tienes Homebrew)
brew install supabase/tap/supabase
```

### 4.2 Login en Supabase CLI

```bash
supabase login
```

Se abrirá tu navegador para autorizar el CLI.

### 4.3 Enlazar tu proyecto

En la terminal, desde la carpeta de tu proyecto:

```bash
# Enlazar con tu proyecto de Supabase
supabase link --project-ref TU_PROJECT_ID
```

💡 **¿Dónde encuentro mi Project ID?** En Supabase Dashboard → Settings → General → Reference ID

### 4.4 Configurar variables de entorno en Supabase

```bash
# Configurar variables para las Edge Functions
supabase secrets set SUPABASE_URL=https://tu-proyecto.supabase.co
supabase secrets set SUPABASE_ANON_KEY=tu_anon_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 4.5 Desplegar las funciones

```bash
supabase functions deploy server
```

✅ **Si ves "Deployed successfully"**, ¡perfecto!

---

## 🎉 PASO 5: Verificar el Despliegue

### 5.1 Revisar el build en Netlify

1. **Ve a tu dashboard de Netlify**
2. **Haz click en tu site**
3. **Ve a la pestaña "Deploys"**
4. **Verifica que el último deploy sea "Published"** ✅

### 5.2 Probar tu aplicación

1. **Haz click en el URL de tu site** (algo como `https://magical-name-123456.netlify.app`)
2. **Verifica que la aplicación cargue correctamente**
3. **Prueba el sistema de fichaje** en el Dashboard
4. **Revisa que los gráficos se muestren** en Analytics

### 5.3 Revisar las Edge Functions

1. **Ve a Supabase Dashboard → Edge Functions**
2. **Verifica que aparezca "server"** con status "Active"
3. **Haz click en "server"** para ver los logs

---

## 🔧 PASO 6: Configurar un Dominio Personalizado (Opcional)

### 6.1 En Netlify

1. **Ve a Site settings → Domain management**
2. **Haz click en "Add custom domain"**
3. **Ingresa tu dominio:** `miempresa.com`
4. **Sigue las instrucciones** para configurar DNS

### 6.2 Configurar SSL

Netlify configurará automáticamente SSL con Let's Encrypt. ¡No necesitas hacer nada!

---

## 🚨 Troubleshooting (Solución de Problemas)

### ❌ Error: "Site failed to build"

**Solución:**
1. **Ve a Netlify → Site → Deploys**
2. **Haz click en el deploy fallido**
3. **Revisa los logs de error**
4. **Problemas comunes:**
   - Variables de entorno faltantes
   - Versión incorrecta de Node.js
   - Dependencias faltantes

**Fix rápido:**
```bash
# En tu proyecto local
npm install
npm run build
# Si esto funciona, haz push de nuevo
git add .
git commit -m "🔧 Fix build issues"
git push
```

### ❌ Error: "CORS policy" o "Failed to fetch"

**Causa:** Las Edge Functions no están configuradas correctamente.

**Solución:**
1. **Verifica que las funciones estén desplegadas:**
   ```bash
   supabase functions list
   ```

2. **Redespliega las funciones:**
   ```bash
   supabase functions deploy server --no-verify-jwt
   ```

3. **Verifica las variables de entorno:**
   ```bash
   supabase secrets list
   ```

### ❌ Error: "Unauthorized" al usar la app

**Causa:** Variables de entorno incorrectas.

**Solución:**
1. **Ve a Netlify → Site settings → Environment variables**
2. **Verifica que las URLs y keys sean correctas**
3. **Redeploy el site:**
   - Ve a Deploys → Trigger deploy → Deploy site

### ❌ Los gráficos no cargan

**Causa:** Problema con los datos del backend.

**Solución:**
1. **Abre las herramientas de desarrollador** (F12)
2. **Ve a la pestaña Console**
3. **Busca errores en rojo**
4. **Ve a la pestaña Network**
5. **Recarga la página y busca requests fallidos**

### ❌ "Function not found" error

**Solución:**
```bash
# Redeployar las funciones
supabase functions deploy server

# Verificar que estén activas
supabase functions list
```

---

## 📝 Comandos Útiles para Mantenimiento

### Actualizar el código

```bash
# En tu proyecto local, después de hacer cambios
git add .
git commit -m "✨ Nuevas funcionalidades"
git push
# Netlify autodesplegará automáticamente
```

### Ver logs de las Edge Functions

```bash
supabase functions logs server
```

### Redeployar solo el frontend

En Netlify → Deploys → Trigger deploy → Deploy site

### Actualizar variables de entorno

```bash
# Para Supabase
supabase secrets set VARIABLE_NAME=value

# Para Netlify: ve a Site settings → Environment variables
```

---

## ✅ Checklist Final

Antes de considerar tu despliegue completo, verifica:

- [ ] ✅ El site carga sin errores en Netlify
- [ ] ✅ El sistema de fichaje funciona (entrada/salida)
- [ ] ✅ El historial muestra registros de tiempo
- [ ] ✅ Los gráficos en Analytics se muestran
- [ ] ✅ Las Edge Functions están activas en Supabase
- [ ] ✅ No hay errores en la consola del navegador
- [ ] ✅ La aplicación es responsive en móvil
- [ ] ✅ El tema claro/oscuro funciona

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas:

1. **Revisa los logs** en Netlify y Supabase
2. **Verifica las variables de entorno**
3. **Prueba localmente** con `npm run dev`
4. **Revisa la consola del navegador** (F12)

**Enlaces útiles:**
- [Documentación de Netlify](https://docs.netlify.com)
- [Documentación de Supabase](https://supabase.com/docs)
- [Solución de problemas de Vite](https://vitejs.dev/guide/troubleshooting.html)

---

## 🎊 ¡Felicitaciones!

Si llegaste hasta aquí y todo funciona, ¡tu aplicación TimeTracker está oficialmente en vivo!

**Próximos pasos sugeridos:**
- 🔐 Implementar autenticación de usuarios
- 📊 Añadir más tipos de reportes
- 📱 Optimizar para uso móvil
- 🔔 Implementar notificaciones automáticas
- 💾 Configurar backup automático de datos