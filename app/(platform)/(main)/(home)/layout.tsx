import { Sidebar } from './_components/sidebar';

const NewsFeedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <div className="grid grid-cols-4 h-full w-full pt-16" >
        <Sidebar />
        <main className=" col-span-3 lg:col-span-2 px-8">{children}</main>
      </div>
    </>
  );
};

export default NewsFeedLayout;
