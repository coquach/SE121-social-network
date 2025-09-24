import { Sidebar } from "./_components/sidebar";

const NewsFeedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className='h-screen w-full'>
      <div className="w-full h-full">
        <div className="grid grid-cols-4 h-full w-full">
          <Sidebar />
          <main className=" col-span-3 lg:col-span-2">
            {children}
          </main>
        </div>

      </div>
    
      
    </div>
  );
};

export default NewsFeedLayout;
