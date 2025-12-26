import { UserProfileInfo } from "./_components/user-profile-info";

const ProfileLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="relative max-w-6xl bg-gray-50 container lg:px-20   mx-auto space-y-4">
      <div className="bg-white rounded-b-2xl shadow overflow-hidden">
        <UserProfileInfo />
      </div>

      <section>{children}</section>
    </div>
  );
};

export default ProfileLayout;
