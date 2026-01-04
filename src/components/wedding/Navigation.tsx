import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", href: "#" },
  { label: "Date", href: "#countdown" },
  { label: "Location", href: "#location" },
  { label: "Agenda", href: "#agenda" },
  { label: "RSVP", href: "#rsvp" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 hidden md:block"
      >
        <div className="bg-background/80 backdrop-blur-md border-b border-primary/10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <ul className="flex items-center justify-center gap-8">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-foreground/80 hover:text-primary transition-colors text-sm tracking-widest uppercase font-sans"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 md:hidden w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-primary/20 flex items-center justify-center"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-primary" />
        ) : (
          <Menu className="w-5 h-5 text-primary" />
        )}
      </motion.button>

      {/* Mobile Navigation Menu */}
      <motion.div
        initial={false}
        animate={isOpen ? { x: 0 } : { x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 z-40 w-64 bg-background/95 backdrop-blur-lg border-l border-primary/20 md:hidden"
      >
        <nav className="flex flex-col items-center justify-center h-full">
          <ul className="space-y-8">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-foreground/80 hover:text-primary transition-colors text-lg tracking-widest uppercase font-sans"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </motion.div>

      {/* Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-background/50 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
};

export default Navigation;
