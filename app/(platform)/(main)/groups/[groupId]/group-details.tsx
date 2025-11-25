import { useGetGroupById } from "@/hooks/use-groups";
import { group } from "console";

export const GroupDetails = ({groupId}: {groupId: string}) => {
  const {data, isLoading, isError, error} = useGetGroupById(groupId);
  return (
    <div>Group Details Page for group ID: {groupId}</div>
  )
}