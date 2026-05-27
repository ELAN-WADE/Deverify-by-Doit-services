import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Search,
  UserPlus,
  Users,
  Settings,
  Menu,
  ShieldCheck,
  ChevronRight,
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

const AppLogo = () => (
  <div className="flex items-center gap-1 flex-wrap">
    <span className="font-bold text-sm text-slate-800 leading-tight">Deverify</span>
    <span className="text-[9px] text-slate-400 font-medium pt-0.5">by</span>
    <div className="flex items-end gap-[2px] text-secondary ml-0.5 opacity-90">
      <div className="bg-secondary text-white px-1 py-[1.5px] rounded-[2px] transform -skew-x-[15deg] flex items-center justify-center">
        <span className="font-black text-[7px] transform skew-x-[15deg] tracking-tighter leading-none">DOIT</span>
      </div>
      <div className="flex flex-col leading-none pb-[1px]">
        <span className="font-extrabold text-[8px] tracking-tight leading-none">Services</span>
        <span className="font-black text-[4px] text-right tracking-widest leading-none mt-[0.5px]">.NG</span>
      </div>
    </div>
  </div>
);

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

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
          bg-white text-slate-800 border-r border-slate-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="hidden lg:flex px-5 py-6 border-b border-slate-100 items-center shrink-0">
          <div className="min-w-0">
            <AppLogo />
          </div>
        </div>

        {/* Nav section label */}
        <div className="px-5 pt-5 pb-2 shrink-0 flex items-center justify-between mt-4 lg:mt-0">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Menu</p>
          <button
            className="lg:hidden text-xs font-bold text-slate-400 hover:text-secondary flex items-center gap-1.5 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            Back <ChevronRight className="w-3 h-3" />
          </button>
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
      </aside>

      {/* ====== MAIN AREA — full height, flex column ====== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar — sticky, glass effect */}
        <header className="glass-bar border-b border-slate-200/80 px-4 lg:px-6 py-3.5 flex items-center shrink-0 z-30 relative min-h-[60px]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors z-10"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          {/* Centralized Logo on Mobile */}
          <div className="lg:hidden absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <AppLogo />
            </div>
          </div>

          <div className="flex-1 min-w-0 hidden lg:block">
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-hidden relative">
          {/* Watermark */}
          <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.008]">
            <ShieldCheck className="w-[80vh] h-[80vh] text-slate-900" strokeWidth={3} />
          </div>

          <div className="page-scroll h-full px-4 lg:px-6 py-6 relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
