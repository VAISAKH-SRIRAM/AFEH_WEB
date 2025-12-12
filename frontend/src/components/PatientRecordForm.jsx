import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { ArrowLeft, Save, CalendarIcon, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { savePatient, getPatientById, getBookingById, deletePatient } from '@/lib/storage';
import { createPatientRecord, updatePatientRecord } from '@/lib/data';

function uuid() {
  return uuidv4();
}

const PatientRecordForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Demographics
    mr_number: '',
    booking_type: 'New',
    patient_name: '',
    gender: '',
    age: '',
    dob: null,
    mobile: '',
    alternate_contact: '',
    address: { door_no: '', street: '', city: '', state: '', pincode: '' },
    email: '',

    // Appointment Details
    appointment_date: '',
    appointment_time: '',
    department: 'Ophthalmology',
    consulting_doctor: '',
    reference: '',
    visit_type: 'New',
    company_insurance: { company: '', policy_number: '', tpa: '' },

    // Clinical - History
    chief_complaints: '',
    present_illness_history: '',
    past_medical_history: '',
    past_ocular_history: '',
    surgical_history: '',
    drug_history: '',
    allergy_history: '',

    // Nurse Assessment
    vitals: { bp: '', pulse: '', temp: '', spo2: '', rr: '' },
    height: '',
    weight: '',
    bmi: '',
    nursing_notes: '',
    triage_level: '',

    // Refraction
    auto_refraction: { right: { sphere: '', cylinder: '', axis: '' }, left: { sphere: '', cylinder: '', axis: '' } },
    subjective_refraction: { right: { sphere: '', cylinder: '', axis: '', add: '' }, left: { sphere: '', cylinder: '', axis: '', add: '' } },
    visual_acuity: {
      right_unaided: '', left_unaided: '',
      right_with_glasses: '', left_with_glasses: '',
      right_pinhole: '', left_pinhole: ''
    },
    prescription: {
      right: { sphere: '', cylinder: '', axis: '', add: '' },
      left: { sphere: '', cylinder: '', axis: '', add: '' },
      pd: '', lens_type: '', notes: ''
    },

    // Ophthalmic Examination
    external_exam: '',
    anterior_segment: '',
    iop: { right: '', left: '' },
    pupillary_reactions: '',
    fundus_exam: '',
    slit_lamp: '',
    imaging_reports: '',
    diagnosis: { primary: '', secondary: '' },

    // Investigations & Treatment
    investigations: [],
    medications: [],
    procedures: [],
    advice: '',
    follow_up_date: null,

    // Administrative
    consent_status: '',
    attending_nurse: '',
    attending_doctor: '',
    status: 'Open'
  });

  useEffect(() => {
    loadData();
  }, [id, bookingId]);

  const loadData = async () => {
    if (id && id !== 'new') {
      // Edit existing patient
      const patient = await getPatientById(id);
      if (patient) {
        setFormData(patient);
      }
    } else if (bookingId) {
      // Create from booking
      const booking = await getBookingById(bookingId);
      if (booking) {
        setFormData(prev => ({
          ...prev,
          booking_type: booking.booking_type,
          mr_number: booking.mr_number || '',
          patient_name: booking.patient_name,
          mobile: booking.mobile,
          reference: booking.reference,
          appointment_date: booking.appointment_date
        }));
      }
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.patient_name.trim()) {
      toast.error('Patient name is required');
      return;
    }
    if (!formData.mobile.trim()) {
      toast.error('Mobile number is required');
      return;
    }
    if (!formData.appointment_date) {
      toast.error('Appointment date is required');
      return;
    }

    setLoading(true);

    try {
      const patientData = {
        ...formData,
        id: id && id !== 'new' ? id : uuid(),
        created_at: formData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced: false
      };

      if (id && id !== 'new') {
        await updatePatientRecord(patientData.id, patientData);
      } else {
        await createPatientRecord(patientData);
      }

      toast.success('Patient record saved successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error('Failed to save patient record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this patient record?')) {
      return;
    }

    try {
      await deletePatient(id);
      toast.success('Patient record deleted');
      navigate('/admin');
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient record');
    }
  };

  const addInvestigation = () => {
    setFormData(prev => ({
      ...prev,
      investigations: [...prev.investigations, { id: uuid(), name: '', status: 'Planned', results: '' }]
    }));
  };

  const removeInvestigation = (invId) => {
    setFormData(prev => ({
      ...prev,
      investigations: prev.investigations.filter(inv => inv.id !== invId)
    }));
  };

  const updateInvestigation = (invId, field, value) => {
    setFormData(prev => ({
      ...prev,
      investigations: prev.investigations.map(inv =>
        inv.id === invId ? { ...inv, [field]: value } : inv
      )
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { id: uuid(), name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedication = (medId) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== medId)
    }));
  };

  const updateMedication = (medId, field, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map(med =>
        med.id === medId ? { ...med, [field]: value } : med
      )
    }));
  };

  const addProcedure = () => {
    setFormData(prev => ({
      ...prev,
      procedures: [...prev.procedures, { id: uuid(), name: '', status: 'Planned', notes: '' }]
    }));
  };

  const removeProcedure = (procId) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.filter(proc => proc.id !== procId)
    }));
  };

  const updateProcedure = (procId, field, value) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.map(proc =>
        proc.id === procId ? { ...proc, [field]: value } : proc
      )
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50 py-8 px-4 font-sans">
      <div className="container mx-auto max-w-[1280px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            data-testid="back-to-admin-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            {id && id !== 'new' && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                data-testid="delete-patient-button"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
              data-testid="save-patient-button"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Record'}
            </Button>
          </div>
        </div>

        <Card className="glass border-0 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-teal-500" />
          <CardHeader className="bg-white/50 border-b border-gray-100 pb-6">
            <CardTitle className="text-3xl font-heading font-bold text-gray-800">
              {id && id !== 'new' ? 'Edit Patient Record' : 'New Patient Record'}
            </CardTitle>
            <CardDescription className="text-base text-gray-500">Complete clinical documentation for ophthalmic patient</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="demographics" className="space-y-8">
              <TabsList className="bg-gray-100/50 p-1 rounded-xl w-full flex-wrap h-auto gap-2 justify-start">
                <TabsTrigger value="demographics" data-testid="tab-demographics">Demographics</TabsTrigger>
                <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
                <TabsTrigger value="nurse" data-testid="tab-nurse">Nurse</TabsTrigger>
                <TabsTrigger value="refraction" data-testid="tab-refraction">Refraction</TabsTrigger>
                <TabsTrigger value="examination" data-testid="tab-examination">Examination</TabsTrigger>
                <TabsTrigger value="investigations" data-testid="tab-investigations">Investigations</TabsTrigger>
                <TabsTrigger value="treatment" data-testid="tab-treatment">Treatment</TabsTrigger>
              </TabsList>

              {/* DEMOGRAPHICS TAB */}
              <TabsContent value="demographics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Booking Type */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Booking Type *</Label>
                    <RadioGroup
                      value={formData.booking_type}
                      onValueChange={(value) => setFormData({ ...formData, booking_type: value })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="New" id="demo-new" data-testid="demo-booking-type-new" />
                        <Label htmlFor="demo-new">New</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Old" id="demo-old" data-testid="demo-booking-type-old" />
                        <Label htmlFor="demo-old">Old</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* MR Number */}
                  <div className="space-y-2">
                    <Label htmlFor="demo-mr">MR Number</Label>
                    <Input
                      id="demo-mr"
                      value={formData.mr_number}
                      onChange={(e) => setFormData({ ...formData, mr_number: e.target.value })}
                      placeholder="Medical Record Number"
                      data-testid="demo-mr-number"
                    />
                  </div>

                  {/* Patient Name */}
                  <div className="space-y-2">
                    <Label htmlFor="demo-name">Patient Name *</Label>
                    <Input
                      id="demo-name"
                      value={formData.patient_name}
                      onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                      placeholder="Full name"
                      required
                      data-testid="demo-patient-name"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label htmlFor="demo-gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger data-testid="demo-gender-select">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label htmlFor="demo-age">Age</Label>
                    <Input
                      id="demo-age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Age in years"
                      data-testid="demo-age"
                    />
                  </div>

                  {/* DOB */}
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!formData.dob && 'text-muted-foreground'}`}
                          data-testid="demo-dob-picker"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dob ? format(new Date(formData.dob), 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.dob ? new Date(formData.dob) : null}
                          onSelect={(date) => setFormData({ ...formData, dob: date ? date.toISOString() : null })}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Mobile */}
                  <div className="space-y-2">
                    <Label htmlFor="demo-mobile">Mobile Number *</Label>
                    <Input
                      id="demo-mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="10-digit mobile"
                      required
                      data-testid="demo-mobile"
                    />
                  </div>

                  {/* Alternate Contact */}
                  <div className="space-y-2">
                    <Label htmlFor="demo-alt">Alternate Contact</Label>
                    <Input
                      id="demo-alt"
                      value={formData.alternate_contact}
                      onChange={(e) => setFormData({ ...formData, alternate_contact: e.target.value })}
                      placeholder="Alternate phone number"
                      data-testid="demo-alternate-contact"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="demo-email">Email</Label>
                    <Input
                      id="demo-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email address"
                      data-testid="demo-email"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Door No / House No"
                      value={formData.address.door_no}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, door_no: e.target.value } })}
                      data-testid="address-door"
                    />
                    <Input
                      placeholder="Street / Area"
                      value={formData.address.street}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                      data-testid="address-street"
                    />
                    <Input
                      placeholder="City"
                      value={formData.address.city}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                      data-testid="address-city"
                    />
                    <Input
                      placeholder="State"
                      value={formData.address.state}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                      data-testid="address-state"
                    />
                    <Input
                      placeholder="Pincode"
                      value={formData.address.pincode}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                      data-testid="address-pincode"
                    />
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Appointment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Appointment Date */}
                    <div className="space-y-2">
                      <Label>Appointment Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${!formData.appointment_date && 'text-muted-foreground'}`}
                            data-testid="appt-date-picker"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.appointment_date ? format(new Date(formData.appointment_date), 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.appointment_date ? new Date(formData.appointment_date) : null}
                            onSelect={(date) => setFormData({ ...formData, appointment_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Appointment Time */}
                    <div className="space-y-2">
                      <Label htmlFor="appt-time">Appointment Time</Label>
                      <Input
                        id="appt-time"
                        type="time"
                        value={formData.appointment_time}
                        onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                        data-testid="appt-time"
                      />
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                      <Label htmlFor="appt-dept">Department</Label>
                      <Input
                        id="appt-dept"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        data-testid="appt-department"
                      />
                    </div>

                    {/* Consulting Doctor */}
                    <div className="space-y-2">
                      <Label htmlFor="appt-doctor">Consulting Doctor</Label>
                      <Input
                        id="appt-doctor"
                        value={formData.consulting_doctor}
                        onChange={(e) => setFormData({ ...formData, consulting_doctor: e.target.value })}
                        placeholder="Doctor name"
                        data-testid="appt-doctor"
                      />
                    </div>

                    {/* Reference */}
                    <div className="space-y-2">
                      <Label htmlFor="appt-ref">Reference</Label>
                      <Select value={formData.reference} onValueChange={(value) => setFormData({ ...formData, reference: value })}>
                        <SelectTrigger data-testid="appt-reference">
                          <SelectValue placeholder="How did you hear?" />
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

                    {/* Visit Type */}
                    <div className="space-y-2">
                      <Label htmlFor="appt-visit">Visit Type</Label>
                      <Select value={formData.visit_type} onValueChange={(value) => setFormData({ ...formData, visit_type: value })}>
                        <SelectTrigger data-testid="appt-visit-type">
                          <SelectValue placeholder="Select visit type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Review">Review</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Post-Op">Post-Op</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Company / Insurance */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Company / Insurance (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Company Name"
                      value={formData.company_insurance.company}
                      onChange={(e) => setFormData({ ...formData, company_insurance: { ...formData.company_insurance, company: e.target.value } })}
                      data-testid="insurance-company"
                    />
                    <Input
                      placeholder="Policy Number"
                      value={formData.company_insurance.policy_number}
                      onChange={(e) => setFormData({ ...formData, company_insurance: { ...formData.company_insurance, policy_number: e.target.value } })}
                      data-testid="insurance-policy"
                    />
                    <Input
                      placeholder="TPA"
                      value={formData.company_insurance.tpa}
                      onChange={(e) => setFormData({ ...formData, company_insurance: { ...formData.company_insurance, tpa: e.target.value } })}
                      data-testid="insurance-tpa"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* HISTORY TAB */}
              <TabsContent value="history" className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="hist-chief">Chief Complaints</Label>
                    <Textarea
                      id="hist-chief"
                      rows={3}
                      value={formData.chief_complaints}
                      onChange={(e) => setFormData({ ...formData, chief_complaints: e.target.value })}
                      placeholder="Patient's main complaints"
                      data-testid="history-chief-complaints"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hist-present">Present Illness History</Label>
                    <Textarea
                      id="hist-present"
                      rows={4}
                      value={formData.present_illness_history}
                      onChange={(e) => setFormData({ ...formData, present_illness_history: e.target.value })}
                      placeholder="History of present illness"
                      data-testid="history-present-illness"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hist-medical">Past Medical History</Label>
                    <Textarea
                      id="hist-medical"
                      rows={3}
                      value={formData.past_medical_history}
                      onChange={(e) => setFormData({ ...formData, past_medical_history: e.target.value })}
                      placeholder="Diabetes, Hypertension, etc."
                      data-testid="history-past-medical"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hist-ocular">Past Ocular History</Label>
                    <Textarea
                      id="hist-ocular"
                      rows={3}
                      value={formData.past_ocular_history}
                      onChange={(e) => setFormData({ ...formData, past_ocular_history: e.target.value })}
                      placeholder="Previous eye problems"
                      data-testid="history-past-ocular"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hist-surgical">Surgical History</Label>
                    <Textarea
                      id="hist-surgical"
                      rows={2}
                      value={formData.surgical_history}
                      onChange={(e) => setFormData({ ...formData, surgical_history: e.target.value })}
                      placeholder="Previous surgeries"
                      data-testid="history-surgical"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hist-drug">Drug History</Label>
                    <Textarea
                      id="hist-drug"
                      rows={2}
                      value={formData.drug_history}
                      onChange={(e) => setFormData({ ...formData, drug_history: e.target.value })}
                      placeholder="Current medications"
                      data-testid="history-drug"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hist-allergy">Allergy History</Label>
                    <Textarea
                      id="hist-allergy"
                      rows={2}
                      value={formData.allergy_history}
                      onChange={(e) => setFormData({ ...formData, allergy_history: e.target.value })}
                      placeholder="Known allergies"
                      data-testid="history-allergy"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* NURSE ASSESSMENT TAB */}
              <TabsContent value="nurse" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Vital Signs</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nurse-bp">BP (mmHg)</Label>
                        <Input
                          id="nurse-bp"
                          placeholder="120/80"
                          value={formData.vitals.bp}
                          onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, bp: e.target.value } })}
                          data-testid="nurse-bp"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nurse-pulse">Pulse (bpm)</Label>
                        <Input
                          id="nurse-pulse"
                          placeholder="72"
                          value={formData.vitals.pulse}
                          onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, pulse: e.target.value } })}
                          data-testid="nurse-pulse"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nurse-temp">Temp (°F)</Label>
                        <Input
                          id="nurse-temp"
                          placeholder="98.6"
                          value={formData.vitals.temp}
                          onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, temp: e.target.value } })}
                          data-testid="nurse-temp"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nurse-spo2">SpO2 (%)</Label>
                        <Input
                          id="nurse-spo2"
                          placeholder="98"
                          value={formData.vitals.spo2}
                          onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, spo2: e.target.value } })}
                          data-testid="nurse-spo2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nurse-rr">RR (bpm)</Label>
                        <Input
                          id="nurse-rr"
                          placeholder="16"
                          value={formData.vitals.rr}
                          onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, rr: e.target.value } })}
                          data-testid="nurse-rr"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nurse-height">Height (cm)</Label>
                      <Input
                        id="nurse-height"
                        type="number"
                        placeholder="170"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        data-testid="nurse-height"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nurse-weight">Weight (kg)</Label>
                      <Input
                        id="nurse-weight"
                        type="number"
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        data-testid="nurse-weight"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nurse-bmi">BMI</Label>
                      <Input
                        id="nurse-bmi"
                        placeholder="24.2"
                        value={formData.bmi}
                        onChange={(e) => setFormData({ ...formData, bmi: e.target.value })}
                        data-testid="nurse-bmi"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nurse-triage">Triage Level</Label>
                    <Select value={formData.triage_level} onValueChange={(value) => setFormData({ ...formData, triage_level: value })}>
                      <SelectTrigger data-testid="nurse-triage-select">
                        <SelectValue placeholder="Select triage level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                        <SelectItem value="Non-Urgent">Non-Urgent</SelectItem>
                        <SelectItem value="Routine">Routine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nurse-notes">Nursing Notes</Label>
                    <Textarea
                      id="nurse-notes"
                      rows={4}
                      value={formData.nursing_notes}
                      onChange={(e) => setFormData({ ...formData, nursing_notes: e.target.value })}
                      placeholder="Observations and initial assessment"
                      data-testid="nurse-notes"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* REFRACTION TAB */}
              <TabsContent value="refraction" className="space-y-6">
                <Accordion type="multiple" className="w-full">
                  {/* Auto Refraction */}
                  <AccordionItem value="auto-refraction">
                    <AccordionTrigger>Auto Refraction</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold">Right Eye (OD)</h4>
                          <div className="grid grid-cols-3 gap-2">
                            <Input placeholder="Sphere" value={formData.auto_refraction.right.sphere} onChange={(e) => setFormData({ ...formData, auto_refraction: { ...formData.auto_refraction, right: { ...formData.auto_refraction.right, sphere: e.target.value } } })} data-testid="auto-ref-right-sphere" />
                            <Input placeholder="Cylinder" value={formData.auto_refraction.right.cylinder} onChange={(e) => setFormData({ ...formData, auto_refraction: { ...formData.auto_refraction, right: { ...formData.auto_refraction.right, cylinder: e.target.value } } })} data-testid="auto-ref-right-cylinder" />
                            <Input placeholder="Axis" value={formData.auto_refraction.right.axis} onChange={(e) => setFormData({ ...formData, auto_refraction: { ...formData.auto_refraction, right: { ...formData.auto_refraction.right, axis: e.target.value } } })} data-testid="auto-ref-right-axis" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold">Left Eye (OS)</h4>
                          <div className="grid grid-cols-3 gap-2">
                            <Input placeholder="Sphere" value={formData.auto_refraction.left.sphere} onChange={(e) => setFormData({ ...formData, auto_refraction: { ...formData.auto_refraction, left: { ...formData.auto_refraction.left, sphere: e.target.value } } })} data-testid="auto-ref-left-sphere" />
                            <Input placeholder="Cylinder" value={formData.auto_refraction.left.cylinder} onChange={(e) => setFormData({ ...formData, auto_refraction: { ...formData.auto_refraction, left: { ...formData.auto_refraction.left, cylinder: e.target.value } } })} data-testid="auto-ref-left-cylinder" />
                            <Input placeholder="Axis" value={formData.auto_refraction.left.axis} onChange={(e) => setFormData({ ...formData, auto_refraction: { ...formData.auto_refraction, left: { ...formData.auto_refraction.left, axis: e.target.value } } })} data-testid="auto-ref-left-axis" />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Subjective Refraction */}
                  <AccordionItem value="subjective">
                    <AccordionTrigger>Subjective Refraction</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold">Right Eye (OD)</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Sphere" value={formData.subjective_refraction.right.sphere} onChange={(e) => setFormData({ ...formData, subjective_refraction: { ...formData.subjective_refraction, right: { ...formData.subjective_refraction.right, sphere: e.target.value } } })} data-testid="subj-ref-right-sphere" />
                            <Input placeholder="Cylinder" value={formData.subjective_refraction.right.cylinder} onChange={(e) => setFormData({ ...formData, subjective_refraction: { ...formData.subjective_refraction, right: { ...formData.subjective_refraction.right, cylinder: e.target.value } } })} data-testid="subj-ref-right-cylinder" />
                            <Input placeholder="Axis" value={formData.subjective_refraction.right.axis} onChange={(e) => setFormData({ ...formData, subjective_refraction: { ...formData.subjective_refraction, right: { ...formData.subjective_refraction.right, axis: e.target.value } } })} data-testid="subj-ref-right-axis" />
                            <Input placeholder="Add" value={formData.subjective_refraction.right.add} onChange={(e) => setFormData({ ...formData, subjective_refraction: { ...formData.subjective_refraction, right: { ...formData.subjective_refraction.right, add: e.target.value } } })} data-testid="subj-ref-right-add" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold">Left Eye (OS)</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Sphere" value={formData.subjective_refraction.left.sphere} onChange={(e) => setFormData({ ...formData, subjective_refraction: { ...formData.subjective_refraction, left: { ...formData.subjective_refraction.left, sphere: e.target.value } } })} data-testid="subj-ref-left-sphere" />
                            <Input placeholder="Cylinder" value={formData.subjective_refraction.left.cylinder} onChange={(e) => setFormData({ ...formData, subjective_refraction: { ...formData.subjective_refraction, left: { ...formData.subjective_refraction.left, cylinder: e.target.value } } })} data-testid="subj-ref-left-cylinder" />
                            <Input placeholder="Axis" value={formData.subjective_refraction.left.axis} onChange={(e) => setFormData({ ...formData, subjective_refraction: { ...formData.subjective_refraction, left: { ...formData.subjective_refraction.left, axis: e.target.value } } })} data-testid="subj-ref-left-axis" />
                            <Input placeholder="Add" value={formData.subjective_refraction.left.add} onChange={(e) => setFormData({ ...formData, subjective_refraction: { ...formData.subjective_refraction, left: { ...formData.subjective_refraction.left, add: e.target.value } } })} data-testid="subj-ref-left-add" />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Visual Acuity */}
                  <AccordionItem value="va">
                    <AccordionTrigger>Visual Acuity</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Right - Unaided" value={formData.visual_acuity.right_unaided} onChange={(e) => setFormData({ ...formData, visual_acuity: { ...formData.visual_acuity, right_unaided: e.target.value } })} data-testid="va-right-unaided" />
                        <Input placeholder="Left - Unaided" value={formData.visual_acuity.left_unaided} onChange={(e) => setFormData({ ...formData, visual_acuity: { ...formData.visual_acuity, left_unaided: e.target.value } })} data-testid="va-left-unaided" />
                        <Input placeholder="Right - With Glasses" value={formData.visual_acuity.right_with_glasses} onChange={(e) => setFormData({ ...formData, visual_acuity: { ...formData.visual_acuity, right_with_glasses: e.target.value } })} data-testid="va-right-glasses" />
                        <Input placeholder="Left - With Glasses" value={formData.visual_acuity.left_with_glasses} onChange={(e) => setFormData({ ...formData, visual_acuity: { ...formData.visual_acuity, left_with_glasses: e.target.value } })} data-testid="va-left-glasses" />
                        <Input placeholder="Right - Pinhole" value={formData.visual_acuity.right_pinhole} onChange={(e) => setFormData({ ...formData, visual_acuity: { ...formData.visual_acuity, right_pinhole: e.target.value } })} data-testid="va-right-pinhole" />
                        <Input placeholder="Left - Pinhole" value={formData.visual_acuity.left_pinhole} onChange={(e) => setFormData({ ...formData, visual_acuity: { ...formData.visual_acuity, left_pinhole: e.target.value } })} data-testid="va-left-pinhole" />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Prescription */}
                  <AccordionItem value="prescription">
                    <AccordionTrigger>Final Prescription (Rx)</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold">Right Eye (OD)</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Sphere" value={formData.prescription.right.sphere} onChange={(e) => setFormData({ ...formData, prescription: { ...formData.prescription, right: { ...formData.prescription.right, sphere: e.target.value } } })} data-testid="rx-right-sphere" />
                            <Input placeholder="Cylinder" value={formData.prescription.right.cylinder} onChange={(e) => setFormData({ ...formData, prescription: { ...formData.prescription, right: { ...formData.prescription.right, cylinder: e.target.value } } })} data-testid="rx-right-cylinder" />
                            <Input placeholder="Axis" value={formData.prescription.right.axis} onChange={(e) => setFormData({ ...formData, prescription: { ...formData.prescription, right: { ...formData.prescription.right, axis: e.target.value } } })} data-testid="rx-right-axis" />
                            <Input placeholder="Add" value={formData.prescription.right.add} onChange={(e) => setFormData({ ...formData, prescription: { ...formData.prescription, right: { ...formData.prescription.right, add: e.target.value } } })} data-testid="rx-right-add" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold">Left Eye (OS)</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Sphere" value={formData.prescription.left.sphere} onChange={(e) => setFormData({ ...formData, prescription: { ...formData.prescription, left: { ...formData.prescription.left, sphere: e.target.value } } })} data-testid="rx-left-sphere" />
                            <Input placeholder="Cylinder" value={formData.prescription.left.cylinder} onChange={(e) => setFormData({ ...formData, prescription: { ...formData.prescription, left: { ...formData.prescription.left, cylinder: e.target.value } } })} data-testid="rx-left-cylinder" />
                            <Input placeholder="Axis" value={formData.prescription.left.axis} onChange={(e) => setFormData({ ...formData, prescription: { ...formData.prescription, left: { ...formData.prescription.left, axis: e.target.value } } })} data-testid="rx-left-axis" />
                            <Input placeholder="Add" value={formData.prescription.left.add} onChange={(e) => setFormData({ ...formData, prescription: { ...formData.prescription, left: { ...formData.prescription.left, add: e.target.value } } })} data-testid="rx-left-add" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input placeholder="PD (mm)" value={formData.prescription.pd} onChange={(e) => setFormData({ ...formData, prescription: { ...formData.prescription, pd: e.target.value } })} data-testid="rx-pd" />
                        <Input placeholder="Lens Type" value={formData.prescription.lens_type} onChange={(e) => setFormData({ ...formData, prescription: { ...formData.prescription, lens_type: e.target.value } })} data-testid="rx-lens-type" />
                        <Input placeholder="Special Notes" value={formData.prescription.notes} onChange={(e) => setFormData({ ...formData, prescription: { ...formData.prescription, notes: e.target.value } })} data-testid="rx-notes" />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              {/* EXAMINATION TAB */}
              <TabsContent value="examination" className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="exam-external">External Eye Examination</Label>
                    <Textarea
                      id="exam-external"
                      rows={3}
                      value={formData.external_exam}
                      onChange={(e) => setFormData({ ...formData, external_exam: e.target.value })}
                      placeholder="Lids, lashes, adnexa findings"
                      data-testid="exam-external"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exam-anterior">Anterior Segment</Label>
                    <Textarea
                      id="exam-anterior"
                      rows={3}
                      value={formData.anterior_segment}
                      onChange={(e) => setFormData({ ...formData, anterior_segment: e.target.value })}
                      placeholder="Cornea, conjunctiva, iris, lens findings"
                      data-testid="exam-anterior"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Intraocular Pressure (IOP)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Right Eye (mmHg)"
                        value={formData.iop.right}
                        onChange={(e) => setFormData({ ...formData, iop: { ...formData.iop, right: e.target.value } })}
                        data-testid="exam-iop-right"
                      />
                      <Input
                        placeholder="Left Eye (mmHg)"
                        value={formData.iop.left}
                        onChange={(e) => setFormData({ ...formData, iop: { ...formData.iop, left: e.target.value } })}
                        data-testid="exam-iop-left"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exam-pupil">Pupillary Reactions</Label>
                    <Textarea
                      id="exam-pupil"
                      rows={2}
                      value={formData.pupillary_reactions}
                      onChange={(e) => setFormData({ ...formData, pupillary_reactions: e.target.value })}
                      placeholder="Direct, consensual, RAPD"
                      data-testid="exam-pupil"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exam-fundus">Fundus Examination</Label>
                    <Textarea
                      id="exam-fundus"
                      rows={4}
                      value={formData.fundus_exam}
                      onChange={(e) => setFormData({ ...formData, fundus_exam: e.target.value })}
                      placeholder="Disc, macula, retina, vessels findings"
                      data-testid="exam-fundus"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exam-slit">Slit Lamp Findings</Label>
                    <Textarea
                      id="exam-slit"
                      rows={3}
                      value={formData.slit_lamp}
                      onChange={(e) => setFormData({ ...formData, slit_lamp: e.target.value })}
                      placeholder="Detailed slit lamp examination"
                      data-testid="exam-slit-lamp"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exam-imaging">Imaging Reports / References</Label>
                    <Textarea
                      id="exam-imaging"
                      rows={2}
                      value={formData.imaging_reports}
                      onChange={(e) => setFormData({ ...formData, imaging_reports: e.target.value })}
                      placeholder="OCT, fundus photo, ultrasound, etc."
                      data-testid="exam-imaging"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Diagnosis</Label>
                    <div className="space-y-3">
                      <Input
                        placeholder="Primary Diagnosis"
                        value={formData.diagnosis.primary}
                        onChange={(e) => setFormData({ ...formData, diagnosis: { ...formData.diagnosis, primary: e.target.value } })}
                        data-testid="exam-diagnosis-primary"
                      />
                      <Input
                        placeholder="Secondary Diagnosis"
                        value={formData.diagnosis.secondary}
                        onChange={(e) => setFormData({ ...formData, diagnosis: { ...formData.diagnosis, secondary: e.target.value } })}
                        data-testid="exam-diagnosis-secondary"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* INVESTIGATIONS TAB */}
              <TabsContent value="investigations" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Ordered Investigations</h3>
                  <Button onClick={addInvestigation} variant="outline" size="sm" data-testid="add-investigation-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Investigation
                  </Button>
                </div>

                {formData.investigations.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No investigations added</p>
                ) : (
                  <div className="space-y-4">
                    {formData.investigations.map((inv, index) => (
                      <Card key={inv.id} className="p-4">
                        <div className="flex gap-4 items-start">
                          <div className="flex-1 space-y-3">
                            <Input
                              placeholder="Investigation Name (e.g., OCT, Fundus Photo)"
                              value={inv.name}
                              onChange={(e) => updateInvestigation(inv.id, 'name', e.target.value)}
                              data-testid={`investigation-name-${index}`}
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <Select value={inv.status} onValueChange={(value) => updateInvestigation(inv.id, 'status', value)}>
                                <SelectTrigger data-testid={`investigation-status-${index}`}>
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Planned">Planned</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Results / Notes"
                                value={inv.results}
                                onChange={(e) => updateInvestigation(inv.id, 'results', e.target.value)}
                                data-testid={`investigation-results-${index}`}
                              />
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeInvestigation(inv.id)}
                            data-testid={`remove-investigation-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* TREATMENT TAB */}
              <TabsContent value="treatment" className="space-y-6">
                {/* Medications */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Medications</h3>
                    <Button onClick={addMedication} variant="outline" size="sm" data-testid="add-medication-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>

                  {formData.medications.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No medications prescribed</p>
                  ) : (
                    <div className="space-y-3">
                      {formData.medications.map((med, index) => (
                        <Card key={med.id} className="p-4">
                          <div className="flex gap-4 items-start">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <Input
                                placeholder="Medication Name"
                                value={med.name}
                                onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                                data-testid={`medication-name-${index}`}
                              />
                              <Input
                                placeholder="Dosage"
                                value={med.dosage}
                                onChange={(e) => updateMedication(med.id, 'dosage', e.target.value)}
                                data-testid={`medication-dosage-${index}`}
                              />
                              <Input
                                placeholder="Frequency"
                                value={med.frequency}
                                onChange={(e) => updateMedication(med.id, 'frequency', e.target.value)}
                                data-testid={`medication-frequency-${index}`}
                              />
                              <Input
                                placeholder="Duration"
                                value={med.duration}
                                onChange={(e) => updateMedication(med.id, 'duration', e.target.value)}
                                data-testid={`medication-duration-${index}`}
                              />
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeMedication(med.id)}
                              data-testid={`remove-medication-${index}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Procedures */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Procedures</h3>
                    <Button onClick={addProcedure} variant="outline" size="sm" data-testid="add-procedure-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Procedure
                    </Button>
                  </div>

                  {formData.procedures.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No procedures planned</p>
                  ) : (
                    <div className="space-y-3">
                      {formData.procedures.map((proc, index) => (
                        <Card key={proc.id} className="p-4">
                          <div className="flex gap-4 items-start">
                            <div className="flex-1 space-y-3">
                              <Input
                                placeholder="Procedure Name"
                                value={proc.name}
                                onChange={(e) => updateProcedure(proc.id, 'name', e.target.value)}
                                data-testid={`procedure-name-${index}`}
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <Select value={proc.status} onValueChange={(value) => updateProcedure(proc.id, 'status', value)}>
                                  <SelectTrigger data-testid={`procedure-status-${index}`}>
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Planned">Planned</SelectItem>
                                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  placeholder="Notes"
                                  value={proc.notes}
                                  onChange={(e) => updateProcedure(proc.id, 'notes', e.target.value)}
                                  data-testid={`procedure-notes-${index}`}
                                />
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeProcedure(proc.id)}
                              data-testid={`remove-procedure-${index}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Advice */}
                <div className="space-y-2">
                  <Label htmlFor="treatment-advice">Advice & Instructions</Label>
                  <Textarea
                    id="treatment-advice"
                    rows={4}
                    value={formData.advice}
                    onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
                    placeholder="Patient instructions, lifestyle advice, precautions"
                    data-testid="treatment-advice"
                  />
                </div>

                {/* Follow-up */}
                <div className="space-y-2">
                  <Label>Follow-up Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!formData.follow_up_date && 'text-muted-foreground'}`}
                        data-testid="follow-up-date-picker"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.follow_up_date ? format(new Date(formData.follow_up_date), 'PPP') : 'Pick a follow-up date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.follow_up_date ? new Date(formData.follow_up_date) : null}
                        onSelect={(date) => setFormData({ ...formData, follow_up_date: date ? date.toISOString() : null })}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Administrative */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-nurse">Attending Nurse</Label>
                    <Input
                      id="admin-nurse"
                      value={formData.attending_nurse}
                      onChange={(e) => setFormData({ ...formData, attending_nurse: e.target.value })}
                      placeholder="Nurse name"
                      data-testid="attending-nurse"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-doctor">Attending Doctor</Label>
                    <Input
                      id="admin-doctor"
                      value={formData.attending_doctor}
                      onChange={(e) => setFormData({ ...formData, attending_doctor: e.target.value })}
                      placeholder="Doctor name"
                      data-testid="attending-doctor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-consent">Consent Status</Label>
                    <Select value={formData.consent_status} onValueChange={(value) => setFormData({ ...formData, consent_status: value })}>
                      <SelectTrigger data-testid="consent-status-select">
                        <SelectValue placeholder="Select consent status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Obtained">Obtained</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Not Required">Not Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-status">Record Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger data-testid="record-status-select">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="No-show">No-show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientRecordForm;
