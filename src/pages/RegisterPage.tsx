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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useParticipantStore } from '@/hooks/useParticipantStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { addParticipant, participants } = useParticipantStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    sex: 'F',
  });
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

    // Check for duplicate
    const dupPhone = participants.find(
      p => p.phone === formData.phone.trim() && p.phone !== ''
    );
    if (dupPhone) newErrors.phone = `This phone number is already registered (${dupPhone.name})`;

    const dupName = participants.find(
      p => p.name.toLowerCase() === formData.name.trim().toLowerCase() && formData.name.trim()
    );
    if (dupName) newErrors.name = `This name is already registered`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    // Simulate brief delay
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

  if (success && registeredParticipant) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-500 mb-6">
              The participant has been registered and saved locally.
            </p>

            <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                <p className="font-semibold text-gray-900">{registeredParticipant.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                <p className="font-semibold text-gray-900">{registeredParticipant.phone}</p>
              </div>
              {registeredParticipant.email && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="font-semibold text-gray-900">{registeredParticipant.email}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Participant ID</p>
                <p className="font-semibold text-emerald-600">#{registeredParticipant.id}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleReset}
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Register Another
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/search')}
              >
                Go to Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center space-y-2 mb-6">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <UserPlus className="w-7 h-7 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Register Participant</h2>
        <p className="text-gray-500 text-sm">
          Add a new participant to the attendance database.
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Full Name *
            </Label>
            <Input
              id="name"
              placeholder="Enter full name..."
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={errors.name ? 'border-red-300' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              placeholder="e.g. 08012345678"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
              className={errors.phone ? 'border-red-300' : ''}
              maxLength={11}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="optional@email.com"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={errors.email ? 'border-red-300' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Gender
            </Label>
            <div className="flex gap-3">
              {[
                { value: 'F', label: 'Female' },
                { value: 'M', label: 'Male' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sex: opt.value }))}
                  className={`
                    flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border-2 transition-colors
                    ${formData.sex === opt.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }
                  `}
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
            className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 h-11"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Register Participant
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
