# 🚗 FleetManager Pro

App de gestión de flota de vehículos. PWA instalable en Android.

## Stack
- **Next.js 14** — Framework
- **Supabase** — Base de datos + Auth
- **Vercel** — Despliegue
- **Tailwind CSS** — Estilos

---

## 🚀 Configuración paso a paso

### 1. Supabase

1. Ve a [supabase.com](https://supabase.com) y abre tu proyecto
2. Ve a **SQL Editor** y pega el contenido de `supabase-schema.sql` y ejecuta
3. Ve a **Project Settings > API** y copia:
   - `Project URL`
   - `anon public key`

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz:

```
NEXT_PUBLIC_SUPABASE_URL=tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Crear usuario en Supabase

1. Ve a **Authentication > Users** en Supabase
2. Haz clic en **Add user**
3. Introduce email y contraseña para el administrador

### 4. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/fleet-app.git
git push -u origin main
```

### 5. Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) e importa el repositorio de GitHub
2. En **Environment Variables** añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Haz clic en **Deploy**

---

## 📱 Instalar como app en Android

1. Abre la web en Chrome en tu Android
2. Toca el menú de 3 puntos (arriba a la derecha)
3. Selecciona **"Añadir a pantalla de inicio"**
4. ¡Listo! Aparece como app nativa

---

## Funcionalidades

- ✅ Login seguro con Supabase Auth
- ✅ Gestión de vehículos (añadir, editar, eliminar)
- ✅ Reservas de vehículos por conductor
- ✅ Registro de mantenimiento con alertas
- ✅ Dashboard con resumen de la flota
- ✅ Diseño responsive (móvil y escritorio)
- ✅ Instalable como PWA en Android
