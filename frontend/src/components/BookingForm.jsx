import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { toast } from 'sonner';
import { CalendarIcon, ArrowLeft, Search, Check, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { createBooking } from '@/lib/data';
import { getNextTokenNumber } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { useAuth } from '../context/AuthContext';

function uuid() {
  return uuidv4();
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BookingForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDashboardLink = (role) => {
    switch (role) {
      case 'admin': return '/admin';
      case 'nurse': return '/nurse';
      case 'doctor': return '/doctor';
      default: return '/';
    }
  };

  const tokenRef = useRef(null);
  const [formData, setFormData] = useState({
    bookingType: 'New',
    mrNumber: '',
    patientName: '',
    mobile: '',
    reference: '',
    appointmentDate: null
  });
  const [loading, setLoading] = useState(false);

  // Handle Prefill from Admin Patient List
  const location = useLocation();
  useEffect(() => {
    if (location.state?.prefillPatient) {
      const p = location.state.prefillPatient;
      setFormData(prev => ({
        ...prev,
        bookingType: 'Old',
        mrNumber: p.mr_number,
        patientName: p.patient_name,
        mobile: p.mobile
      }));
      toast.info(`Booking for: ${p.patient_name}`);
    }
  }, [location.state]);

  // Search State
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatedToken, setGeneratedToken] = useState(null);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get(`${API}/patients/search?query=${query}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setFormData({
      ...formData,
      mrNumber: patient.mr_number,
      patientName: patient.patient_name,
      mobile: patient.mobile,
      bookingType: 'Old'
    });
    setOpen(false);
    toast.success('Patient details autofilled');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.patientName.trim()) {
      toast.error('Patient name is required');
      return;
    }
    if (!formData.mobile.trim()) {
      toast.error('Mobile number is required');
      return;
    }
    if (formData.mobile.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }
    if (!formData.appointmentDate) {
      toast.error('Appointment date is required');
      return;
    }
    if (!formData.reference) {
      toast.error('Reference is required');
      return;
    }

    setLoading(true);

    try {
      const tokenNumber = await getNextTokenNumber();
      const booking = {
        id: uuid(),
        booking_type: formData.bookingType,
        mr_number: formData.mrNumber || null,
        patient_name: formData.patientName,
        mobile: formData.mobile,
        reference: formData.reference,
        appointment_date: format(formData.appointmentDate, 'yyyy-MM-dd'),
        token_number: tokenNumber,
        created_at: new Date().toISOString(),
        synced: false
      };

      // Use the robust createBooking helper
      const savedBooking = await createBooking(booking);

      // Prepare for Token Download
      setGeneratedToken({ ...savedBooking, dateStr: format(formData.appointmentDate, 'dd MMM yyyy') });
      toast.success('Booking created successfully!');

    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadToken = async () => {
    if (!tokenRef.current) return;

    try {
      const canvas = await html2canvas(tokenRef.current);
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Token-${generatedToken.token_number}.png`;
      link.click();

      // Navigate after download
      navigate('/booking-success', { state: { booking: generatedToken } });
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download token");
    }
  };

  if (generatedToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 flex items-center justify-center font-sans">
        <div className="container max-w-md animate-fade-in">
          <Card className="glass overflow-hidden shadow-2xl border-t-8 border-t-green-500">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="font-heading text-2xl text-green-700">Booking Confirmed!</CardTitle>
              <CardDescription>Appointment scheduled successfully.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div ref={tokenRef} className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center space-y-4 shadow-inner">
                {/* Admin View: Show MRN prominently if new */}
                {generatedToken.mr_number && (
                  <div className="text-sm font-bold text-blue-600 uppercase tracking-widest">MRN: {generatedToken.mr_number}</div>
                )}
                <div className="text-6xl font-black text-primary tracking-tighter">{generatedToken.token_number}</div>
                <div className="text-xl font-heading font-semibold text-gray-800">{generatedToken.patient_name}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {generatedToken.dateStr}
                </div>
              </div>

              <div className="grid gap-3 pt-4">
                <Button onClick={downloadToken} className="w-full bg-primary hover:bg-blue-700 h-12 text-lg shadow-lg hover:shadow-xl transition-all">
                  <Download className="w-5 h-5 mr-2" /> Download Token
                </Button>
                {/* Admin options */}
                <Button variant="outline" onClick={() => window.location.reload()} className="w-full h-11 border-primary/20 hover:bg-primary/5 text-primary">
                  Book Another Appointment
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => user ? navigate(getDashboardLink(user.role)) : navigate('/')}
                  className="w-full h-11 text-muted-foreground hover:text-foreground"
                >
                  {user ? 'Back to Dashboard' : 'Back to Home'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-8 px-4 font-sans">
      <div className="container mx-auto max-w-2xl animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="glass border-0 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-teal-400" />
          <CardHeader className="pb-8">
            <CardTitle className="text-3xl font-heading font-bold text-center text-gray-800">
              Book Appointment
            </CardTitle>
            <CardDescription className="text-center text-lg">Enter details or search existing records</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Booking Type */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Patient Status</Label>
                <RadioGroup
                  value={formData.bookingType}
                  onValueChange={(value) => setFormData({ ...formData, bookingType: value })}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="New" id="new" className="peer sr-only" />
                    <Label
                      htmlFor="new"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all h-full"
                    >
                      <span className="text-xl mb-1">🆕</span>
                      <span className="font-semibold">New Patient</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="Old" id="old" className="peer sr-only" />
                    <Label
                      htmlFor="old"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all h-full"
                    >
                      <span className="text-xl mb-1">🔄</span>
                      <span className="font-semibold">Returning</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Old Patient Search */}
              {formData.bookingType === 'Old' && (
                <div className="space-y-2 p-6 bg-blue-50/50 rounded-xl border border-blue-100 animate-fade-in">
                  <Label className="text-sm font-semibold text-blue-900">Find Patient Record</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-white h-12 border-blue-200 hover:border-blue-300"
                      >
                        {formData.mrNumber
                          ? `${formData.patientName} (${formData.mrNumber})`
                          : "Search by MR Number, Name or Mobile..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Type to search..."
                          onValueChange={handleSearch}
                          className="h-12"
                        />
                        <CommandList>
                          <CommandEmpty>No patient found.</CommandEmpty>
                          <CommandGroup heading="Results">
                            {searchResults.map((patient) => (
                              <CommandItem
                                key={patient.id}
                                onSelect={() => handleSelectPatient(patient)}
                                className="cursor-pointer py-3"
                              >
                                <div className="flex flex-col">
                                  <span className="font-semibold">{patient.patient_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {patient.mr_number} • {patient.mobile}
                                  </span>
                                </div>
                                {formData.mrNumber === patient.mr_number && (
                                  <Check className="ml-auto h-4 w-4 text-green-500" />
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-blue-600/80 pl-1">Search to auto-fill details from previous visits.</p>
                </div>
              )}

              {/* Patient Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="patientName"
                    placeholder="Enter full name"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    required
                    className="h-12 bg-gray-50/50 focus:bg-white transition-colors"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required
                    className="h-12 bg-gray-50/50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Reference */}
              <div className="space-y-2">
                <Label htmlFor="reference">Reference <span className="text-red-500">*</span></Label>
                <Select value={formData.reference} onValueChange={(value) => setFormData({ ...formData, reference: value })} required>
                  <SelectTrigger className="h-12 bg-gray-50/50">
                    <SelectValue placeholder="How did you hear about us?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Newspaper">Newspaper</SelectItem>
                    <SelectItem value="Friends">Friends / Family</SelectItem>
                    <SelectItem value="Camp">Medical Camp</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Doctor Referral">Doctor Referral</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Appointment Date */}
              <div className="space-y-2">
                <Label>Appointment Date <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal h-12 bg-gray-50/50 ${!formData.appointmentDate && 'text-muted-foreground'}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.appointmentDate ? format(formData.appointmentDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.appointmentDate}
                      onSelect={(date) => setFormData({ ...formData, appointmentDate: date })}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300"
                disabled={loading}
              >
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Confirming...</> : 'Confirm Booking'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingForm;