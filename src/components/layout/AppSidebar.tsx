"use client";

import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Smartphone,
  Receipt,
  Shield,
  History,
  Wallet,
  Settings,
  Users,
  BarChart3,
  Activity,
  PersonStanding,
  Key,
  User,
  Icon,
  UserCheckIcon,
  Home,
  CalendarMinus,
  Calendar1,
  GitGraph,
} from "lucide-react";

import { jwtDecode } from "jwt-decode";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { title } from "process";

// ✅ Retailer navigation items
const retailerNavItems = [
  { title: "Dashbaord", href: "/dashboard", icon: Home },
  {title:"Profile", href: "/profile", icon: User},
  {title:"KYC",href:"/kyc",icon:UserCheckIcon},
  {title:"Services", href: "/services", icon: Calendar1},
  {title:"commission", href: "/commission", icon: GitGraph},
  {title:"contact Us", href: "/contact-us", icon: Users},
  { title: "Funds Request", href: "/funds-request", icon: CreditCard },
  { title: "Transaction History", href: "/transactions", icon: History },
  {title: " Requested Funds", href: "/funds", icon: CreditCard},
  { title: "Payout Request", href: "/payout", icon: Receipt },

];

// ✅ Admin navigation items
const adminNavItems = [
  { title: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Retailer Management", href: "/admin/retailers", icon: Users },
  { title: "Transaction Monitor", href: "/admin/transactions", icon: BarChart3 },
  { title: "Service Management", href: "/admin/services", icon: Settings },
  { title: "Reports", href: "/admin/reports", icon: Receipt },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [userRole, setUserRole] = useState<"retailer" | "admin">("retailer");
  const [userName, setUserName] = useState<string>("User");

  useEffect(() => {
    // ✅ Load stored role
    const storedRole = localStorage.getItem("userRole");
    setUserRole(storedRole === "admin" ? "admin" : "retailer");

    // ✅ Decode token for user_name
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);

      if (decoded?.data?.user_name) {
        setUserName(decoded.data.user_name);
      }
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  }, []);

  // ✅ Navigation selection based on role
  const navItems = userRole === "admin" ? adminNavItems : retailerNavItems;

  // ✅ Styling for active/inactive sidebar menu items
  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    `
    flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-all
    ${
      isActive
        ? "bg-accent text-accent-foreground shadow-sm"
        : "hover:bg-accent hover:text-accent-foreground"
    }
  `;

  // ✅ User initials in circle
  const initials =
    userName && userName.length > 0 ? userName.charAt(0).toUpperCase() : "U";

  return (
    <Sidebar className="border-r border-sidebar-border" collapsible="icon">
      <SidebarContent>

        {/* ✅ Logo Section */}
        <SidebarGroup>
          <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <img
                src="/paybazaar-logo.png"
                alt="PayBazaar"
                className="h-8 w-8 shrink-0"
              />
              {!isCollapsed && (
                <span className="text-lg font-semibold text-sidebar-foreground">
                  PayBazaar
                </span>
              )}
            </div>
          </div>
        </SidebarGroup>

        {/* ✅ Navigation items */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {userRole === "admin" ? "Admin Panel" : "Services"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <NavLink to={item.href} className={getNavClassName} end>
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ✅ User Info Section */}
        {!isCollapsed && (
          <SidebarGroup className="mt-auto">
            <div className="border-t border-sidebar-border p-4">
              <div className="flex items-center gap-3">

                {/* ✅ Initials avatar */}
                <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-sidebar-primary-foreground">
                    {initials}
                  </span>
                </div>

                {/* ✅ Name & Role */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">
                    {userRole === "admin" ? "Administrator" : "Retailer"}
                  </p>
                </div>

              </div>
            </div>
          </SidebarGroup>
        )}

      </SidebarContent>
    </Sidebar>
  );
}
