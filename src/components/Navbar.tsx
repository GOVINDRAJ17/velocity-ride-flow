import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun, LogOut, User, Search, MapPin, Car, Calendar, Cloud, Square, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", href: "#home", icon: null },
    { name: "Create", href: "#create", icon: Car },
    { name: "Radio", href: "#radio", icon: Radio },
    { name: "Schedule", href: "#schedule", icon: Calendar },
    { name: "Weather", href: "#weather", icon: Cloud },
    { name: "Location", href: "#location", icon: MapPin },
    { name: "Split", href: "#split", icon: Square },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="#home" className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 border border-blue-400/20">
              <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Velocity</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 group"
              >
                {item.icon && <item.icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />}
                {item.name}
              </button>
            ))}
          </div>

          {/* Theme Toggle & Auth */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </Button>

            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 text-sm">{user.email}</span>
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                  className="border-white/20 text-white hover:bg-white/5 rounded-xl"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="text-gray-300 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl border border-blue-400/20"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-2xl border-t border-white/10">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 border border-transparent hover:border-white/10"
              >
                {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                {item.name}
              </button>
            ))}
            <div className="pt-6 pb-2 space-y-3 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={toggleTheme}
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5 rounded-xl border border-white/10"
              >
                {theme === "light" ? (
                  <>
                    <Moon size={20} className="mr-3" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun size={20} className="mr-3" />
                    Light Mode
                  </>
                )}
              </Button>

              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-400">
                    {user.email}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => signOut()}
                    className="w-full border-white/20 text-white hover:bg-white/5 rounded-xl"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5 rounded-xl border border-white/10"
                    onClick={() => navigate("/auth")}
                  >
                    Login
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl border border-blue-400/20"
                    onClick={() => navigate("/auth")}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
