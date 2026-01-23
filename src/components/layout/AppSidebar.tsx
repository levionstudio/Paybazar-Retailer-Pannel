"use client";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// -------------------
// MENU DATA
// -------------------
const mainMenu = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Profile", href: "/profile", icon: User },
  { title: "Services", href: "/services", icon: Calendar },
];

const historyMenu = [
  { title: "Account History", href: "/transactions", icon: History },
  { title: "Service Report", href: "/ledger", icon: Receipt },
];

const bottomMenu = [
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Commission", href: "/commission", icon: Receipt },
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Contact Us", href: "/contact-us", icon: HelpCircle },
  { title: "Settings", href: "/settings", icon: Settings },
];

// -------------------
// COMPONENT
// -------------------
export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const pathname = location.pathname;

  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("retailer");
  const [fundOpen, setFundOpen] = useState(false);

  const iconClass = "h-5 w-5";

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

  // Automatically open Fund collapse when inside /fund*
  useEffect(() => {
    if (pathname.startsWith("/fund")) setFundOpen(true);
  }, [pathname]);

  const initials = userName?.[0]?.toUpperCase() || "U";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarContent className="flex flex-col h-screen">
        {/* LOGO */}
        <div
          className={`flex h-16 items-center justify-center border-b border-sidebar-border ${
            isCollapsed ? "px-2" : "px-4"
          }`}
        >
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <img
                src="/paybazaar-logo.png"
                alt="PayBazaar"
                className="h-8 w-auto"
              />
              <span className="text-lg font-bold text-sidebar-foreground">
                PayBazaar
              </span>
            </div>
          ) : (
            <img
              src="/paybazaar-logo.png"
              alt="PayBazaar"
              className="h-8 w-8 mx-auto object-contain"
            />
          )}
        </div>

        {/* SCROLL AREA */}
        <div
          className={`flex-1 overflow-y-auto ${
            isCollapsed ? "py-4" : "px-3 py-4"
          } space-y-1`}
        >
          {/* MAIN MENU */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainMenu.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <a
                          href={item.href}
                          className={`flex items-center rounded-lg transition-all  ${
                            isCollapsed
                              ? "justify-center px-2 py-2"
                              : "gap-3 px-3 py-2"
                          } ${
                            active
                              ? " text-sidebar-primary-foreground border border-white"
                              : "text-sidebar-foreground hover:bg-sidebar-accent border-transparent"
                          }`}
                        >
                          <item.icon className={iconClass} />
                          {!isCollapsed && <span>{item.title}</span>}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* KYC */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <button
                    className={`flex w-full items-center rounded-lg transition-all text-sidebar-foreground hover:bg-sidebar-accent ${
                      isCollapsed
                        ? "justify-center px-2 py-2"
                        : "gap-3 px-3 py-2"
                    }`}
                  >
                    <UserCheck className={iconClass} />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>KYC</span>
                        <span className="text-xs text-muted-foreground">
                          Coming Soon
                        </span>
                      </div>
                    )}
                  </button>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* HISTORY */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {historyMenu.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <a
                          href={item.href}
                          className={`flex items-center rounded-lg transition-all  ${
                            isCollapsed
                              ? "justify-center px-2 py-2"
                              : "gap-3 px-3 py-2"
                          } ${
                            active
                              ? " text-sidebar-primary-foreground border border-white"
                              : "text-sidebar-foreground hover:bg-sidebar-accent border-transparent"
                          }`}
                        >
                          <item.icon className={iconClass} />
                          {!isCollapsed && <span>{item.title}</span>}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* FUND COLLAPSIBLE */}
          <SidebarGroup>
            <SidebarGroupContent>
              {isCollapsed ? (
                // COLLAPSED MODE (just icon)
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a
                        href="/funds-request"
                        className={`flex items-center rounded-lg px-2 py-2 justify-center border-l-4 transition-all ${
                          pathname.startsWith("/fund")
                            ? " text-sidebar-primary-foreground border border-white"
                            : "text-sidebar-foreground hover:bg-sidebar-accent border-transparent"
                        }`}
                      >
                        <CreditCard className={iconClass} />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              ) : (
                // EXPANDED MODE
                <Collapsible open={fundOpen} onOpenChange={setFundOpen}>
                  <CollapsibleTrigger
                    className={`flex w-full items-center justify-between px-3 py-2 rounded-lg  transition-all ${
                      pathname.startsWith("/fund")
                        ? " text-sidebar-primary-foreground  border-white"
                        : "text-sidebar-foreground hover:bg-sidebar-accent border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={iconClass} />
                      <span>Fund</span>
                    </div>
                    {fundOpen ? <ChevronDown /> : <ChevronRight />}
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-1 space-y-1">
                    {/* Add Fund */}
                    <a
                      href="/funds-request"
                      className={`flex items-center px-3 py-2 pl-11 rounded-lg text-sm  transition-all ${
                        pathname === "/funds-request"
                          ? " text-sidebar-foreground border border-white"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 border-transparent"
                      }`}
                    >
                      Add Fund
                    </a>

                    {/* Fund Requests */}
                    <a
                      href="/funds"
                      className={`flex items-center px-3 py-2 pl-11 rounded-lg text-sm  transition-all ${
                        pathname === "/funds"
                          ? " text-sidebar-foreground border border-white"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 border-transparent"
                      }`}
                    >
                      Fund Requests
                    </a>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* BOTTOM MENU */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomMenu.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <a
                          href={item.href}
                          className={`flex items-center rounded-lg transition-all  ${
                            isCollapsed
                              ? "justify-center px-2 py-2"
                              : "gap-3 px-3 py-2"
                          } ${
                            active
                              ? " text-sidebar-primary-foreground border border-white"
                              : "text-sidebar-foreground hover:bg-sidebar-accent border-transparent"
                          }`}
                        >
                          <item.icon className={iconClass} />
                          {!isCollapsed && <span>{item.title}</span>}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* LOGOUT */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <button
                    onClick={() => {
                      localStorage.removeItem("authToken");
                      window.location.href = "/";
                    }}
                    className={`flex w-full items-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent  transition-all ${
                      isCollapsed
                        ? "justify-center px-2 py-2"
                        : "gap-3 px-3 py-2"
                    }`}
                  >
                    <LogOut className={iconClass} />
                    {!isCollapsed && <span>Logout</span>}
                  </button>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* USER PROFILE */}
        {!isCollapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full  text-sidebar-primary-foreground flex items-center justify-center font-bold text-lg">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-sidebar-foreground">
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
