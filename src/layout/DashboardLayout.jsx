import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  User,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation, Outlet } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Automatically collapse sidebar on medium screens, and handle mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: "investment",
      label: "Investments",
      icon: TrendingUp,
      path: "/dashboard/investment",
    },
    { id: "users", label: "Users", icon: User, path: "/dashboard/users" },
    { id: "profile", label: "Profile", icon: User, path: "/dashboard/profile" },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      {/* 1. FIXED HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200/80 z-40 flex items-center justify-between px-6 shadow-sm shadow-slate-100">
        <div className="flex items-center gap-4">
          {/* Mobile Hamburguer Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Business Logo */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
              G
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Grey <span className="text-emerald-600">Investment</span>
            </span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl relative transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>

          <div className="h-8 w-px bg-slate-200" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center font-bold text-slate-600 text-sm">
              JD
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-slate-700">
              John Doe
            </span>
          </div>
        </div>
      </header>

      {/* 2. FIXED SIDEBAR (DESKTOP) */}
      <motion.aside
        animate={{ width: isCollapsed ? "5rem" : "16rem" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col fixed top-16 bottom-0 left-0 bg-white border-r border-slate-200/80 z-30 overflow-x-hidden justify-between py-6"
      >
        {/* Navigation items */}
        <div className="px-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path; // Checks URL to style active link

            return (
              <Link
                key={item.id}
                to={item.path} // Moves to the next page via URL routing
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm group transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="shrink-0">
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? "text-emerald-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }
                  />
                </div>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Logout Button */}
        <div className="px-4">
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm text-rose-600 hover:bg-rose-50/50 transition-colors group">
            <div className="shrink-0">
              <LogOut
                size={20}
                className="text-rose-400 group-hover:text-rose-600"
              />
            </div>
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* 3. MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-white z-50 p-6 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-8">
                {/* Mobile Header Brand */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-lg">
                      G
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">
                      Grey
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100"
                  >
                    <X size={20} className="text-slate-500" />
                  </button>
                </div>

                {/* Mobile Menu Items */}
                <div className="space-y-1.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setIsMobileOpen(false)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm ${
                          item.id === "dash"
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 4. DYNAMIC SCROLLABLE CONTENT CANVAS */}
      <motion.main
        animate={{
          paddingLeft:
            typeof window !== "undefined" && window.innerWidth < 1024
              ? "1.5rem"
              : isCollapsed
                ? "6.5rem"
                : "17.5rem",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="pt-21 pr-6 pb-12 min-h-screen transition-[padding] duration-300"
      >
        <Outlet />
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
