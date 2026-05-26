import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  UserPlus,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useParticipantStore } from '@/hooks/useParticipantStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { addParticipant, participants } = useParticipantStore();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', sex: 'F' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [registeredParticipant, setRegisteredParticipant] = useState<typeof participants[0] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10,11}$/.test(formData.phone.trim())) newErrors.phone = 'Enter a valid phone number (10-11 digits)';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    const dupPhone = participants.find(p => p.phone === formData.phone.trim() && p.phone !== '');
    if (dupPhone) newErrors.phone = `Already registered (${dupPhone.name})`;
    const dupName = participants.find(p => p.name.toLowerCase() === formData.name.trim().toLowerCase() && formData.name.trim());
    if (dupName) newErrors.name = 'This name is already registered';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    const participant = addParticipant({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      sex: formData.sex,
    });
    setRegisteredParticipant(participant);
    setSuccess(true);
    setSubmitting(false);
  };

  const handleReset = () => {
    setFormData({ name: '', phone: '', email: '', sex: 'F' });
    setErrors({});
    setSuccess(false);
    setRegisteredParticipant(null);
  };

  // ─── Success State ───
  if (success && registeredParticipant) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="gradient-hero px-6 py-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-secondary/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-1">Registration Successful!</h2>
            <p className="text-slate-400 text-sm">Participant has been saved locally.</p>
          </div>

          <div className="p-6 space-y-3">
            {[
              { label: 'Full Name', value: registeredParticipant.name },
              { label: 'Phone', value: registeredParticipant.phone },
              ...(registeredParticipant.email ? [{ label: 'Email', value: registeredParticipant.email }] : []),
              { label: 'Participant ID', value: `#${registeredParticipant.id}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
                <span className="font-bold text-slate-800 text-sm">{value}</span>
              </div>
            ))}
          </div>

          <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
            <Button onClick={handleReset} className="flex-1 bg-secondary hover:bg-indigo-700 gap-2 rounded-xl h-11">
              <UserPlus className="w-4 h-4" />
              Register Another
            </Button>
            <Button variant="outline" onClick={() => navigate('/search')} className="flex-1 gap-2 rounded-xl h-11">
              <Search className="w-4 h-4" />
              Go to Lookup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form ───
  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Page header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
          <UserPlus className="w-7 h-7 text-secondary" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800">Register Participant</h2>
        <p className="text-slate-500 text-sm">Add a new participant to the attendance database.</p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Full Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Enter full name..."
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-indigo-400 focus:bg-white transition-colors ${errors.name ? 'border-red-300 bg-red-50' : ''}`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3 shrink-0" />{errors.name}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            Phone Number <span className="text-red-400">*</span>
          </Label>
          <Input
            id="phone"
            placeholder="e.g. 08012345678"
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
            className={`h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-indigo-400 focus:bg-white transition-colors ${errors.phone ? 'border-red-300 bg-red-50' : ''}`}
            maxLength={11}
          />
          {errors.phone && (
            <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3 shrink-0" />{errors.phone}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            Email Address <span className="text-slate-300 font-normal normal-case tracking-normal">(optional)</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="optional@email.com"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className={`h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-indigo-400 focus:bg-white transition-colors ${errors.email ? 'border-red-300 bg-red-50' : ''}`}
          />
          {errors.email && (
            <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3 shrink-0" />{errors.email}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Gender
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {[{ value: 'F', label: '♀ Female' }, { value: 'M', label: '♂ Male' }].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, sex: opt.value }))}
                className={`py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                  formData.sex === opt.value
                    ? opt.value === 'F'
                      ? 'border-pink-400 bg-pink-50 text-pink-700 shadow-sm'
                      : 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-secondary hover:bg-indigo-700 text-white gap-2 h-12 rounded-xl font-bold text-sm shadow-lg shadow-secondary/20 transition-all"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Registering...</>
          ) : (
            <><UserPlus className="w-4 h-4" />Register Participant <ArrowRight className="w-4 h-4 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
