import Header from './components/Header'
import Image from 'next/image'
import ExploreBg from "@/public/explorebg.jpg"
import {Particles} from '@/components/ui/particles'
import AsciiComingSoon from './components/AsciiComingSoon'

export default function page() {
  return (
    <div className='relative w-full min-h-screen flex flex-col overflow-hidden'>

       <Header />
       <div className="absolute inset-0 -z-20">
        <Image
          src={ExploreBg}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover relative"
        />
      </div>

        <div className="pointer-events-none fixed left-0 top-0 z-[-10] h-full w-12 bg-gradient-to-r from-black/30 via-black/10 to-transparent backdrop-blur-sm" />

        <div className="pointer-events-none fixed right-0 top-0 z-[-10] h-full w-12 bg-gradient-to-l from-black/30 via-black/10 to-transparent backdrop-blur-sm" />


              <Particles
               className="absolute  inset-0" />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <AsciiComingSoon />
      </main>
    </div>
  )
}
