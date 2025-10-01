const ProfileLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="relative h-full overflow-y-scroll bg-gray-50 p-6">
      <div className="container lg:px-20 xl:px-40  mx-auto">
        {children}
      </div>
    </div>
  );
};

export default ProfileLayout;
