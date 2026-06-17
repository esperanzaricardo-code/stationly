import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import Nav from '@/components/Nav'
import SettingsLayout from '@/components/SettingsLayout'
import Footer from '@/components/Footer'
export const revalidate = 0
export const dynamic = 'force-dynamic'
export default function SettingsPage() {
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Nav />
        <div style={{ flex: 1 }}>
          <SettingsLayout />
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
