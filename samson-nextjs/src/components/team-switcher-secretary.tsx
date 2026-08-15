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
        <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
          <div className="flex h-20 min-w-8 shrink-0 items-center justify-center text-sidebar-foreground group-data-[collapsible=icon]:size-8">
            <span className="hidden size-8 items-center justify-center rounded-full border border-current font-serif text-lg italic font-normal leading-none group-data-[collapsible=icon]:flex">S</span>
            {logoUrl ? (
              <img src={logoUrl} alt="Samson Dental Center" className="block h-20 w-auto max-w-[280px] object-contain group-data-[collapsible=icon]:hidden" />
            ) : (
              <span role="img" aria-label="Samson Dental Center" className="relative block h-20 w-[140px] overflow-hidden group-data-[collapsible=icon]:hidden">
                <img src="/images/SAMSONLOGO.png" alt="" className="absolute right-0 top-0 h-20 w-auto max-w-none object-contain" />
              </span>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
