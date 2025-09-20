'use client'
import { ChartColumn, UserCircle, Users } from "lucide-react";
import { SidebarItem } from "./sidebar-item";

export const Sidebar = () => {
  const items = [
    {
      label: 'Profile',
      href: '/profile/123',
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