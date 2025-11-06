import { Sidebar } from './_components/sidebar';

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="grid grid-cols-4 w-full">
        <div className="w-1/4 h-full p-2 overflow-y-hidden fixed">
          <Sidebar />
        </div>

        <main className="col-span-4 sm:col-start-2 lg:col-start-2 sm:col-span-3 lg:col-span-3 px-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
}
