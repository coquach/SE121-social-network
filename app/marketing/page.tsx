
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SignIn } from '@clerk/nextjs';
import { StarIcon } from 'lucide-react';
import { Montserrat } from 'next/font/google';

const textFont = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});
export default function MarketingPage() {
  return (
    <div className="min-h-screen md:flex-row flex flex-col">
      <div className="flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40">
        <Logo />
        <div>
          <div className="flex items-center gap-3 mb-4 max-md:mt-10">
            <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
              <Avatar className="">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage
                  src="https://github.com/leerob.png"
                  alt="@leerob"
                />
                <AvatarFallback>LR</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage
                  src="https://github.com/evilrabbit.png"
                  alt="@evilrabbit"
                />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div className="flex">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-4 h-4 md:w-4.5 md:h-4.5 text-transparent fill-amber-500"
                    />
                  ))}
              </div>
              <p>Used by 20k+ people</p>
            </div>
          </div>
          <h1 className="text-3xl md:text-6xl md:pb-2 font-extrabold bg-gradient-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent">
            More than just friends truly connect
          </h1>
          <p className='text-xl md:text-3xl text-indigo-900 max-w-72 md:max-w-md'>
            connect with global community on Sentimeta
          </p>
        </div>
        <span className='md:h-10'></span>
      </div>

      <div className='flex-1 flex items-center justify-center p-6 sm:p-10'>
          <SignIn />
      </div>

    </div>
  );
}
