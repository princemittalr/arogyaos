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

interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

interface DashboardShellProps {
  children: React.ReactNode;
}

const ROLE_COLORS: Record<UserRole, string> = {
  citizen: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400',
  doctor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400',
  hospital_admin: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400',
  district_admin: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400',
  nurse: 'text-teal-600 bg-teal-50 dark:bg-teal-950/30 dark:text-teal-400',
  pharmacist: 'text-pink-600 bg-pink-50 dark:bg-pink-950/30 dark:text-pink-400',
  lab_technician: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 dark:text-cyan-400',
  super_admin: 'text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400'
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { setTheme, resolvedTheme } = useTheme();
  const { logout } = useAuthActions();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {setMounted(true);}, []);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');
  const [cmdSelectedIndex, setCmdSelectedIndex] = useState(0);

  const [notifications, setNotifications] = useState<Notification[]>([
  { id: '1', title: t("common.low_stock_alert"), desc: 'Paracetamol stock below 15% at Main Pharmacy.', time: '2h ago', unread: true },
  { id: '2', title: t("common.schedule_updated"), desc: 'Dr. Sharma updated OPD consultation availability.', time: '4h ago', unread: true },
  { id: '3', title: t("common.system_sync"), desc: 'Role permissions check successfully synced.', time: '1d ago', unread: false }]
  );

  const unreadCount = notifications.filter((n) => n.unread).length;
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const role = user?.role || 'citizen';
  const navItems = getNavigationForRole(role);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) setNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {e.preventDefault();setCommandPaletteOpen((p) => !p);}
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = async () => {
    try {await logout();} catch {toast.error(t('toast.logout_failed', 'Sign out failed.'));}
  };

  const handleClearAll = () => {setNotifications([]);toast.success(t('toast.clear_notifs', 'All notifications cleared.'));};
  const handleMarkRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, unread: false } : n));

  const commandItems = [
    { label: t('cmd.go_to_dashboard', 'Go to Dashboard'), action: () => router.push(`/dashboard/${role}`) },
    ...navItems.map((item) => ({ label: t(`nav.${item.title.toLowerCase().replace(/ /g, '_')}`, item.title), action: () => router.push(item.href) })),
    { label: t('cmd.toggle_theme', 'Toggle Theme'), action: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark') },
    { label: t('common.logout', 'Sign Out'), action: handleLogout }
  ];

  const filteredCmds = commandItems.filter((i) => i.label.toLowerCase().includes(cmdSearch.toLowerCase()));

  useEffect(() => {
    if (!commandPaletteOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {e.preventDefault();setCmdSelectedIndex((p) => (p + 1) % filteredCmds.length);} else
      if (e.key === 'ArrowUp') {e.preventDefault();setCmdSelectedIndex((p) => (p - 1 + filteredCmds.length) % filteredCmds.length);} else
      if (e.key === 'Enter') {e.preventDefault();filteredCmds[cmdSelectedIndex]?.action();setCommandPaletteOpen(false);setCmdSearch('');} else
      if (e.key === 'Escape') setCommandPaletteOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, cmdSelectedIndex, filteredCmds]);

  // Sidebar link component
  const SidebarLink = ({ item, onClick }: {item: typeof navItems[0];onClick?: () => void;}) => {const { t } = useLanguage();
    const Icon = icons[item.icon as keyof typeof icons] || icons.Home;
    const isActive = pathname === item.href || item.href !== `/dashboard/${role}` && pathname.startsWith(item.href);
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          isActive ?
          'bg-blue-600 text-white shadow-sm shadow-blue-600/20' :
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
        )}>
        
        <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300')} />
        {sidebarOpen && <span className="truncate">{t(`nav.${item.title.toLowerCase().replace(/ /g, '_')}`, item.title)}</span>}
      </Link>);

  };

  const SidebarContent = ({ onLinkClick }: {onLinkClick?: () => void;}) => {const { t } = useLanguage();
    // Group: first item is Dashboard, last 2 are Profile+Settings, rest are core
    const dashItem = navItems[0];
    const coreItems = navItems.slice(1, -2);
    const tailItems = navItems.slice(-2);
    const hasTail = navItems.length > 3;

    return (
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className={cn('flex h-14 items-center border-b border-slate-100 dark:border-slate-800', sidebarOpen ? 'px-4 gap-2.5' : 'justify-center px-0')}>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <icons.Activity className="h-4.5 w-4.5" />
          </div>
          {sidebarOpen &&
          <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50 leading-none">{t("common.arogyaos")}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{role.replace('_', ' ')}</p>
            </div>
          }
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {/* Dashboard */}
          {dashItem && <SidebarLink item={dashItem} onClick={onLinkClick} />}

          {/* Core */}
          {coreItems.length > 0 &&
          <div className="pt-3">
              {sidebarOpen && <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t('common.operations', 'Operations')}</p>}
              <div className="space-y-0.5">
                {coreItems.map((item) => <SidebarLink key={item.href} item={item} onClick={onLinkClick} />)}
              </div>
            </div>
          }

          {/* Profile + Settings */}
          {hasTail &&
          <div className="pt-3">
              {sidebarOpen && <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t('common.account', 'Account')}</p>}
              <div className="space-y-0.5">
                {tailItems.map((item) => <SidebarLink key={item.href} item={item} onClick={onLinkClick} />)}
              </div>
            </div>
          }
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-3">
          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all',
              !sidebarOpen && 'justify-center'
            )}>
            
            <icons.LogOut className="h-4 w-4 flex-shrink-0" />
            {sidebarOpen && <span>{t('common.logout', 'Sign Out')}</span>}
          </button>
        </div>
      </div>);

  };

  const roleStyle = ROLE_COLORS[role] || 'text-slate-600 bg-slate-50';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* Desktop Sidebar */}
      {!isMobile &&
      <motion.aside
        animate={{ width: sidebarOpen ? 224 : 64 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        
          <SidebarContent />
        </motion.aside>
      }

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen &&
        <div className="fixed inset-0 z-50 flex">
            <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
          
            <motion.aside
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="relative w-64 bg-white dark:bg-slate-900 h-full shadow-2xl">
            
              <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
            </motion.aside>
          </div>
        }
      </AnimatePresence>

      {/* Main content */}
      <div className={cn('flex flex-1 flex-col min-w-0 transition-all duration-250', isMobile ? 'pl-0' : sidebarOpen ? 'pl-56' : 'pl-16')}>

        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">

          <div className="flex items-center gap-3">
            {/* Mobile menu + sidebar toggle */}
            <button
              onClick={() => isMobile ? setMobileMenuOpen(true) : setSidebarOpen(!sidebarOpen)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle sidebar">
              
              <icons.Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
              <Link href={`/dashboard/${role}`} className="hover:text-slate-900 dark:hover:text-slate-100 transition font-medium">
                {t('nav.home', 'Home')}
              </Link>
              {pathname.split('/').filter(Boolean).slice(2).map((chunk, i, arr) =>
              <React.Fragment key={i}>
                  <span className="text-slate-300 dark:text-slate-700">/</span>
                  <span className={cn('capitalize font-medium', i === arr.length - 1 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500')}>
                    {t(`nav.${chunk.replace(/-/g, '_')}`, chunk.replace(/-/g, ' '))}
                  </span>
                </React.Fragment>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              aria-label={t('common.search_workspace', 'Search Workspace')}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition mr-2">
              
              <icons.Search className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t('common.search', 'Search...')}</span>
              <kbd className="hidden md:inline-flex rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1 font-mono text-[10px] text-slate-400">{t("common.k")}</kbd>
            </button>

            {/* Language */}
            <select
              value={currentLanguage.code}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label={t("common.select_language", "Select Language")}
              className="rounded-lg border border-slate-200 bg-transparent px-2 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer">
              
              <option value="en">{t("common.en")}</option>
              <option value="hi">{t("common.hi")}</option>
              <option value="ta">{t("common.ta")}</option>
              <option value="te">{t("common.te")}</option>
              <option value="kn">{t("common.kn")}</option>
              <option value="ml">{t("common.ml")}</option>
            </select>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label={t("nav.notifications", "Notifications")}
                aria-expanded={notificationsOpen}
                aria-haspopup="true">
                
                <icons.Bell className="h-4.5 w-4.5" aria-hidden="true" />
                {unreadCount > 0 &&
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                }
              </button>

              <AnimatePresence>
                {notificationsOpen &&
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                  transition={{ duration: 0.12 }}
                  role="dialog"
                  aria-label={t('nav.notifications', 'Notifications')}
                  className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
                  
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t('nav.notifications', 'Notifications')}</span>
                        {unreadCount > 0 &&
                      <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">{unreadCount}</span>
                      }
                      </div>
                      <button onClick={handleClearAll} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition">
                        {t('common.clear_all', 'Clear all')}
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                      {notifications.length === 0 ?
                    <p className="py-8 text-center text-xs text-slate-400">{t('common.no_notifications', "You're all caught up!")}</p> :
                    notifications.map((n) =>
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={cn('px-4 py-3 cursor-pointer transition', n.unread ? 'bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50')}>
                      
                          <div className="flex items-start gap-2.5">
                            {n.unread && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                            <div className={cn('flex-1 min-w-0', !n.unread && 'pl-4')}>
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                                <span className="text-[10px] text-slate-400 flex-shrink-0">{n.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                            </div>
                          </div>
                        </div>
                    )}
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label={t("common.toggle_theme", "Toggle Theme")}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              
              {!mounted ? <div className="h-4.5 w-4.5" /> : resolvedTheme === 'dark' ? <icons.Sun className="h-4.5 w-4.5 text-amber-400" aria-hidden="true" /> : <icons.Moon className="h-4.5 w-4.5 text-slate-500" aria-hidden="true" />}
            </button>

            {/* Profile */}
            <div className="relative ml-1" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label={t('common.profile_menu', 'Profile Menu')}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[11px] font-bold uppercase">
                  {user?.fullName?.slice(0, 2) || 'US'}
                </div>
                <icons.ChevronDown className="h-3 w-3 text-slate-400 hidden sm:block" aria-hidden="true" />
              </button>

              <AnimatePresence>
                {profileOpen &&
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
                  
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{user?.fullName || 'Healthcare User'}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                      <span className={cn('mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize', roleStyle)}>
                        {role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="p-1.5">
                      <Link
                      href={`/dashboard/${role}`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition">
                      
                        <icons.UserCircle className="h-3.5 w-3.5" />
                        {t('nav.dashboard', 'Dashboard')}
                      </Link>
                      <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition">
                      
                        <icons.LogOut className="h-3.5 w-3.5" />
                        {t('common.logout', 'Sign Out')}
                      </button>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <AnimatePresence>
        {commandPaletteOpen &&
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
          
            <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <icons.Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <input
                autoFocus
                type="text"
                placeholder={t('common.search_placeholder', 'Search or jump to...')}
                value={cmdSearch}
                onChange={(e) => {setCmdSearch(e.target.value);setCmdSelectedIndex(0);}}
                className="flex-1 bg-transparent text-sm outline-none placeholder-slate-400 text-slate-900 dark:text-slate-100" />
              
                <button onClick={() => setCommandPaletteOpen(false)} className="rounded-md border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">{t("common.esc")}</button>
              </div>
              <div className="max-h-64 overflow-y-auto p-1.5">
                {filteredCmds.length === 0 ?
              <p className="py-6 text-center text-xs text-slate-400">{t('common.no_results', 'No results found')}</p> :
              filteredCmds.map((item, idx) =>
              <button
                key={idx}
                onClick={() => {item.action();setCommandPaletteOpen(false);setCmdSearch('');}}
                className={cn(
                  'flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition',
                  idx === cmdSelectedIndex ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                )}>
                
                    {item.label}
                  </button>
              )}
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}

export default DashboardShell;