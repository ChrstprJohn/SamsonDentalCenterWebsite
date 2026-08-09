"use client"

import * as React from "react"
import { NavMainSecretary } from "@/components/nav-main-secretary"
import { NavProjectsSecretary } from "@/components/nav-projects-secretary"
import { NavUserSecretary } from "@/components/nav-user-secretary"
import { TeamSwitcherSecretary } from "@/components/team-switcher-secretary"
import { useRouter, usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  Settings,
  Users,
  Clock,
  ClipboardList,
  DollarSign,
  Briefcase,
  MessageSquare,
  UserCheck,
  Paintbrush,
} from "lucide-react"

const data = {
  teams: [
    {
      name: "Samson Dental",
      logo: <Briefcase className="size-4 text-emerald-500" />,
      plan: "Secretary Portal V2",
    }
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/secretary-v2",
      icon: <LayoutDashboard className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
    },
    {
      title: "Check-In / Out",
      url: "/secretary-v2/check-in",
      icon: <UserCheck className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
    },
    {
      title: "Appointment Requests",
      url: "/secretary-v2/pending",
      icon: <ClipboardList className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
    },
    {
      title: "Calendar",
      url: "/secretary-v2/book",
      icon: <CalendarDays className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
    },
    {
      title: "Chat Inbox",
      url: "/secretary-v2/chat",
      icon: <MessageSquare className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
    },
    {
      title: "Appointments Directory",
      url: "/secretary-v2/appointments",
      icon: <CalendarRange className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
    },
    {
      title: "Email Templates",
      url: "/secretary-v2/email-designs",
      icon: <Paintbrush className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
    },
    {
      title: "Clinic Management",
      url: "#",
      icon: <Users className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
      items: [
        {
          title: "Dentists",
          url: "/secretary-v2/doctors",
        },
        {
          title: "Services",
          url: "/secretary-v2/services",
        },
      ],
    },
    {
      title: "System & Logs",
      url: "#",
      icon: <Settings className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
      items: [
        {
          title: "Notifications",
          url: "/secretary-v2/notifications",
        },
        {
          title: "Email Log List",
          url: "/secretary-v2/emails",
        },
        {
          title: "SMS Logs List",
          url: "/secretary-v2/sms-logs",
        },
        {
          title: "Audit Logs",
          url: "/secretary-v2/audits",
        },
        {
          title: "Profile Settings",
          url: "/secretary-v2/profile",
        },
      ],
    },
  ],
  projects: [],
}

interface SecretarySidebarProps extends React.ComponentProps<typeof Sidebar> {
  userProfile?: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function SecretarySidebar({ userProfile, ...props }: SecretarySidebarProps) {
  const router = useRouter()
  const { setOpen } = useSidebar()
  const [isPending, startTransition] = React.useTransition()

  const handleNavigate = React.useCallback((url: string, e?: React.MouseEvent) => {
    if (!url || url === "#") return
    if (e) {
      e.preventDefault()
    }
    startTransition(() => {
      router.push(url)
    })
  }, [router])

  const fallbackUser = {
    name: userProfile?.name || "Secretary",
    email: userProfile?.email || "secretary@samson.com",
    avatar: userProfile?.avatar || "/avatars/placeholder.jpg",
  }

  return (
    <Sidebar collapsible="icon" className="relative" {...props}>
      {isPending && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/20 overflow-hidden z-50">
          <div className="h-full bg-emerald-600 w-full" style={{
            animation: "loading-bar 1.5s infinite ease-in-out",
            transformOrigin: "left"
          }} />
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes loading-bar {
              0% { transform: scaleX(0); }
              50% { transform: scaleX(0.7); }
              100% { transform: scaleX(1); opacity: 0; }
            }
          `}} />
        </div>
      )}
      <SidebarHeader>
        <TeamSwitcherSecretary teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMainSecretary items={data.navMain} isPending={isPending} onNavigate={handleNavigate} />
        {data.projects && data.projects.length > 0 && (
          <NavProjectsSecretary projects={data.projects} label="Roster & Schedules" isPending={isPending} onNavigate={handleNavigate} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUserSecretary user={fallbackUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
