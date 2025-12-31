
import { ChatBox } from './_components/chat-box';
import { Navbar } from './_components/navbar';

const GeneralLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <main className="relative h-screen bg-slate-50 overflow-hidden">
      <Navbar />
      <section className="mt-16 h-[calc(100vh-4rem)] w-full overflow-y-scroll app-scroll">
        {children}
      </section>
      <ChatBox />
    </main>
  );
};

export default GeneralLayout;
