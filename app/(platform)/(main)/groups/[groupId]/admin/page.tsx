import { GroupAdminPanel } from "./admin-section";

type GroupAdminPageProps = {
  params: Promise<{ groupId: string }>;
};
export default async function GroupAdminPage({ params }: GroupAdminPageProps) {
  const { groupId } = await params; 
  return (
    <div className="px-4 py-4">
      <GroupAdminPanel groupId={groupId} />
    </div>
  );
}
