import { Navbar } from './_components/navbar';

const NewsFeedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className='h-full'>
      <Navbar />
      {children}
    </div>
  );
};

export default NewsFeedLayout;
