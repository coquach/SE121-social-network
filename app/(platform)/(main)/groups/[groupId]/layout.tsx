import { Group } from "lucide-react";
import { GroupHeader } from "./_components/group-header";
import { GroupTabs } from "./_components/group-tabs";

const GroupDetailsLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="relative bg-gray-50 p-6  container mx-auto space-y-4">
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <GroupHeader />
        <hr />
        <GroupTabs />
      </div>
      <section className="w-full">{children}</section>
    </div>
  );
}
export default GroupDetailsLayout;