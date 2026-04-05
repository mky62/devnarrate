import Header from './components/Header'
import Image from 'next/image'
import Exxplorebg from "@/public/dashbg.jpg"
import {Particles} from '@/components/ui/particles'

export default function page() {
  return (
    <div className='w-full h-full flex flex-col'>

       <Header />
       <div className="absolute inset-0 -z-20">
        <Image
          src={Exxplorebg}
          alt="Authentication background"
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
    </div>
  )
}
