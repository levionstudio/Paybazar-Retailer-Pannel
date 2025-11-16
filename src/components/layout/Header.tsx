import { Moon, Sun, Bell, User, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import axios from "axios";

interface HeaderProps {
  walletBalance?: number;
}

interface JWTPayload {
  data: { user_id: string; [key: string]: any };
}

export function Header({ walletBalance }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [walletBalances, setWalletBalance] = useState(0);

  const getAdminId = (): string | null => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token not found");
        return null;
      }
      const decoded = jwtDecode<JWTPayload>(token);
      return decoded.data.user_id;
    } catch (error) {
      toast.error("Authentication token not found");

      return null;
    }
  };
  const admin_id = getAdminId();

  useEffect(() => {
    const fetchWalletBalance = async () => {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/user/wallet/get/balance/${admin_id}`
      );
      setWalletBalance(response.data.data.balance);
    };
    fetchWalletBalance();
  }, []);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 h-16">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="p-2 " />
          <h1 className="text-xl font-semibold text-foreground">
            PayBazaar Portal
          </h1>
        </div>

        <div className="flex items-center gap-4 ">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* ✅ Wallet Balance */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-wallet-bg border border-wallet-border">
            <Wallet className="w-4 h-4 text-wallet-text" />
            <span className="text-sm font-semibold text-wallet-text">
              ₹{walletBalances.toLocaleString()}
            </span>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  localStorage.removeItem("authToken");
                  window.location.href = "/login";
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
