import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Nav from '@/components/Nav'

export const revalidate = 0

export default function CookiesPage() {
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <Nav />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
          letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 8,
        }}>
          Política de Cookies
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 32 }}>
          Última actualización: 16 de junio de 2026
        </p>

        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>

          <p style={{ marginBottom: 20 }}>
            Esta página explica qué cookies y tecnologías similares utiliza Stationly y para qué las usamos.
          </p>

          <h2 style={sectionTitle}>1. Qué son las cookies</h2>
          <p>
            Las cookies son pequeños archivos de texto que un sitio web guarda en tu navegador. También usamos almacenamiento local del navegador (localStorage), que funciona de forma similar pero permanece en tu dispositivo en lugar de enviarse en cada solicitud.
          </p>

          <h2 style={sectionTitle}>2. Qué usamos en Stationly</h2>
          <ul style={listStyle}>
            <li><strong>Cookies de sesión (necesarias):</strong> usadas por nuestro proveedor de autenticación (Supabase) para mantenerte conectado mientras usas la plataforma. Sin estas cookies no podrías iniciar sesión.</li>
            <li><strong>localStorage (necesario para funcionalidad):</strong> guardamos tu preferencia de tema (oscuro/claro) y color de la app en tu navegador, así como borradores temporales de setups que estés editando, para que no pierdas tu progreso si cierras la pestaña por accidente.</li>
          </ul>

          <h2 style={sectionTitle}>3. Lo que NO usamos</h2>
          <p>
            Stationly no utiliza cookies de publicidad, cookies de seguimiento de terceros, ni píxeles publicitarios. No vendemos datos de navegación a anunciantes ni a redes publicitarias.
          </p>

          <h2 style={sectionTitle}>4. Cookies de terceros</h2>
          <p>
            Si haces clic en un enlace de compra hacia Amazon o PcComponentes, esas tiendas pueden establecer sus propias cookies una vez que abandonas Stationly, conforme a sus propias políticas de cookies.
          </p>

          <h2 style={sectionTitle}>5. Cómo gestionar las cookies</h2>
          <p>
            Puedes eliminar o bloquear cookies desde la configuración de tu navegador. Ten en cuenta que bloquear las cookies necesarias para la sesión puede impedir que puedas iniciar sesión correctamente en Stationly.
          </p>

          <h2 style={sectionTitle}>6. Más información</h2>
          <p>
            Para más detalles sobre cómo tratamos tus datos en general, consulta nuestra{' '}
            <a href="/legal/privacidad" style={{ color: 'var(--accent)' }}>Política de Privacidad</a>.
          </p>

        </div>
      </div>
    </ThemeProvider>
  )
}

const sectionTitle = {
  fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800,
  color: 'var(--text)', marginTop: 28, marginBottom: 12,
}

const listStyle = {
  marginBottom: 16, paddingLeft: 20, display: 'flex', flexDirection: 'column' as const, gap: 8,
}
