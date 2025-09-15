import Image from 'next/image';

export const Logo = () => {
  return (
    <div className=' transition items-center gap-x-2 hidden md:flex'>
      <Image src={'/logo.svg'} alt='logo' height={80} width={80} />
      <p className='text-5xl font-bold  text-sky-400'>Sentimeta</p>
    </div>
  );
};
