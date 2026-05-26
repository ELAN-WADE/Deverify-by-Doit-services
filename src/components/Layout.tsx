import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Search,
  UserPlus,
  Users,
  Settings,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/search', label: 'Lookup', icon: Search },
  { path: '/register', label: 'Register', icon: UserPlus },
  { path: '/participants', label: 'Participants', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPage = navItems.find(n => n.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ====== SIDEBAR — fixed, never scrolls ====== */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 flex flex-col flex-shrink-0
          bg-secondary text-white
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="px-5 py-6 border-b border-slate-700/50 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-white leading-tight">Deverify</p>
            <p className="text-[11px] text-emerald-400 font-medium truncate">by DOit serivices</p>
          </div>
          <button
            className="lg:hidden ml-auto text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav section label */}
        <div className="px-5 pt-5 pb-2 shrink-0">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Menu</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-sm">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Offline status footer */}
        <div className="px-4 py-4 border-t border-slate-700/50 shrink-0">
          <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
              <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-emerald-400">Offline Ready</p>
              <p className="text-[10px] text-slate-500">All data stored locally</p>
            </div>
            <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0" />
          </div>
        </div>
      </aside>

      {/* ====== MAIN AREA — full height, flex column ====== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar — sticky, glass effect */}
        <header className="glass-bar border-b border-slate-200/80 px-4 lg:px-6 py-3.5 flex items-center gap-3 shrink-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
              <span>Deverify</span>
              <span>/</span>
              <span className="text-emerald-600 font-medium">{currentPage}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">{currentPage}</h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Wifi className="w-3 h-3" />
            Offline Ready
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-hidden">
          <div className="page-scroll h-full px-4 lg:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
