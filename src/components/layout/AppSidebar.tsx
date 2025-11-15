"use client";

import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  User,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Calendar,
  History,
  Receipt,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  CreditCard,
} from "lucide-react";

import { jwtDecode } from "jwt-decode";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// -------------------------
// Menu Data
// -------------------------
const mainMenu = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Profile", href: "/profile", icon: User },
  { title: "Services", href: "/services", icon: Calendar },
];

const historyMenu = [
  { title: "Account History", href: "/transactions", icon: History },
  { title: "Service Report", href: "/service-report", icon: Receipt },
];

const fundMenu = [
  { title: "Add Fund", href: "/fund/add" },
  { title: "Fund Requests", href: "/fund/requests" },
];

const bottomMenu = [
  { title: "Commission", href: "/commission", icon: Receipt },
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Contact Us", href: "/contact-us", icon: HelpCircle },
  { title: "Settings", href: "/settings", icon: Settings },
];

// -------------------------
// Component
// -------------------------
export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("retailer");
  const [fundOpen, setFundOpen] = useState(false);

  // Larger icons when collapsed, normal when expanded
  const collapsedIconClass = isCollapsed ? "h-7 w-7 mx-auto" : "h-5 w-5";

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role === "admin" ? "admin" : "retailer");

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      if (decoded?.data?.user_name) setUserName(decoded.data.user_name);
    } catch {}
  }, []);

  const initials = userName?.length > 0 ? userName.charAt(0).toUpperCase() : "U";
  const isFundActive = location.pathname.startsWith("/fund");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="flex flex-col h-screen">

        {/* --------------------------------- */}
        {/* LOGO SECTION */}
        {/* --------------------------------- */}
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <img src="/paybazaar-logo.png" alt="PayBazaar" className="h-8 w-auto" />
              <span className="text-lg font-bold text-sidebar-foreground">PayBazaar</span>
            </div>
          ) : (
            <img src="/paybazaar-logo.png" alt="PayBazaar" className="h-10 w-auto mx-auto" />
          )}
        </div>

        {/* --------------------------------- */}
        {/* MENU SCROLL AREA */}
        {/* --------------------------------- */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

          {/* ------------------ MAIN MENU ------------------ */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainMenu.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `flex items-center py-2 rounded-lg transition-all ${
                            isCollapsed ? "justify-center px-0" : "gap-3 px-3"
                          } ${
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                              : "text-sidebar-foreground hover:bg-sidebar-accent"
                          }`
                        }
                      >
                        <item.icon className={`${collapsedIconClass} shrink-0`} />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ---------------------- KYC ---------------------- */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <button
                    className={`flex w-full items-center py-2 rounded-lg transition-all text-sidebar-foreground hover:bg-sidebar-accent ${
                      isCollapsed ? "justify-center px-0" : "gap-3 px-3"
                    }`}
                  >
                    <UserCheck className={`${collapsedIconClass} shrink-0`} />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>KYC</span>
                        <span className="text-xs text-muted-foreground">Coming Soon</span>
                      </div>
                    )}
                  </button>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ------------------ HISTORY MENU ------------------ */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {historyMenu.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `flex items-center py-2 rounded-lg transition-all ${
                            isCollapsed ? "justify-center px-0" : "gap-3 px-3"
                          } ${
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                              : "text-sidebar-foreground hover:bg-sidebar-accent"
                          }`
                        }
                      >
                        <item.icon className={`${collapsedIconClass} shrink-0`} />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ------------------ FUND COLLAPSIBLE ------------------ */}
          <SidebarGroup>
            <SidebarGroupContent>
              {isCollapsed ? (
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/fund/add"
                        className={({ isActive }) =>
                          `flex items-center py-2 rounded-lg transition-all justify-center px-0 ${
                            isActive || isFundActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                              : "text-sidebar-foreground hover:bg-sidebar-accent"
                          }`
                        }
                      >
                        <CreditCard className={`${collapsedIconClass} shrink-0`} />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              ) : (
                <Collapsible open={fundOpen} onOpenChange={setFundOpen}>
                  <CollapsibleTrigger
                    className={`flex w-full items-center justify-between px-3 py-2 rounded-lg transition-all ${
                      isFundActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={collapsedIconClass} />
                      <span>Fund</span>
                    </div>
                    {fundOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-1 space-y-1">
                    {fundMenu.map((item) => (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 pl-11 rounded-lg text-sm transition-all ${
                            isActive
                              ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                          }`
                        }
                      >
                        {item.title}
                      </NavLink>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ------------------ BOTTOM MENU ------------------ */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomMenu.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `flex items-center py-2 rounded-lg transition-all ${
                            isCollapsed ? "justify-center px-0" : "gap-3 px-3"
                          } ${
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                              : "text-sidebar-foreground hover:bg-sidebar-accent"
                          }`
                        }
                      >
                        <item.icon className={`${collapsedIconClass} shrink-0`} />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* ------------------ LOGOUT ------------------ */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <button
                    onClick={() => {
                      localStorage.removeItem("authToken");
                      window.location.href = "/";
                    }}
                    className={`flex w-full items-center py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-all ${
                      isCollapsed ? "justify-center px-0" : "gap-3 px-3"
                    }`}
                  >
                    <LogOut className={collapsedIconClass} />
                    {!isCollapsed && <span>Logout</span>}
                  </button>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* ------------------ USER PROFILE ------------------ */}
        {!isCollapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold text-lg">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {userName}
                </p>
                <p className="text-xs text-sidebar-foreground/70 capitalize">
                  {userRole}
                </p>
              </div>
            </div>
          </div>
        )}

      </SidebarContent>
    </Sidebar>
  );
}
