"use client"

import Link from "next/link"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"

export function NavMainSecretary({
  items,
  label = "Operations",
  isPending = false,
  notificationCount = 0,
  appointmentRequestCount = 0,
  chatUnreadCount = 0,
  onNavigate,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  label?: string
  isPending?: boolean
  notificationCount?: number
  appointmentRequestCount?: number
  chatUnreadCount?: number
  onNavigate?: (url: string, e: React.MouseEvent) => void
}) {
  const pathname = usePathname()

  const handleLinkClick = (url: string) => (e: React.MouseEvent) => {
    if (onNavigate) {
      onNavigate(url, e)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu className={`gap-1.5 transition-opacity duration-200 ${isPending ? "pointer-events-none opacity-60 cursor-wait" : ""}`}>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0
          // If any of the sub-items are active, auto-open this group
          const hasActiveSubItem = item.items?.some((subItem) => pathname === subItem.url)
          const isGroupOpen = item.isActive || hasActiveSubItem

          if (!hasSubItems) {
            const itemCount = item.title === "Notifications" ? notificationCount : 0
            const hasCount = itemCount > 0
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                  <Link href={item.url} onClick={handleLinkClick(item.url)}>
                    <span className="relative shrink-0">
                      {item.icon}
                      {hasCount && <span className="absolute -right-2 -top-2 hidden min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold leading-4 text-white group-data-[collapsible=icon]:flex">{itemCount > 9 ? '9+' : itemCount}</span>}
                    </span>
                    <span>{item.title}</span>
                    {hasCount && <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold leading-4 text-white group-data-[collapsible=icon]:hidden">{itemCount > 9 ? '9+' : itemCount}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isGroupOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={pathname === item.url || hasActiveSubItem}>
                    {item.icon}
                    <span>{item.title}</span>
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubActive = pathname === subItem.url
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isSubActive}>
                            <Link href={subItem.url} onClick={handleLinkClick(subItem.url)}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

