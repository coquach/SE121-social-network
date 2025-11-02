import { Navbar } from './_components/navbar';

const GeneralLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />
      <div className="pt-16 w-screen">{children}</div>
    </div>
  );
};

export default GeneralLayout;
