const NoticationsLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="relative overflow-y-scroll bg-gray-50 p-6">
      <div className="container lg:px-20 xl:px-80  mx-auto">{children}</div>
    </div>
  );
};

export default NoticationsLayout;
