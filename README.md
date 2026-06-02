# Stationly 🖥️

Red social para streamers y creadores de contenido. Comparte tu setup, etiqueta tus componentes con IA y descubre los mejores escritorios.

---

## 🚀 Despliegue en 3 pasos

### Paso 1 — Supabase (base de datos)

1. Ve a [supabase.com](https://supabase.com) → tu proyecto
2. Haz clic en **SQL Editor** → **New query**
3. Copia y pega el contenido de `supabase-schema.sql`
4. Haz clic en **Run**

✅ Esto crea la tabla `setups`, los permisos y el bucket de imágenes.

---

### Paso 2 — GitHub (subir el código)

```bash
git init
git add .
git commit -m "Initial commit — Stationly"
git remote add origin https://github.com/TU_USUARIO/stationly.git
git push -u origin main
```

---

### Paso 3 — Vercel (despliegue)

1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Importa tu repo de GitHub `stationly`
3. En **Environment Variables** añade estas tres:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vggwirpllesliqoxfmjd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon key de Supabase |
| `ANTHROPIC_API_KEY` | Tu API key de Anthropic |

4. Haz clic en **Deploy**

En ~2 minutos tendrás tu URL pública: `stationly.vercel.app`

---

## 🛠 Desarrollo local

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## 🧱 Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Base de datos**: Supabase (PostgreSQL)
- **Almacenamiento de imágenes**: Supabase Storage
- **IA**: Anthropic Claude Vision (detección de componentes)
- **Despliegue**: Vercel
