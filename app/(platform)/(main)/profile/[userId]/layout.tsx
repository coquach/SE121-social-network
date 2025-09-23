const ProfileLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="h-screen w-full">
      <div className="container lg:px-20 xl:px-40 h-full  mx-auto">
        <div className="p-2 w-full h-full">{children}</div>
      </div>
    </div>
  );
};

export default ProfileLayout;
