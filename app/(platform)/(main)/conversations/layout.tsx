import { ConversationList } from "./_components/conversation-list";

export default async function ConversationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-full">
    <ConversationList />
    {children}
    </div>;
}