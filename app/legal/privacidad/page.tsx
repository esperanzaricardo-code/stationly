import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Nav from '@/components/Nav'

export const revalidate = 0

export default function PrivacyPage() {
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <Nav />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
          letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 8,
        }}>
          Política de Privacidad
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 32 }}>
          Última actualización: 16 de junio de 2026
        </p>

        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>

          <p style={{ marginBottom: 20 }}>
            Esta Política de Privacidad explica cómo Stationly recoge, usa y protege tu información cuando utilizas la plataforma. Stationly es operada actualmente por una persona física a título individual ("nosotros", "el Responsable"). Puedes contactarnos en{' '}
            <a href="mailto:privacidad@stationly.com" style={{ color: 'var(--accent)' }}>privacidad@stationly.com</a> para cualquier duda sobre privacidad o tus datos.
          </p>

          <h2 style={sectionTitle}>1. Qué datos recogemos</h2>
          <p style={{ marginBottom: 12 }}>Recogemos los siguientes datos cuando usas Stationly:</p>
          <ul style={listStyle}>
            <li><strong>Datos de cuenta:</strong> email, nombre de usuario, contraseña (almacenada cifrada por nuestro proveedor de autenticación, nunca en texto plano).</li>
            <li><strong>Contenido que publicas:</strong> fotos de tu setup, título, categorías, lista de componentes, color elegido y cualquier otro dato que decidas compartir en tu perfil público.</li>
            <li><strong>Datos de uso:</strong> interacciones como likes, reportes que envíes, y preferencias de la interfaz (tema claro/oscuro, color de la app).</li>
            <li><strong>Datos técnicos:</strong> dirección IP y datos de navegación recogidos automáticamente por nuestro proveedor de hosting (Vercel) con fines de seguridad y rendimiento.</li>
            <li><strong>Datos de afiliados (opcional):</strong> si configuras tu propio ID de afiliado de Amazon Associates, ese identificador se asocia a tu cuenta para generar tus enlaces.</li>
          </ul>

          <h2 style={sectionTitle}>2. Cómo usamos tus datos</h2>
          <ul style={listStyle}>
            <li>Para crear y gestionar tu cuenta y tu perfil público.</li>
            <li>Para mostrar tus setups y componentes en el feed público y en el índice de componentes.</li>
            <li>Para identificar automáticamente los componentes de tu setup mediante inteligencia artificial (ver sección 5).</li>
            <li>Para generar enlaces de compra hacia Amazon y PcComponentes asociados a los componentes que publiques.</li>
            <li>Para moderar contenido y prevenir abusos (por ejemplo, revisar reportes de otros usuarios).</li>
            <li>Para mejorar la plataforma y solucionar errores técnicos.</li>
          </ul>

          <h2 style={sectionTitle}>3. Base legal del tratamiento</h2>
          <p style={{ marginBottom: 12 }}>
            Tratamos tus datos bajo las siguientes bases legales del Reglamento General de Protección de Datos (RGPD):
          </p>
          <ul style={listStyle}>
            <li><strong>Ejecución de un contrato:</strong> para prestarte el servicio que has solicitado al crear una cuenta.</li>
            <li><strong>Consentimiento:</strong> para datos opcionales como tu ID de afiliado o preferencias de apariencia.</li>
            <li><strong>Interés legítimo:</strong> para la seguridad de la plataforma y la prevención de abusos.</li>
          </ul>

          <h2 style={sectionTitle}>4. Con quién compartimos tus datos</h2>
          <p style={{ marginBottom: 12 }}>No vendemos tus datos personales. Los compartimos únicamente con:</p>
          <ul style={listStyle}>
            <li><strong>Supabase</strong> (alojado en la región UE — Irlanda): almacena la base de datos de la plataforma (cuentas, setups, perfiles).</li>
            <li><strong>Vercel:</strong> aloja la aplicación web y procesa las solicitudes que haces al usar Stationly.</li>
            <li><strong>Anthropic (Claude API):</strong> procesa el texto e imágenes que envías al usar la función de identificación automática de componentes, únicamente con ese propósito.</li>
            <li><strong>Otros usuarios:</strong> tu nombre de usuario, setups, componentes y estadísticas públicas (likes, número de setups) son visibles para cualquier visitante de la plataforma, ya que Stationly es una red social pública.</li>
          </ul>
          <p>
            Cuando haces clic en un enlace de compra hacia Amazon o PcComponentes, sales de Stationly y pasas a estar sujeto a las políticas de privacidad de esas tiendas.
          </p>

          <h2 style={sectionTitle}>5. Uso de inteligencia artificial</h2>
          <p>
            Stationly utiliza la API de Claude (Anthropic) para identificar automáticamente los componentes de tu setup a partir de texto o fotos que subas, y para moderar que las imágenes no contengan contenido inapropiado. Estos contenidos se envían a Anthropic únicamente para procesar esa solicitud puntual y no se utilizan para entrenar modelos de IA por parte de Stationly.
          </p>

          <h2 style={sectionTitle}>6. Cuánto tiempo conservamos tus datos</h2>
          <p>
            Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, tus datos personales y contenido publicado se eliminarán de forma permanente de nuestros sistemas, salvo aquellos que debamos conservar por obligación legal (por ejemplo, registros necesarios para investigar abusos reportados antes de la eliminación).
          </p>

          <h2 style={sectionTitle}>7. Tus derechos</h2>
          <p style={{ marginBottom: 12 }}>Bajo el RGPD, tienes derecho a:</p>
          <ul style={listStyle}>
            <li><strong>Acceder</strong> a los datos personales que tenemos sobre ti.</li>
            <li><strong>Rectificar</strong> datos inexactos directamente desde tu perfil o configuración.</li>
            <li><strong>Eliminar</strong> tu cuenta y tus datos personales (disponible desde Configuración → Privacidad y datos).</li>
            <li><strong>Exportar</strong> tus datos en un formato legible (disponible desde Configuración → Privacidad y datos).</li>
            <li><strong>Oponerte</strong> u oponerte al tratamiento de tus datos, u oponerte a su uso para ciertos fines.</li>
            <li><strong>Presentar una reclamación</strong> ante la Agencia Española de Protección de Datos (AEPD) si consideras que no hemos cumplido con tus derechos.</li>
          </ul>
          <p>
            Para ejercer cualquiera de estos derechos, escríbenos a{' '}
            <a href="mailto:privacidad@stationly.com" style={{ color: 'var(--accent)' }}>privacidad@stationly.com</a>.
          </p>

          <h2 style={sectionTitle}>8. Cookies</h2>
          <p>
            Stationly utiliza almacenamiento local del navegador (localStorage) para recordar tus preferencias de apariencia (tema y color), y cookies técnicas necesarias para mantener tu sesión iniciada. No utilizamos cookies de publicidad ni de seguimiento de terceros.
          </p>

          <h2 style={sectionTitle}>9. Menores de edad</h2>
          <p>
            Stationly no está dirigida a menores de 16 años. Si tienes conocimiento de que un menor de esa edad ha creado una cuenta, contáctanos para proceder a su eliminación.
          </p>

          <h2 style={sectionTitle}>10. Cambios en esta política</h2>
          <p>
            Podemos actualizar esta Política de Privacidad ocasionalmente. Si hacemos cambios significativos, te lo notificaremos mediante un aviso visible en la plataforma o por email.
          </p>

          <h2 style={sectionTitle}>11. Contacto</h2>
          <p>
            Para cualquier duda sobre esta política o sobre el tratamiento de tus datos, escríbenos a{' '}
            <a href="mailto:privacidad@stationly.com" style={{ color: 'var(--accent)' }}>privacidad@stationly.com</a>.
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
