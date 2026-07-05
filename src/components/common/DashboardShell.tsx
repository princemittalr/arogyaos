'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { getNavigationForRole } from '@/config/navigation';
import { icons } from '@/design-system/icons';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { UserRole } from '@/config/roles';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuthActions();
  
  // Responsive States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Interactive Panels
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // Command Palette states
  const [cmdSearch, setCmdSearch] = useState('');
  const [cmdSelectedIndex, setCmdSelectedIndex] = useState(0);

  // Refs for clicking outside
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const role = user?.role || 'citizen';
  const navItems = getNavigationForRole(role);

  // Check viewport width
  useEffect(() => {
    const handleResize = () => {
      const isLowWidth = window.innerWidth < 1024;
      setIsMobile(isLowWidth);
      if (isLowWidth) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error('Sign out operation failed.');
    }
  };

  // Build breadcrumbs
  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((chunk, index, arr) => {
      const href = '/' + arr.slice(0, index + 1).join('/');
      return {
        label: chunk.replace('-', ' '),
        href,
        isLast: index === arr.length - 1,
      };
    });

  // Role Badge Styling
  const roleBadgeStyles: Record<UserRole, string> = {
    citizen: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
    doctor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
    hospital_admin: 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400',
    district_admin: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
    nurse: 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400',
    pharmacist: 'bg-pink-50 text-pink-600 dark:bg-pink-950/20 dark:text-pink-400',
    lab_technician: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400',
    super_admin: 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400',
  };

  const currentRoleStyle = roleBadgeStyles[role] || 'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400';

  // Notifications placeholder data
  const mockNotifications = [
    { id: '1', title: 'Low Stock Alert', desc: 'Paracetamol stock is below 15% at Main Pharmacy.', time: '2 hours ago', unread: true },
    { id: '2', title: 'Schedule Updated', desc: 'Dr. Sharma updated weekly OPD consultation availability.', time: '4 hours ago', unread: true },
    { id: '3', title: 'System Security Sync', desc: 'Role permissions check successfully synced at the Edge.', time: '1 day ago', unread: false },
  ];

  // Command Palette Items
  const commandItems = [
    { label: 'Go to Overview', action: () => router.push(`/dashboard/${role}`) },
    ...navItems.map((item) => ({ label: `Navigate to ${item.title}`, action: () => router.push(item.href) })),
    { label: 'Toggle Theme', action: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
    { label: 'Toggle Sidebar Layout', action: () => setSidebarOpen(!sidebarOpen) },
    { label: 'Switch Language to English', action: () => setLanguage('en') },
    { label: 'Switch Language to Hindi', action: () => setLanguage('hi') },
    { label: 'Logout session', action: handleLogout },
  ];

  const filteredCommandItems = commandItems.filter((item) =>
    item.label.toLowerCase().includes(cmdSearch.toLowerCase())
  );

  // Command palette keyboard navigation
  useEffect(() => {
    if (!commandPaletteOpen) return;
    const handleCmdKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCmdSelectedIndex((prev) => (prev + 1) % filteredCommandItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCmdSelectedIndex((prev) => (prev - 1 + filteredCommandItems.length) % filteredCommandItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommandItems[cmdSelectedIndex]) {
          filteredCommandItems[cmdSelectedIndex].action();
          setCommandPaletteOpen(false);
          setCmdSearch('');
        }
      } else if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleCmdKeyDown);
    return () => window.removeEventListener('keydown', handleCmdKeyDown);
  }, [commandPaletteOpen, cmdSelectedIndex, filteredCommandItems]);

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 },
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      
      {/* ================= 1. DESKTOP/LAPTOP SIDEBAR ================= */}
      {!isMobile && (
        <motion.aside
          initial={sidebarOpen ? 'expanded' : 'collapsed'}
          animate={sidebarOpen ? 'expanded' : 'collapsed'}
          variants={sidebarVariants}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Brand Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
            <Link href={`/dashboard/${role}`} className="flex items-center gap-2 font-extrabold text-lg text-blue-600 dark:text-blue-400 select-none">
              <icons.Activity className="h-6 w-6" />
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tracking-tight">
                  ArogyaOS
                </motion.span>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Sidebar"
              className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              <icons.Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar Nav Items */}
          <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
            {navItems.map((item) => {
              const ItemIcon = icons[item.icon as keyof typeof icons] || icons.Home;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 select-none group',
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/35 dark:text-blue-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  )}
                >
                  <ItemIcon className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
                  {sidebarOpen && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {item.title}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Footer Section */}
          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all duration-200 select-none"
            >
              <icons.LogOut className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{t('common.logout', 'Sign Out')}</span>}
            </button>
          </div>
        </motion.aside>
      )}

      {/* ================= 2. MOBILE DRAWER SIDEBAR ================= */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            />
            {/* Drawer Content */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative flex w-full max-w-xs flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
                <Link href={`/dashboard/${role}`} className="flex items-center gap-2 font-extrabold text-lg text-blue-600 dark:text-blue-400">
                  <icons.Activity className="h-6 w-6" />
                  <span>ArogyaOS</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <icons.X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-2 py-6 overflow-y-auto">
                {navItems.map((item) => {
                  const ItemIcon = icons[item.icon as keyof typeof icons] || icons.Home;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
                        isActive
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/35 dark:text-blue-400'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                      )}
                    >
                      <ItemIcon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-slate-150 pt-4 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition"
                >
                  <icons.LogOut className="h-5 w-5 flex-shrink-0" />
                  <span>{t('common.logout', 'Sign Out')}</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 3. MAIN APP VIEWPORT CONTAINER ================= */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300 min-w-0',
          isMobile ? 'pl-0' : sidebarOpen ? 'pl-64' : 'pl-20'
        )}
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          
          {/* Left Block: Mobile Menu Trigger + Breadcrumbs */}
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
              >
                <icons.Menu className="h-5 w-5" />
              </button>
            )}

            {/* Breadcrumbs Navigation */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 select-none">
              <Link href={`/dashboard/${role}`} className="hover:text-slate-900 dark:hover:text-slate-100 transition">
                Home
              </Link>
              {breadcrumbs.map((bc) => (
                <React.Fragment key={bc.href}>
                  <span className="text-slate-350">/</span>
                  {bc.isLast ? (
                    <span className="font-bold text-slate-900 dark:text-slate-200 capitalize">
                      {bc.label}
                    </span>
                  ) : (
                    <Link href={bc.href} className="hover:text-slate-900 dark:hover:text-slate-100 transition capitalize">
                      {bc.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right Block: Core Toolbar items */}
          <div className="flex items-center gap-3">
            {/* Search Box Trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-1.5 text-slate-450 hover:bg-slate-100 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-950 dark:hover:border-slate-700 transition"
            >
              <icons.Search className="h-4 w-4" />
              <span className="text-xs font-medium hidden md:inline">Search...</span>
              <kbd className="hidden md:inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[9px] font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                ⌘K
              </kbd>
            </button>

            {/* Language Selector */}
            <select
              value={currentLanguage.code}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-slate-200/80 bg-transparent px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-800 dark:text-slate-300 focus:outline-none"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="ta">TA</option>
              <option value="te">TE</option>
              <option value="kn">KN</option>
              <option value="ml">ML</option>
            </select>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={cn(
                  'relative rounded-xl p-2.5 transition text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                  notificationsOpen ? 'bg-slate-100 dark:bg-slate-850' : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                )}
              >
                <icons.Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">Notifications</h4>
                      <button
                        onClick={() => toast.info('All notifications marked as read')}
                        className="text-[10px] font-bold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="mt-2.5 space-y-2 max-h-60 overflow-y-auto">
                      {mockNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            'rounded-xl p-2.5 text-xs transition border border-transparent',
                            notif.unread
                              ? 'bg-blue-50/30 border-blue-100/30 dark:bg-blue-900/10'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-850'
                          )}
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-200">
                            <span>{notif.title}</span>
                            <span className="text-[9px] font-medium text-slate-400">{notif.time}</span>
                          </div>
                          <p className="mt-1 text-slate-500 dark:text-slate-400 leading-normal">{notif.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle Trigger */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              {theme === 'dark' ? (
                <icons.Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <icons.Moon className="h-5 w-5" />
              )}
            </button>

            {/* User Profile Avatar Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-sm uppercase">
                  {user?.fullName?.slice(0, 2) || 'US'}
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-30 mt-2 w-56 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="border-b border-slate-100 dark:border-slate-850 pb-2.5 mb-2 px-1">
                      <p className="font-extrabold text-xs text-slate-900 dark:text-slate-55">{user?.fullName || 'Healthcare User'}</p>
                      <p className="text-[10px] text-slate-450 truncate mt-0.5">{user?.email || 'user@arogya.in'}</p>
                      <span className={cn('inline-block rounded-full px-2 py-0.5 text-[9px] font-bold mt-2 uppercase tracking-wide', currentRoleStyle)}>
                        {role.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5 text-xs font-semibold">
                      <Link
                        href={`/dashboard/${role}`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-slate-700 hover:bg-slate-150 dark:text-slate-350 dark:hover:bg-slate-850 transition"
                      >
                        <icons.UserSquare2 className="h-4 w-4" />
                        <span>Workspace Area</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition text-left"
                      >
                        <icons.LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* ================= 4. COMMAND PALETTE (CTRL/CMD + K) ================= */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandPaletteOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-2 px-3 pb-2 border-b border-slate-100 dark:border-slate-850">
                <icons.Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type a command or path..."
                  value={cmdSearch}
                  onChange={(e) => {
                    setCmdSearch(e.target.value);
                    setCmdSelectedIndex(0);
                  }}
                  className="w-full bg-transparent py-2.5 text-sm outline-none placeholder-slate-400 text-slate-800 dark:text-slate-100"
                  autoFocus
                />
                <button
                  onClick={() => setCommandPaletteOpen(false)}
                  className="rounded px-1.5 py-0.5 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-400"
                >
                  ESC
                </button>
              </div>

              <div className="mt-2 max-h-72 overflow-y-auto space-y-0.5">
                {filteredCommandItems.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-500">No operations matched your search.</p>
                ) : (
                  filteredCommandItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        item.action();
                        setCommandPaletteOpen(false);
                        setCmdSearch('');
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-semibold transition-colors',
                        idx === cmdSelectedIndex
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-850'
                      )}
                    >
                      <span>{item.label}</span>
                      <span className="text-[9px] text-slate-400 uppercase">Action</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 5. FLOATING AI ASSISTANT PANEL ================= */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setAiOpen(!aiOpen)}
          aria-label="Arogya AI Helper"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer"
        >
          <icons.Bot className="h-6 w-6 animate-pulse" />
        </button>

        <AnimatePresence>
          {aiOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute bottom-16 right-0 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <h4 className="flex items-center gap-2 font-bold text-sm text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-850 pb-2">
                <icons.Bot className="h-5 w-5" />
                <span>Operational Intelligence</span>
              </h4>
              <div className="mt-3 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-500 dark:bg-slate-950 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-900">
                Greetings! I am the ArogyaOS Assistant. In this version, I monitor dashboard views and help users search operations. You can press <kbd className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] font-mono">⌘K</kbd> to explore operational shortcuts.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
export default DashboardShell;
