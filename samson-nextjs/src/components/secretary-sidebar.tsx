"use client"

import * as React from "react"
import { NavMainSecretary } from "@/components/nav-main-secretary"
import { NavProjectsSecretary } from "@/components/nav-projects-secretary"
import { NavUserSecretary } from "@/components/nav-user-secretary"
import { TeamSwitcherSecretary } from "@/components/team-switcher-secretary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  CalendarDays,
  LayoutDashboard,
  Settings,
  Users,
  Clock,
  ClipboardList,
  DollarSign,
  Briefcase
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
      title: "Website Requests",
      url: "#",
      icon: <ClipboardList className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
      isActive: true,
      items: [
        {
          title: "Bookings",
          url: "/secretary-v2/pending",
        },
        {
          title: "Reschedules",
          url: "/secretary-v2/reschedule-requests",
        },
        {
          title: "Cancellations",
          url: "/secretary-v2/cancellations",
        },
      ],
    },
    {
      title: "Appointments",
      url: "#",
      icon: <CalendarDays className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
      items: [
        {
          title: "Book Appointment",
          url: "/secretary-v2/book",
        },
        {
          title: "Appointments Directory",
          url: "/secretary-v2/appointments",
        },
        {
          title: "Check-In / Out",
          url: "/secretary-v2/check-in",
        },
      ],
    },
    {
      title: "Clinic & Billing",
      url: "#",
      icon: <DollarSign className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
      items: [
        {
          title: "Invoices",
          url: "/secretary-v2/invoices",
        },
        {
          title: "Services Catalog",
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
          title: "Email Logs",
          url: "/secretary-v2/emails",
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
  projects: [
    {
      name: "Doctors Directory",
      url: "/secretary-v2/doctors",
      icon: <Users className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
    },
    {
      name: "Doctor Schedules",
      url: "/secretary-v2/schedules",
      icon: <Clock className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />,
    },
  ],
}

interface SecretarySidebarProps extends React.ComponentProps<typeof Sidebar> {
  userProfile?: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function SecretarySidebar({ userProfile, ...props }: SecretarySidebarProps) {
  const fallbackUser = {
    name: userProfile?.name || "Secretary",
    email: userProfile?.email || "secretary@samson.com",
    avatar: userProfile?.avatar || "/avatars/placeholder.jpg",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcherSecretary teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMainSecretary items={data.navMain} />
        <NavProjectsSecretary projects={data.projects} label="Roster & Schedules" />
      </SidebarContent>
      <SidebarFooter>
        <NavUserSecretary user={fallbackUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

