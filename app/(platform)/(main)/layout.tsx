import { Navbar } from './_components/navbar';

const GeneralLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />
      <div className="pt-16 w-screen h-full">{children}</div>
    </div>
  );
};

export default GeneralLayout;
