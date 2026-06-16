import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Nav from '@/components/Nav'

export const revalidate = 0

export default function TermsPage() {
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <Nav />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
          letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 8,
        }}>
          Términos de Servicio
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 32 }}>
          Última actualización: 16 de junio de 2026
        </p>

        <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>

          <p style={{ marginBottom: 20 }}>
            Estos Términos de Servicio regulan el uso de Stationly. Al crear una cuenta o usar la plataforma, aceptas estos términos. Si no estás de acuerdo, no debes usar Stationly.
          </p>

          <h2 style={sectionTitle}>1. Descripción del servicio</h2>
          <p>
            Stationly es una plataforma social donde gamers y streamers pueden mostrar las fotos de sus setups, identificar y catalogar los componentes que usan, y descubrir productos a través de enlaces de afiliados a tiendas como Amazon y PcComponentes. El servicio se encuentra actualmente en fase beta y puede sufrir cambios, interrupciones o discontinuación de funciones sin previo aviso.
          </p>

          <h2 style={sectionTitle}>2. Registro y cuenta</h2>
          <ul style={listStyle}>
            <li>Debes proporcionar un email válido y elegir un nombre de usuario para registrarte.</li>
            <li>Eres responsable de mantener la confidencialidad de tu contraseña y de toda actividad que ocurra en tu cuenta.</li>
            <li>Debes ser mayor de 16 años para crear una cuenta en Stationly.</li>
            <li>Nos reservamos el derecho de suspender o eliminar cuentas que incumplan estos términos.</li>
          </ul>

          <h2 style={sectionTitle}>3. Contenido que publicas</h2>
          <ul style={listStyle}>
            <li>Mantienes la propiedad de las fotos y el contenido que subes a Stationly.</li>
            <li>Al publicar contenido, nos concedes una licencia no exclusiva para mostrarlo públicamente dentro de la plataforma (en tu perfil, en el feed, y en el índice de componentes).</li>
            <li>No debes subir contenido que sea ilegal, ofensivo, que infrinja derechos de terceros, o que contenga desnudez, violencia gráfica o discurso de odio.</li>
            <li>Nos reservamos el derecho de eliminar cualquier contenido que incumpla estas normas, ya sea de forma automática (moderación por IA) o tras un reporte de otro usuario.</li>
          </ul>

          <h2 style={sectionTitle}>4. Identificación de componentes mediante IA</h2>
          <p>
            Stationly utiliza inteligencia artificial para identificar automáticamente los componentes de tu setup a partir del texto o fotos que proporciones. Esta identificación es una ayuda automatizada y puede contener errores o imprecisiones. Eres responsable de revisar y corregir los nombres de los componentes antes de publicarlos. Stationly no garantiza la exactitud de las identificaciones generadas por IA.
          </p>

          <h2 style={sectionTitle}>5. Enlaces de afiliados</h2>
          <ul style={listStyle}>
            <li>Stationly participa en el Programa de Afiliados de Amazon y puede mostrar enlaces hacia PcComponentes y otras tiendas. Esto significa que podemos recibir una comisión por las compras realizadas a través de esos enlaces, sin coste adicional para ti.</li>
            <li>Si configuras tu propio ID de afiliado de Amazon Associates, los enlaces de tus componentes usarán tu identificador en lugar del de Stationly.</li>
            <li>No garantizamos disponibilidad, precio ni características de los productos enlazados, ya que dependen enteramente de las tiendas externas.</li>
          </ul>

          <h2 style={sectionTitle}>6. Conducta del usuario</h2>
          <p style={{ marginBottom: 12 }}>Al usar Stationly, te comprometes a no:</p>
          <ul style={listStyle}>
            <li>Publicar contenido falso, engañoso, o que suplante la identidad de otra persona.</li>
            <li>Usar la plataforma para acosar, amenazar o difamar a otros usuarios.</li>
            <li>Intentar acceder sin autorización a cuentas o sistemas de Stationly.</li>
            <li>Utilizar bots, scrapers o medios automatizados para extraer datos de la plataforma sin autorización previa.</li>
            <li>Publicar enlaces de afiliados ajenos a tu propia cuenta de forma fraudulenta.</li>
          </ul>

          <h2 style={sectionTitle}>7. Sistema de reportes y moderación</h2>
          <p>
            Los usuarios pueden reportar setups que consideren inapropiados. Revisamos los reportes y podemos eliminar contenido o suspender cuentas a nuestra discreción si determinamos que se ha incumplido estos términos.
          </p>

          <h2 style={sectionTitle}>8. Eliminación de cuenta</h2>
          <p>
            Puedes eliminar tu cuenta en cualquier momento desde Configuración → Privacidad y datos. Al eliminar tu cuenta, tu contenido público (setups, componentes, perfil) se eliminará de forma permanente. Esta acción no se puede revertir.
          </p>

          <h2 style={sectionTitle}>9. Limitación de responsabilidad</h2>
          <p>
            Stationly se ofrece "tal cual", sin garantías de ningún tipo. No nos hacemos responsables de pérdidas derivadas del uso de la plataforma, de errores en la identificación automática de componentes, de la indisponibilidad temporal del servicio, ni de transacciones realizadas en tiendas externas a través de nuestros enlaces.
          </p>

          <h2 style={sectionTitle}>10. Modificaciones del servicio</h2>
          <p>
            Podemos modificar, suspender o discontinuar cualquier función de Stationly en cualquier momento, dado que el servicio se encuentra en fase beta de desarrollo activo.
          </p>

          <h2 style={sectionTitle}>11. Cambios en estos términos</h2>
          <p>
            Podemos actualizar estos Términos de Servicio ocasionalmente. Si hacemos cambios significativos, te lo notificaremos mediante un aviso visible en la plataforma.
          </p>

          <h2 style={sectionTitle}>12. Ley aplicable</h2>
          <p>
            Estos términos se rigen por la legislación española. Cualquier disputa se someterá a los tribunales competentes de España, sin perjuicio de los derechos que la normativa de protección al consumidor pueda reconocerte en tu país de residencia.
          </p>

          <h2 style={sectionTitle}>13. Contacto</h2>
          <p>
            Para cualquier duda sobre estos términos, escríbenos a{' '}
            <a href="mailto:contacto@stationly.com" style={{ color: 'var(--accent)' }}>contacto@stationly.com</a>.
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
