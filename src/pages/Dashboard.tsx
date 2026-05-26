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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParticipantStore } from '@/hooks/useParticipantStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats } = useParticipantStore();

  const statCards = [
    {
      title: 'Total Participants',
      value: stats.total.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'With Phone',
      value: stats.withPhone.toLocaleString(),
      icon: Phone,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'With Email',
      value: stats.withEmail.toLocaleString(),
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Female',
      value: stats.female.toLocaleString(),
      icon: UserCheck,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 lg:p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            Participant Attendance Dashboard
          </h1>
          <p className="text-slate-300 mb-6">
            Search, register, and manage training participants. All data is stored locally and works offline.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/search')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
            >
              <Search className="w-4 h-4" />
              Lookup Participant
            </Button>
            <Button
              onClick={() => navigate('/register')}
              variant="outline"
              className="border-slate-600 text-slate-900 hover:bg-slate-100 gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Register New
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Recent Registrations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.recentRegistrations.length > 0 ? (
              <div className="space-y-3">
                {stats.recentRegistrations.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => navigate(`/search?id=${p.id}`)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.phone}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No recent registrations</p>
                <Button
                  onClick={() => navigate('/register')}
                  variant="link"
                  className="text-emerald-600 mt-1"
                >
                  Register a participant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <button
              onClick={() => navigate('/search')}
              className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Search Participant</p>
                <p className="text-xs text-gray-500">Find by name or phone number</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/register')}
              className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Register New</p>
                <p className="text-xs text-gray-500">Add a new participant</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/participants')}
              className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">View All</p>
                <p className="text-xs text-gray-500">Browse all {stats.total.toLocaleString()} participants</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
