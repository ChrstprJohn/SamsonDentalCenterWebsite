"use client"

import * as React from "react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcherSecretary({
  teams,
  logoUrl,
}: {
  teams: {
    name: string
    logo: React.ReactNode
    plan: string
  }[]
  logoUrl?: string | null
}) {
  if (!teams[0]) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="h-16 p-0 cursor-default hover:bg-transparent">
          <div className="flex h-16 w-full min-w-0 items-center justify-start text-sidebar-foreground group-data-[collapsible=icon]:size-8">
            <span className="hidden size-8 items-center justify-center rounded-full border border-current font-serif text-lg italic font-normal leading-none group-data-[collapsible=icon]:flex">S</span>
            <img src={logoUrl || '/images/NewLogo (2).png'} alt="Samson Dental Center" className="block h-16 w-auto max-w-full object-contain group-data-[collapsible=icon]:hidden" />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
