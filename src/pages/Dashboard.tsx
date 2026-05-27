import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Users,
  UserCheck,
  UserPlus,
  Phone,
  Mail,
  TrendingUp,
  ArrowRight,
  Search,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useParticipantStore } from '@/hooks/useParticipantStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats } = useParticipantStore();

  const [typedText, setTypedText] = useState('');
  const fullText = "DOIT Services, Young African Work and Ogun state";

  useEffect(() => {
    let typeInterval: any;
    let pauseTimeout: any;

    const startTyping = () => {
      let currentText = '';
      let i = 0;
      setTypedText('');
      
      typeInterval = setInterval(() => {
        if (i < fullText.length) {
          currentText += fullText[i];
          setTypedText(currentText);
          i++;
        } else {
          clearInterval(typeInterval);
          pauseTimeout = setTimeout(() => {
            startTyping();
          }, 5000);
        }
      }, 40);
    };

    startTyping();

    return () => {
      clearInterval(typeInterval);
      clearTimeout(pauseTimeout);
    };
  }, []);

  const statCards = [
    {
      title: 'Total Participants',
      value: stats.total.toLocaleString(),
      icon: Users,
      gradient: 'from-secondary to-indigo-800',
      lightBg: 'bg-indigo-50',
      lightIcon: 'text-secondary',
      change: 'All registered records',
    },
    {
      title: 'With Phone',
      value: stats.withPhone.toLocaleString(),
      icon: Phone,
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      lightIcon: 'text-blue-600',
      change: `${stats.total ? Math.round((stats.withPhone / stats.total) * 100) : 0}% coverage`,
    },
    {
      title: 'With Email',
      value: stats.withEmail.toLocaleString(),
      icon: Mail,
      gradient: 'from-violet-500 to-violet-600',
      lightBg: 'bg-violet-50',
      lightIcon: 'text-violet-600',
      change: `${stats.total ? Math.round((stats.withEmail / stats.total) * 100) : 0}% coverage`,
    },
    {
      title: 'Gender Split',
      value: `${stats.female}F / ${stats.male}M`,
      icon: UserCheck,
      gradient: 'from-pink-500 to-rose-500',
      lightBg: 'bg-pink-50',
      lightIcon: 'text-pink-600',
      change: `${stats.total ? Math.round((stats.female / stats.total) * 100) : 0}% female`,
    },
  ];

  const quickActions = [
    {
      label: 'View All Participants',
      description: `Browse all ${stats.total.toLocaleString()} records`,
      icon: Users,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      path: '/participants',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Hero Banner */}
      <div className="gradient-hero rounded-2xl p-6 lg:p-8 text-white overflow-hidden relative shadow-lg shadow-secondary/20">
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-20 bottom-0 w-32 h-32 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />

        {/* App Icon at right end */}
        <div className="flex absolute right-4 sm:right-8 lg:right-12 top-1/2 -translate-y-1/2 pointer-events-none">
          <ShieldCheck className="w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 text-white opacity-20 lg:opacity-100 lg:text-slate-50 drop-shadow-lg" strokeWidth={2.5} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="flex-1 flex flex-col items-center">
            <p 
              className="text-sm lg:text-base text-indigo-100 mb-2 tracking-wide flex items-center justify-center min-h-[1.5rem]"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              {typedText}
              <span className={`w-0.5 h-4 lg:h-5 bg-indigo-200 ml-1 rounded-full ${typedText.length === fullText.length ? 'animate-pulse' : 'opacity-100'}`} />
            </p>
            <h2 className="text-2xl lg:text-4xl font-bold text-white mb-8 leading-tight">
              Participants Dashboard
            </h2>
            <div className="flex flex-row justify-center gap-2 sm:gap-4 w-full max-w-xl">
              <button
                onClick={() => navigate('/search')}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 bg-white border border-transparent text-secondary hover:bg-slate-50 px-3 py-2.5 sm:px-6 sm:py-2.5 rounded-xl font-semibold text-[11px] sm:text-sm transition-all duration-200 shadow-md shadow-black/10"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Lookup Participant
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 bg-secondary border border-white/30 hover:bg-indigo-800 text-white px-3 py-2.5 sm:px-6 sm:py-2.5 rounded-xl font-semibold text-[11px] sm:text-sm transition-all duration-200"
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Register New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 ${stat.lightBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.lightIcon}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-secondary opacity-60" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{stat.title}</p>
              <p className="text-[11px] text-secondary font-medium mt-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-secondary rounded-full inline-block" />
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom grid: Recent + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Registrations — perfectly balances screen */}
        <div className="bg-secondary rounded-2xl shadow-sm overflow-hidden text-white">
          <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-800/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-900 rounded-lg flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-indigo-300" />
              </div>
              <h3 className="font-bold text-white text-sm tracking-wide">Recent Registrations</h3>
            </div>
            <button
              onClick={() => navigate('/participants')}
              className="text-xs text-indigo-300 font-bold hover:text-white flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {stats.recentRegistrations.length > 0 ? (
            <div className="divide-y divide-indigo-800/30">
              {stats.recentRegistrations.slice(0, 4).map(p => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-indigo-900/40 cursor-pointer transition-colors"
                  onClick={() => navigate(`/search?id=${p.id}`)}
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-indigo-400/20">
                    <span className="text-white text-sm font-bold">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{p.name}</p>
                    <p className="text-[11px] font-medium text-indigo-300 truncate mt-0.5">{p.phone || p.email || 'No contact provided'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-indigo-900/60 text-indigo-200 border border-indigo-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center px-5">
              <div className="w-12 h-12 bg-indigo-900 rounded-2xl flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-sm font-bold text-white">No recent registrations</p>
              <p className="text-xs text-indigo-300 mt-1">Participants you register will appear here</p>
              <button
                onClick={() => navigate('/register')}
                className="mt-4 text-xs font-bold text-indigo-200 hover:text-white"
              >
                Register a participant →
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions — perfectly balances screen */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">Quick Actions</h3>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  className="action-btn"
                >
                  <div className={`w-9 h-9 ${action.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${action.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                    <p className="text-xs text-slate-400 truncate">{action.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Gender breakdown mini card */}
          <div className="mx-4 mb-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 mb-3">Gender Breakdown</p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Female</span>
                  <span className="text-pink-400 font-bold">
                    {stats.total ? Math.round((stats.female / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.total ? (stats.female / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-end gap-3 mt-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Male</span>
                  <span className="text-blue-400 font-bold">
                    {stats.total ? Math.round((stats.male / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.total ? (stats.male / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
