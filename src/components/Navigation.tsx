'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  House,
  FileText,
  Coins,
  ChartBar,
  CaretDown,
  List,
  X,
  Sun,
  Moon
} from '@phosphor-icons/react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: {
    name: string;
    href: string;
    description?: string;
  }[];
}

const navigation: NavItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: House,
  },
  {
    name: 'Current Contracts',
    icon: FileText,
    children: [
      {
        name: 'Federal',
        href: '/contracts/federal',
        description: 'SAM.gov opportunities'
      },
      {
        name: 'State',
        href: '/contracts/state',
        description: 'Regional opportunities'
      }
    ]
  },
  {
    name: 'Grants',
    icon: Coins,
    children: [
      {
        name: 'Awarded Grants',
        href: '/grants/awarded',
        description: 'Successful funding'
      },
      {
        name: 'Cancelled Grants',
        href: '/grants/cancelled',
        description: 'Terminated funding'
      }
    ]
  },
  {
    name: 'Analytics',
    icon: ChartBar,
    children: [
      {
        name: 'Spend Analysis',
        href: '/analytics/spend',
        description: 'Spending patterns & trends'
      },
      {
        name: 'Contractor Analysis',
        href: '/analytics/contractors',
        description: 'Win rates & capabilities'
      }
    ]
  }
];

function NavDropdown({ item, mobile = false }: { item: NavItem; mobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = item.children?.some(child => pathname === child.href) || 
    (item.name === 'Current Contracts' && pathname === '/');

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
          mobile && "w-full justify-between"
        )}
      >
        <div className="flex items-center gap-2">
          <item.icon className="h-4 w-4" />
          <span>{item.name}</span>
        </div>
        <CaretDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "transform rotate-180"
        )} weight="bold" />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute z-50 mt-2 w-64 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden",
          mobile ? "relative w-full mt-2" : "left-0"
        )}>
          <div className="py-1">
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block px-4 py-3 text-sm transition-all duration-200",
                  pathname === child.href
                    ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:pl-5"
                )}
                onClick={() => setIsOpen(false)}
              >
                <div className="font-medium">{child.name}</div>
                {child.description && (
                  <div className="text-gray-500 text-xs mt-0.5">{child.description}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme as 'light' | 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-gray-200/20 dark:border-gray-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-xl gradient-text">GovChime</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Contract Intelligence</div>
                </div>
              </div>
            </Link>

            <div className="hidden md:ml-10 md:flex md:items-center md:space-x-4">
              {navigation.map((item) => {
                if (item.children) {
                  return <NavDropdown key={item.name} item={item} />;
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      pathname === item.href
                        ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" weight="duotone" />
              ) : (
                <Sun className="h-5 w-5" weight="duotone" />
              )}
            </button>
            
            <div className="md:hidden">
              <button
                type="button"
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-800/50 transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" weight="bold" />
                ) : (
                  <List className="h-6 w-6" weight="bold" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              if (item.children) {
                return <NavDropdown key={item.name} item={item} mobile />;
              }

              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    pathname === item.href
                      ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}