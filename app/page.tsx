import { ThemeProvider } from '@/components/ThemeProvider'
import AnimatedBackground from '@/components/AnimatedBackground'
import LandingNav from '@/components/LandingNav'
import LandingHero from '@/components/LandingHero'
import LandingFeatures from '@/components/LandingFeatures'
import LandingFooter from '@/components/LandingFooter'

export default function LandingPage() {
  return (
    <ThemeProvider>
      <AnimatedBackground />
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingFooter />
    </ThemeProvider>
  )
}
