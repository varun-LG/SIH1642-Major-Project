import Features from '@/components/LandingPage/Features/Features'
import HeroSection from '@/components/LandingPage/HeroSection/HeroSection'
import Testimonial from '@/components/LandingPage/Testimonial/Testimonial'
import CTA from '@/components/LandingPage/CTA/CTA'
import MentorsSection from '@/components/LandingPage/MentorsSection/MentorsSection'
// import Footer from '@/components/LandingPage/Footer/Footer'
function Main() {
  return (
    <div className='w-full'>
      <HeroSection />
      <Features />
      <MentorsSection />
      <Testimonial />
      <CTA />

    </div>
  )
}

export default Main
