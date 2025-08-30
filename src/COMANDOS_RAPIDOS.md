# 🚀 Comandos Rápidos - TimeTracker

## 🔥 Comandos Más Usados

### Deploy completo desde cero
```bash
# 1. Subir cambios a GitHub
git add .
git commit -m "🚀 Deploy to production"
git push

# 2. Redeployar Supabase functions
supabase functions deploy server

# 3. Netlify se actualiza automáticamente
```

### Desarrollo local
```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build local (para probar antes de deploy)
npm run build

# Preview del build
npm run preview
```

### Gestión de Supabase
```bash
# Ver funciones desplegadas
supabase functions list

# Ver logs en tiempo real
supabase functions logs server --follow

# Redeployar función específica
supabase functions deploy server

# Ver variables de entorno
supabase secrets list

# Configurar nueva variable
supabase secrets set NUEVA_VARIABLE=valor
```

---

## 🚨 Soluciones Rápidas (Quick Fixes)

### "Site is not working" - Checklist de 2 minutos

1. **¿El build pasó?**
   ```
   Netlify Dashboard → Tu Site → Deploys
   ✅ Debe decir "Published" en verde
   ```

2. **¿Variables de entorno correctas?**
   ```
   Netlify Dashboard → Site settings → Environment variables
   ✅ VITE_SUPABASE_URL
   ✅ VITE_SUPABASE_ANON_KEY
   ```

3. **¿Edge Functions activas?**
   ```bash
   supabase functions list
   # Debe mostrar "server" como "deployed"
   ```

4. **¿Errores en consola?**
   ```
   F12 → Console → Buscar errores en rojo
   ```

### Error: "Failed to fetch" o CORS

```bash
# Redeployar Edge Functions
supabase functions deploy server

# Si persiste, verificar variables
supabase secrets list
```

### Error: Build fallido en Netlify

```bash
# Test local primero
npm run build

# Si falla local:
rm -rf node_modules
npm install
npm run build

# Si funciona local, push de nuevo:
git add .
git commit -m "🔧 Fix build"
git push
```

### Logs no muestran datos

```bash
# Ver logs de Supabase en tiempo real
supabase functions logs server --follow

# Hacer una acción en la app y ver si aparecen logs
```

---

## 📱 URLs Importantes de Tu Proyecto

### Desarrollo
```
Local: http://localhost:5173
```

### Producción (reemplazar con tus URLs)
```
Netlify Site: https://tu-app.netlify.app
Supabase Dashboard: https://app.supabase.com/project/tu-project-id
GitHub Repo: https://github.com/tu-usuario/timetracker-app
```

---

## 🔄 Workflow de Desarrollo Recomendado

### Para cambios pequeños (CSS, texto, UI)
```bash
# 1. Hacer cambios
# 2. Test local
npm run dev

# 3. Deploy
git add .
git commit -m "🎨 UI improvements"
git push
# Netlify se actualiza automáticamente
```

### Para cambios en backend (Edge Functions)
```bash
# 1. Editar archivos en /supabase/functions/server/
# 2. Test local si es posible
# 3. Deploy backend
supabase functions deploy server

# 4. Deploy frontend
git add .
git commit -m "⚡ Backend updates"
git push
```

### Para nuevas features
```bash
# 1. Crear branch (opcional pero recomendado)
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y probar
npm run dev

# 3. Merge y deploy
git checkout main
git merge feature/nueva-funcionalidad
git push

# 4. Deploy backend si es necesario
supabase functions deploy server
```

---

## 🛠️ Debug Mode

### Activar logs detallados en frontend

Agrega esto temporalmente en tu `App.tsx`:

```typescript
// Debug mode - remover en producción
console.log('Environment:', {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  // NO loggear SUPABASE_ANON_KEY completa
  ANON_KEY_PREVIEW: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
});
```

### Activar logs en Edge Functions

Ya están activados en tu código, revisa con:
```bash
supabase functions logs server --follow
```

---

## 📊 Monitoreo

### Verificar que todo funcione (test semanal recomendado)

1. **✅ Site carga:** `https://tu-app.netlify.app`
2. **✅ Dashboard:** Sistema de fichaje funciona
3. **✅ Historial:** Se muestran registros
4. **✅ Analytics:** Gráficos cargan
5. **✅ Responsive:** Probar en móvil

### Logs importantes a revisar

```bash
# Ver últimos errores
supabase functions logs server --limit 50

# Ver logs de Netlify
# Dashboard → Functions → View logs
```

---

## 🚀 Optimizaciones Post-Deploy

### Performance
```bash
# Analizar bundle size
npm run build
# Revisar carpeta dist/ para archivos muy grandes
```

### SEO
- Verificar que `index.html` tenga meta tags correctos ✅ (ya incluidos)
- Probar velocidad en [PageSpeed Insights](https://pagespeed.web.dev)

### Seguridad
- Variables de entorno no expuestas ✅ (ya verificado)
- HTTPS activo ✅ (automático con Netlify)

---

## 📞 Contactos de Emergencia

**Si algo se rompe completamente:**

1. **Rollback rápido:**
   ```bash
   # En Netlify Dashboard
   Deploys → Deploy from previous version
   ```

2. **Reset completo Edge Functions:**
   ```bash
   supabase functions delete server
   supabase functions deploy server
   ```

3. **Verificar status de servicios:**
   - [Netlify Status](https://www.netlifystatus.com)
   - [Supabase Status](https://status.supabase.com)

---

## 💡 Tips Pro

### Automatizar más el workflow
```bash
# Crear script de deploy completo
echo '#!/bin/bash
npm run build
git add .
git commit -m "🚀 Auto deploy $(date)"
git push
supabase functions deploy server
echo "✅ Deploy completed!"' > deploy.sh

chmod +x deploy.sh
./deploy.sh
```

### Backup de configuración
```bash
# Exportar configuración actual
supabase secrets list > supabase-secrets-backup.txt
# Guardar este archivo en lugar seguro
```

### Monitoreo automático
- Configurar [UptimeRobot](https://uptimerobot.com) para monitorear tu site
- Configurar alertas por email si el site se cae

¿Necesitas que añada algo más específico a estos comandos?