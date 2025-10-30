import { Navbar } from './_components/navbar';

const GeneralLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />
      {children}
    </div>
  );
};

export default GeneralLayout;