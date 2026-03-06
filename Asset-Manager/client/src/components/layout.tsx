import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Car, User, LogOut, LayoutDashboard, Map as MapIcon, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "driver") return "/dashboard/driver";
    return "/dashboard/user";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground group-hover:scale-105 transition-transform duration-300 shadow-md shadow-primary/20">
              <Car className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Go to hell<span className="text-primary">.</span></span>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  href={getDashboardPath()}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium hover:bg-muted transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                  Dashboard
                </Link>
                <div className="h-6 w-px bg-border mx-2 hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-semibold leading-none">{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold shadow-inner">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground ml-1"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-full hover:bg-muted transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  href="/register"
                  className="text-sm font-semibold px-5 py-2 rounded-full bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
