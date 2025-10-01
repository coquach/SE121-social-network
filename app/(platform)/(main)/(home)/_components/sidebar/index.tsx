'use client'
import { ChartColumn, UserCircle, Users } from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { useAuth } from "@clerk/nextjs";

export const Sidebar = () => {
  const {userId} = useAuth()

  if (!userId) {
    return (
      <div className="col-span-1 h-full p-2">
        <div className="flex flex-col items-end space-y-2 w-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 w-full animate-pulse"
            >
              <div className="h-14 w-14 rounded-full bg-gray-300 sm:hidden"></div>
              <div className="hidden sm:flex items-center gap-4 w-full">
                <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                <div className="flex-1 h-10 w-24 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  const items = [
    {
      label: 'Profile',
      href: `/profile/${userId}`,
      icon: UserCircle
    }, 
    {
      label: "Friends",
      href: '/friends',
      icon: Users
    }, 
    {
      label: "Dashboard",
      href: '/dashboard',
      icon: ChartColumn
    }

  ];
  return (
    <div className="col-span-1 h-full  p-2 md:pr-2">
        <div className="flex flex-col items-end">
          <div className="space-y-2 w-full">
              {items.map((item) => (
                <SidebarItem 
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
          </div>
        </div>
    </div>
  )
}