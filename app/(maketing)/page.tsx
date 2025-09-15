import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Montserrat } from 'next/font/google';
import Link from 'next/link';

const textFont = Montserrat({
  subsets: ["latin"],
  weight: [
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900'
  ]
})
export default function MarketingPage() {
  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='flex flex-col items-center justify-center'>
        <h1 className='text-3xl md:text-6xl text-center font-extrabold text-neutral-800 mb-6'>
          Sentimeta helps people
        </h1>
        <div className='text-3xl md:text-6xl bg-gradient-to-r from-sky-400 to-sky-600 text-white px-4 p-2 rounded-md pb-4 w-fit'>
          understand feelings.
        </div>
      </div>
      <div
        className={cn(
          'text-sm text-center md:text-xl text-neutral-400 mt-4 max-w-xs md:max-w-2xl mx-auto',
          textFont.className
        )}
      >
        Kết nối, chia sẻ và khám phá cảm xúc thật sự. Từ tương tác hằng ngày đến
        phân tích tâm trạng chuyên sâu,
        Sentimeta giúp bạn hiểu rõ hơn chính mình và mọi người.
      </div>
      <Button className='mt-6' size={'lg'} asChild>
        <Link href={'/sign-up'}>Join Sentimeta for free </Link>
      </Button>
    </div>
  );
}
