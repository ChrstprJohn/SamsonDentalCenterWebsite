"use client"

import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { MoreHorizontalIcon, FolderIcon, ArrowRightIcon, Trash2Icon } from "lucide-react"

export function NavProjectsSecretary({
  projects,
  label = "Directories",
  isPending = false,
  onNavigate,
}: {
  projects: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
  label?: string
  isPending?: boolean
  onNavigate?: (url: string, e: React.MouseEvent) => void
}) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()

  const handleLinkClick = (url: string) => (e: React.MouseEvent) => {
    if (onNavigate) {
      onNavigate(url, e)
    }
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu className={`gap-1.5 transition-opacity duration-200 ${isPending ? "pointer-events-none opacity-60 cursor-wait" : ""}`}>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild isActive={pathname === item.url}>
              <Link href={item.url} onClick={handleLinkClick(item.url)}>
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

