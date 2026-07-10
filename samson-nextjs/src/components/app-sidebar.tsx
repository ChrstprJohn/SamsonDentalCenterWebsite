"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { TerminalIcon, LayoutDashboard, CalendarDays, Bell, Settings } from "lucide-react"
import type { AppointmentDto } from "@/modules/appointments/dtos/shared/appointment.dto"
import type { AuthHeaderUser } from "@/modules/patients/hooks/auth/header/use-auth-header"

const data = {
  navMain: [
    {
      title: "Dashboard",
      tab: "dashboard",
      icon: <LayoutDashboard />,
    },
    {
      title: "Appointments",
      tab: "appointments",
      icon: <CalendarDays />,
    },
    {
      title: "Notifications",
      tab: "notifications",
      icon: <Bell />,
    },
    {
      title: "Settings",
      tab: "settings",
      icon: <Settings />,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  appointments?: AppointmentDto[];
  userProfile?: AuthHeaderUser;
}

export function AppSidebar({ appointments = [], userProfile, ...props }: AppSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentApptId = searchParams.get("apptId")
  const currentTab = searchParams.get("tab") || "dashboard"
  
  const activeItem = data.navMain.find((item) => item.tab === currentTab) || data.navMain[0]
  const { setOpen } = useSidebar()

  // Filter and Tab states for appointments
  const [apptStatusTab, setApptStatusTab] = React.useState<"upcoming" | "pending" | "history">("upcoming")
  const [patientFilter, setPatientFilter] = React.useState<string>("ALL")

  const fallbackUser = {
    name: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "Patient",
    email: userProfile?.email || "",
    avatar: userProfile?.avatarUrl || "/avatars/placeholder.jpg",
  }

  // Derive patient/dependent filter options
  const patientObj = appointments.find((a) => a.patient)?.patient
  const mainUserName = patientObj ? patientObj.firstName : "Christopher"
  const filterOptions = [
    { id: "ALL", label: "All" },
    { id: "SELF", label: mainUserName },
  ]
  const dependentMap = new Map<string, string>()
  appointments.forEach((appt) => {
    if (appt.dependent) {
      dependentMap.set(appt.dependent.id, appt.dependent.firstName)
    }
  })
  dependentMap.forEach((name, depId) => {
    filterOptions.push({ id: depId, label: name })
  })

  // Filter appointments
  const filteredByPatient = appointments.filter((a) => {
    if (patientFilter === "ALL") return true
    if (patientFilter === "SELF") return !a.dependent
    return a.dependent?.id === patientFilter
  })

  const upcomingAppts = filteredByPatient.filter(
    (a) => a.status === "APPROVED" || a.status === "RESCHEDULE_REQUESTED" || a.status === "CHECKED_IN"
  )
  const pendingAppts = filteredByPatient.filter((a) => a.status === "PENDING")
  const historyAppts = filteredByPatient.filter(
    (a) =>
      a.status === "COMPLETED" ||
      a.status === "CANCELLED" ||
      a.status === "REJECTED" ||
      a.status === "DISPLACED" ||
      a.status === "NO_SHOW" ||
      a.status === "TREATMENT_RENDERED"
  )

  const activeAppointmentsList =
    apptStatusTab === "upcoming" ? upcomingAppts :
    apptStatusTab === "pending" ? pendingAppts :
    historyAppts

  const hasSecondarySidebar = activeItem.tab === "appointments" || activeItem.tab === "notifications"

  // Automatically sync sidebar open state based on active tab
  React.useEffect(() => {
    setOpen(hasSecondarySidebar)
  }, [activeItem.tab, hasSecondarySidebar, setOpen])

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r h-svh"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <TerminalIcon className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Samson Dental</span>
                    <span className="truncate text-xs">Patient Portal</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        router.push(`/user-v2?tab=${item.tab}`)
                      }}
                      isActive={activeItem?.tab === item.tab}
                      className="px-2.5 md:px-2"
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={fallbackUser} />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {hasSecondarySidebar && (
        <Sidebar collapsible="none" className="hidden flex-1 md:flex h-svh">
          <SidebarHeader className="gap-3.5 border-b p-4">
            <div className="flex w-full items-center justify-between gap-2">
              <div className="text-base font-semibold text-foreground">
                {activeItem.title}
              </div>
              {activeItem.tab === "appointments" && (
                <select
                  value={patientFilter}
                  onChange={(e) => setPatientFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-2 py-1 text-xs font-medium ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring w-[90px] truncate"
                >
                  {filterOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {activeItem.tab === "appointments" && (
              <div className="flex flex-col gap-2 w-full mt-1">
                {/* Upcoming / Pending / History Tabs */}
                <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setApptStatusTab("upcoming")}
                    className={`py-1 rounded-md text-center transition-all ${
                      apptStatusTab === "upcoming"
                        ? "bg-background shadow-xs text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Upcoming ({upcomingAppts.length})
                  </button>
                  <button
                    onClick={() => setApptStatusTab("pending")}
                    className={`py-1 rounded-md text-center transition-all ${
                      apptStatusTab === "pending"
                        ? "bg-background shadow-xs text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Pending ({pendingAppts.length})
                  </button>
                  <button
                    onClick={() => setApptStatusTab("history")}
                    className={`py-1 rounded-md text-center transition-all ${
                      apptStatusTab === "history"
                        ? "bg-background shadow-xs text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    History ({historyAppts.length})
                  </button>
                </div>
              </div>
            )}
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup className="px-0">
              <SidebarGroupContent>
                {activeItem.tab === "appointments" && (
                  <>
                    {activeAppointmentsList.map((appt) => {
                      const dateStr = new Date(appt.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                      const isSelected = currentApptId === appt.id;
                      return (
                        <button
                          key={appt.id}
                          onClick={() => {
                            const params = new URLSearchParams(window.location.search);
                            params.set('tab', 'appointments');
                            params.set('apptId', appt.id);
                            router.push(`/user-v2?${params.toString()}`);
                          }}
                          className={`flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight text-left w-full last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                            isSelected ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                          }`}
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            {/* Date on the Left */}
                            <span className="text-xs font-semibold text-muted-foreground">{dateStr}</span>
                            
                            {/* Status Badge on the Right */}
                            <span className={`font-semibold text-[9px] px-2 py-0.5 rounded-full border ${
                              appt.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900' :
                              appt.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900' :
                              'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700'
                            }`}>
                              {appt.status}
                            </span>
                          </div>
                          <span className="font-semibold text-foreground truncate w-full">{appt.service?.name || 'Dental Consultation'}</span>
                          <span className="line-clamp-2 w-full text-xs text-muted-foreground">
                            {appt.startTime} - {appt.endTime} • Dr. {appt.doctor?.firstName || 'Staff'} {appt.doctor?.lastName || ''}
                          </span>
                        </button>
                      )
                    })}
                    {activeAppointmentsList.length === 0 && (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No appointments found.
                      </div>
                    )}
                  </>
                )}

                {activeItem.tab === "notifications" && (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No new notifications.
                  </div>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      )}
    </Sidebar>
  )
}
