import { Navbar } from './_components/navbar';

const GeneralLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <main className="h-screen bg-slate-50 overflow-x-hidden">
      <Navbar />
      <section className="pt-16 w-screen h-full">{children}</section>
    </main>
  );
};

export default GeneralLayout;
