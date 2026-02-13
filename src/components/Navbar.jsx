import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    toast.info("Logged out successfully");
    navigate("/login");
  };

  const navLinks = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/trucks", label: "Trucks", icon: "🚛" },
    { path: "/drivers", label: "Drivers", icon: "👤" },
    { path: "/trips", label: "Trips", icon: "🗺️" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userEmail =
    user.email || localStorage.getItem("userEmail") || "admin@transport.com";

  const rawName = user.name || userEmail.split("@")[0];
  const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        
        .navbar-glass {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .nav-link {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transform: translateX(-50%);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 3px 3px 0 0;
        }

        .nav-link.active::before {
          width: 100%;
        }

        .nav-link:hover::before {
          width: 100%;
        }

        .nav-link.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
        }

        .mobile-menu {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logo-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mobile-nav-link {
          transition: all 0.2s ease;
        }

        .mobile-nav-link:active {
          transform: scale(0.98);
        }

        .hamburger-line {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .logout-btn:hover {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
      `}</style>

      <nav className="navbar-glass border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-2xl">🚚</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1
                    className="text-2xl font-bold logo-gradient"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Transport MS
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">
                    Management System
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`nav-link px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                      isActive(link.path)
                        ? "active text-indigo-700"
                        : "text-gray-700 hover:text-indigo-600"
                    }`}
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side - User Section (Desktop) */}
            <div className="hidden md:flex items-center gap-4">
              <button className="relative p-2.5 text-gray-600 hover:text-indigo-600 transition-colors rounded-xl hover:bg-gray-100">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="h-8 w-px bg-gray-300"></div>

              {/* Desktop Dropdown Wrapper */}
              <div className="relative">
                <div
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-all cursor-pointer group active:scale-95"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:rotate-3 transition-transform">
                    {userInitial}
                  </div>
                  <div className="hidden lg:block">
                    <p
                      className="text-sm font-semibold text-gray-900"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                      {userEmail}
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isUserMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Desktop Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Account
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userEmail}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium"
                      onClick={() => setIsUserMenuOpen(false)}
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      <span className="text-base">👤</span> Profile Settings
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-medium"
                      onClick={() => setIsUserMenuOpen(false)}
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      <span className="text-base">⚙️</span> Settings
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold logout-btn"
                      onClick={handleLogout}
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      <span className="text-base">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors relative"
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <span
                    className={`hamburger-line h-0.5 w-full bg-current rounded-full ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
                  ></span>
                  <span
                    className={`hamburger-line h-0.5 w-full bg-current rounded-full ${isMobileMenuOpen ? "opacity-0" : ""}`}
                  ></span>
                  <span
                    className={`hamburger-line h-0.5 w-full bg-current rounded-full ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
                  ></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mobile-menu border-t border-gray-200/50">
            <div className="px-4 pt-4 pb-6 space-y-2 bg-white/95 backdrop-blur-lg">
              {navLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`mobile-nav-link flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${
                    isActive(link.path)
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                  {isActive(link.path) && (
                    <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  )}
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    {userInitial}
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold text-gray-900"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>

                {/* Mobile Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-semibold active:scale-95"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  <span className="text-lg">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
