import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  LogOut,
  Menu,
  X,
  Users,
  Calendar,
  Package,
  Tag,
  BookOpen,
  Briefcase,
  Mail,
  MapPin,
  CreditCard,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import ConfirmationModal from "./ConfirmationModal";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const confirmLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logout successful!");
    navigate("/login");
  };

  // Navigation items based on provided sitemap
  const navigationItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Customers", path: "/users", icon: Users },
    { name: "All Bookings", path: "/bookings", icon: Calendar },
    { name: "Customer Packages", path: "/userpackage", icon: Package },
    { name: "Service Categories", path: "/category", icon: Tag },
    { name: "Classes", path: "/class", icon: BookOpen },
    { name: "Packages", path: "/package", icon: Package },
    { name: "Staff Members", path: "/staff", icon: Briefcase },
    { name: "Enquiries", path: "/enquiry", icon: Mail },
    {
      name: "Bachelorette Bookings",
      path: "/bachelorette",
      icon: Calendar,
    },
    { name: "Promotional Banners", path: "/banner", icon: AlertCircle },
    { name: "Service Locations", path: "/locations", icon: MapPin },
    { name: "Payment Management", path: "/payments", icon: CreditCard },
    { name: "App Version", path: "/appversionsList", icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1D25]">
      {/* TOP NAVBAR */}
      <nav className="bg-white border-b border-[#D8DDE6] sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:bg-[#F5F7FA] text-[#1A1D25]"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <div className="flex items-center gap-3">
                <div className="rounded-lg flex items-center justify-center">
                  <img
                    src="/airbound.png"
                    width={40}
                    height={40}
                    alt="app logo"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-[#1A1D25]">Airbound</h1>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 text-sm px-4 py-2.5 border border-[#D8DDE6] rounded-lg transition-all duration-200 shadow-sm text-[#1A1D25] hover:bg-[#F5F7FA] hover:border-[#5472D3]"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* SIDEBAR - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 border-r border-[#D8DDE6] shadow-sm bg-white overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-[#0D47A1] to-[#5472D3] text-white shadow-md"
                      : "text-[#1A1D25] hover:bg-[#F5F7FA]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      className={
                        isActive
                          ? "text-white"
                          : "text-[#5472D3] group-hover:text-[#0D47A1]"
                      }
                    />
                    <span
                      className={`font-medium text-sm ${isActive ? "text-white" : "group-hover:text-[#0D47A1]"}`}
                    >
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </aside>

      {/* SIDEBAR - Mobile */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 border-r border-[#D8DDE6] shadow-xl z-50 bg-white overflow-y-auto scrollbar-hide">
            <div className="p-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-[#0D47A1] to-[#5472D3] text-white shadow-md"
                          : "text-[#1A1D25] hover:bg-[#F5F7FA]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={20}
                          className={
                            isActive
                              ? "text-white"
                              : "text-[#5472D3] group-hover:text-[#0D47A1]"
                          }
                        />
                        <span
                          className={`font-medium text-sm ${isActive ? "text-white" : "group-hover:text-[#0D47A1]"}`}
                        >
                          {item.name}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </aside>
        </>
      )}

      {/* MAIN CONTENT */}
      <main className="lg:ml-72 min-h-[calc(100vh-4rem)] p-6 bg-[#F5F7FA]">
        <div className="max-w-full mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Add custom scrollbar hide CSS */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Logout Confirmation"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
