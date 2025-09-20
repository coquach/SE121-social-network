"use client"
import { useAuth, useUser } from "@clerk/nextjs";

const NewsFeedPage = () => {
  const {user}= useUser()
  return (
    <div>
     {user?.externalId}
    </div>
  )
}
export default NewsFeedPage;