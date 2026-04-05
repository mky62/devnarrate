
import Header from './components/Header'
import Image from 'next/image'
import Exxplorebg from "@/public/dashbg.jpg"
import {Particles} from '@/components/ui/particles'

export default function page() {
  return (
    <div className='w-full h-full flex flex-col'>
        <Image
                src={Exxplorebg}
                alt="Authentication background"
                fill
                priority
                sizes="100vw"
                className="absolute inset-0 -z-20 object-cover"
            />

              <Particles
               className="absolute inset-0" />

      <Header />
    </div>
  )
}
