import { Navbar } from './_components/navbar';

const GeneralLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className='h-full flex flex-col bg-slate-50'>
      <Navbar />
      {children}
    </div>
  );
};

export default GeneralLayout;