import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Navbar({
  infoText,
  infoLinkText,
  infoLink,
  actionText,
  actionLink,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

//coorected home page
  const isHomePage = location.pathname === "/home";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full h-[72px] flex items-center justify-between px-6 lg:px-12 bg-white/80 backdrop-blur border-b border-gray-100">
      {/* LOGO */}
      <Link to="/home" className="flex items-center gap-2">
        <img src="/skill.png" alt="SkillSwap" className="h-9 w-9" />
        <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          SkillSwap
        </span>
      </Link>

      {/* HOME PAGE CTA */}
      {isHomePage && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{infoText}</span>
          <Link
            to={infoLink}
            className="text-indigo-600 font-semibold hover:underline"
          >
            {infoLinkText}
          </Link>

          <Link
            to={actionLink}
            className="ml-4 px-6 py-2.5 rounded-full font-semibold text-white
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-700 hover:to-purple-700 transition"
          >
            {actionText}
          </Link>
        </div>
      )}

      {/* AUTH PAGES → ONLY LOGO */}
      {isAuthPage && <div />}

      {/* APP NAVBAR */}
      {!isHomePage && !isAuthPage && (
        <>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <NavItem to="/dashboard" label="Discovery" />
            <NavItem to="/my-skills" label="My Skills" />
            <NavItem to="/messages" label="Messages" />
            <NavItem to="/swaprequests" label="Swap Requests" /> 
            <NavItem to="/community" label="Community" />
            <NavItem to="/bookings" label="Bookings" />
          </div>

          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100"
            >
              <div className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center text-white font-semibold">
                P
              </div>
              <ChevronDown size={16} />
            </button>

            {open && (
              <div className="absolute right-0 top-14 w-52 bg-white border rounded-xl shadow-lg">
                <DropdownItem
                  icon={<User size={16} />}
                  label="My Profile"
                  onClick={() => navigate("/profile")}
                />
                <DropdownItem
                  icon={<Settings size={16} />}
                  label="Settings"
                  onClick={() => navigate("/settings")}
                />
                <div className="h-px bg-gray-100 my-1" />
                <DropdownItem
                  icon={<LogOut size={16} />}
                  label="Logout"
                  danger
                  onClick={handleLogout}
                />
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? "text-indigo-600 font-semibold"
          : "text-gray-600 hover:text-indigo-600"
      }
    >
      {label}
    </NavLink>
  );
}

function DropdownItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
