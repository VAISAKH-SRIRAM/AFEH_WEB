import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { createPatientRecord } from '@/lib/data';
import { ArrowLeft, Save, Activity, Eye, FileText, Ruler } from 'lucide-react';

const VitalsForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { appointment } = location.state || {};

    // Combined Initial State (Vitals + Refraction)
    const [formData, setFormData] = useState({
        // Standard Vitals
        height: '',
        weight: '',
        bmi: '',
        bp_systolic: '',
        bp_diastolic: '',
        temperature: '',
        pulse: '',
        spo2: '',
        rr: '',
        triage_level: 'Non-Urgent',
        chief_complaints: '',
        history: '',
        nursing_notes: '',

        // Refraction (Moved from Doctor)
        visual_acuity: {
            right_unaided: '', left_unaided: '',
            right_with_glasses: '', left_with_glasses: '',
            right_pinhole: '', left_pinhole: ''
        },
        auto_refraction: {
            right: { sphere: '', cylinder: '', axis: '' },
            left: { sphere: '', cylinder: '', axis: '' }
        },
        subjective_refraction: { // Optional for nurse but kept if they do it
            right: { sphere: '', cylinder: '', axis: '', add: '' },
            left: { sphere: '', cylinder: '', axis: '', add: '' }
        }
    });

    const [loading, setLoading] = useState(false);

    // Auto-calculate BMI
    useEffect(() => {
        if (formData.height && formData.weight) {
            const h_m = parseFloat(formData.height) / 100;
            const w_kg = parseFloat(formData.weight);
            if (h_m > 0 && w_kg > 0) {
                setFormData(prev => ({ ...prev, bmi: (w_kg / (h_m * h_m)).toFixed(2) }));
            }
        }
    }, [formData.height, formData.weight]);

    if (!appointment) return <div className="p-8 text-center text-red-500">Error: No appointment selected.</div>;

    // Helper for nested updates
    const updatePath = (path, value) => {
        setFormData(prev => {
            const keys = path.split('.');
            if (keys.length === 1) return { ...prev, [keys[0]]: value };
            if (keys.length === 2) return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } };
            // Visual Acuity is 2 levels, Auto Refraction is 3 levels (auto_refraction.right.sphere)
            if (keys.length === 3) return {
                ...prev,
                [keys[0]]: {
                    ...prev[keys[0]],
                    [keys[1]]: { ...prev[keys[0]][keys[1]], [keys[2]]: value }
                }
            };
            return prev;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const patientRecord = {
                id: appointment.id,
                mr_number: appointment.mr_number,
                booking_type: appointment.booking_type,
                patient_name: appointment.patient_name,
                mobile: appointment.mobile,
                reference: appointment.reference,
                appointment_date: appointment.appointment_date,

                // Vitals
                height: parseFloat(formData.height) || null,
                weight: parseFloat(formData.weight) || null,
                bmi: parseFloat(formData.bmi) || null,
                vitals: {
                    bp: `${formData.bp_systolic}/${formData.bp_diastolic}`,
                    temperature: formData.temperature,
                    pulse: formData.pulse,
                    spo2: formData.spo2,
                    rr: formData.rr
                },
                triage_level: formData.triage_level,
                chief_complaints: formData.chief_complaints,
                present_illness_history: formData.history,
                nursing_notes: formData.nursing_notes,

                // Refraction (New)
                visual_acuity: formData.visual_acuity,
                auto_refraction: formData.auto_refraction,
                subjective_refraction: formData.subjective_refraction,

                status: "Ready for Doctor",
                synced: false
            };

            const result = await createPatientRecord(patientRecord);

            if (result.mr_number && result.mr_number !== appointment.mr_number) {
                toast.success(`Record created! MRN: ${result.mr_number}`);
            } else {
                toast.success('Patient record saved.');
            }

            navigate('/nurse');

        } catch (error) {
            console.error('Error saving vitals:', error);
            toast.error('Failed to save patient record.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 lg:p-8 font-sans">
            <div className="max-w-5xl mx-auto animate-fade-in">
                <Button variant="ghost" onClick={() => navigate('/nurse')} className="mb-6 hover:bg-white/50 group text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </Button>

                <Card className="glass border-0 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400" />
                    <CardHeader className="bg-white/40 pb-6 border-b border-white/20">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl font-heading font-bold text-gray-800 flex items-center gap-2">
                                    <Activity className="w-6 h-6 text-blue-600" />
                                    Nurse Assessment
                                </CardTitle>
                                <CardDescription className="text-gray-600 mt-1">
                                    Recording vitals for <span className="font-semibold text-blue-700">{appointment.patient_name}</span>
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                                    TOKEN: {appointment.token_number}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit}>
                            <Tabs defaultValue="vitals" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gray-100/50 rounded-xl">
                                    <TabsTrigger value="vitals" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 font-medium">
                                        <Ruler className="w-4 h-4 mr-2" /> Vitals & Assessment
                                    </TabsTrigger>
                                    <TabsTrigger value="refraction" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-700 font-medium">
                                        <Eye className="w-4 h-4 mr-2" /> Refraction (Optom)
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="vitals" className="space-y-8 animate-fade-in">
                                    {/* Physical Vitals */}
                                    <div className="bg-white/50 rounded-xl p-6 border border-white/50 shadow-sm space-y-4">
                                        <h3 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Activity className="w-4 h-4" /> Physical Measurements
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="space-y-2">
                                                <Label>Height (cm)</Label>
                                                <Input type="number" placeholder="0" className="bg-white" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Weight (kg)</Label>
                                                <Input type="number" placeholder="0" className="bg-white" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>BMI</Label>
                                                <Input value={formData.bmi} readOnly className="bg-gray-100 font-mono text-gray-500" tabIndex="-1" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Temp (°C)</Label>
                                                <Input placeholder="36.5" className="bg-white" value={formData.temperature} onChange={e => setFormData({ ...formData, temperature: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="space-y-2 col-span-2 md:col-span-1">
                                                <Label>BP (Sys/Dia)</Label>
                                                <div className="flex gap-2">
                                                    <Input placeholder="120" className="bg-white" value={formData.bp_systolic} onChange={e => setFormData({ ...formData, bp_systolic: e.target.value })} />
                                                    <span className="text-2xl text-gray-300">/</span>
                                                    <Input placeholder="80" className="bg-white" value={formData.bp_diastolic} onChange={e => setFormData({ ...formData, bp_diastolic: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Pulse (bpm)</Label>
                                                <Input placeholder="72" className="bg-white" value={formData.pulse} onChange={e => setFormData({ ...formData, pulse: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>SpO2 (%)</Label>
                                                <Input placeholder="98" className="bg-white" value={formData.spo2} onChange={e => setFormData({ ...formData, spo2: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>RR (/min)</Label>
                                                <Input placeholder="16" className="bg-white" value={formData.rr} onChange={e => setFormData({ ...formData, rr: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clinical Assessment */}
                                    <div className="bg-white/50 rounded-xl p-6 border border-white/50 shadow-sm space-y-4">
                                        <h3 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Clinical Details
                                        </h3>
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-2">
                                                <Label>Triage Priority</Label>
                                                <Select value={formData.triage_level} onValueChange={(val) => setFormData({ ...formData, triage_level: val })}>
                                                    <SelectTrigger className={`w-full md:w-1/3 bg-white ${formData.triage_level === 'Emergency' ? 'border-red-500 text-red-600 bg-red-50' :
                                                            formData.triage_level === 'Urgent' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' : 'border-green-500 text-green-700'
                                                        }`}>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Emergency" className="text-red-600 font-semibold">Emergency (Red)</SelectItem>
                                                        <SelectItem value="Urgent" className="text-yellow-600 font-semibold">Urgent (Yellow)</SelectItem>
                                                        <SelectItem value="Non-Urgent" className="text-green-600 font-semibold">Non-Urgent (Green)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Chief Complaints</Label>
                                                <Textarea
                                                    placeholder="Enter patient's primary complaints..."
                                                    className="bg-white min-h-[80px]"
                                                    value={formData.chief_complaints}
                                                    onChange={e => setFormData({ ...formData, chief_complaints: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label>History of Present Illness</Label>
                                                    <Textarea className="bg-white" value={formData.history} onChange={e => setFormData({ ...formData, history: e.target.value })} rows={3} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Nursing Notes</Label>
                                                    <Textarea className="bg-white" value={formData.nursing_notes} onChange={e => setFormData({ ...formData, nursing_notes: e.target.value })} rows={3} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="refraction" className="space-y-8 animate-fade-in">
                                    {/* Visual Acuity */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-teal-100 p-1.5 rounded-lg">
                                                <Eye className="w-4 h-4 text-teal-700" />
                                            </div>
                                            <h3 className="text-sm font-heading font-semibold text-gray-700 uppercase tracking-wider">Visual Acuity</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <EyeBlock side="Right (OD)"
                                                fields={[
                                                    { label: 'Unaided', path: 'visual_acuity.right_unaided' },
                                                    { label: 'With Glasses', path: 'visual_acuity.right_with_glasses' },
                                                    { label: 'Pinhole', path: 'visual_acuity.right_pinhole' }
                                                ]} data={formData} update={updatePath}
                                            />
                                            <EyeBlock side="Left (OS)"
                                                fields={[
                                                    { label: 'Unaided', path: 'visual_acuity.left_unaided' },
                                                    { label: 'With Glasses', path: 'visual_acuity.left_with_glasses' },
                                                    { label: 'Pinhole', path: 'visual_acuity.left_pinhole' }
                                                ]} data={formData} update={updatePath}
                                            />
                                        </div>
                                    </div>

                                    {/* Auto Refraction - Keep simple here */}
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-blue-100 p-1.5 rounded-lg">
                                                <Eye className="w-4 h-4 text-blue-700" />
                                            </div>
                                            <h3 className="text-sm font-heading font-semibold text-gray-700 uppercase tracking-wider">Auto Refraction (AR)</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <RefractionBlock label="Right (OD)" path="auto_refraction.right" data={formData} update={updatePath} />
                                            <RefractionBlock label="Left (OS)" path="auto_refraction.left" data={formData} update={updatePath} />
                                        </div>
                                    </div>

                                    {/* Subjective Refraction - If nurse does it */}
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-purple-100 p-1.5 rounded-lg">
                                                <Eye className="w-4 h-4 text-purple-700" />
                                            </div>
                                            <h3 className="text-sm font-heading font-semibold text-gray-700 uppercase tracking-wider">Subjective Refraction</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <RefractionBlock label="Right (OD)" path="subjective_refraction.right" hasAdd data={formData} update={updatePath} />
                                            <RefractionBlock label="Left (OS)" path="subjective_refraction.left" hasAdd data={formData} update={updatePath} />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all" disabled={loading}>
                                    {loading ? 'Saving Record...' : <><Save className="w-5 h-5 mr-2" /> Save Record & Complete Assessment</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const EyeBlock = ({ side, fields, data, update }) => {
    const getValue = (path) => path.split('.').reduce((acc, part) => acc && acc[part], data);
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <h4 className="font-heading font-bold text-sm mb-4 text-gray-700 border-b border-gray-100 pb-2">{side}</h4>
            <div className="space-y-3">
                {fields.map(f => (
                    <div key={f.path} className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-xs font-semibold text-muted-foreground col-span-1">{f.label}</Label>
                        <Input className="h-9 col-span-2 bg-gray-50/50 focus:bg-white transition-colors" value={getValue(f.path)} onChange={e => update(f.path, e.target.value)} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const RefractionBlock = ({ label, path, hasAdd = false, data, update }) => {
    const getValue = (sub) => {
        const parts = path.split('.');
        try {
            return data[parts[0]][parts[1]][sub];
        } catch (e) { return ''; }
    };
    return (
        <div className="border border-gray-100 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-400 opacity-50" />
            <h4 className="font-heading font-bold text-sm mb-4 text-center text-gray-700">{label}</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                <span>Sph</span><span>Cyl</span><span>Axis</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
                <Input className="h-9 text-center bg-gray-50 focus:bg-white" placeholder="0.00" value={getValue('sphere')} onChange={e => update(`${path}.sphere`, e.target.value)} />
                <Input className="h-9 text-center bg-gray-50 focus:bg-white" placeholder="0.00" value={getValue('cylinder')} onChange={e => update(`${path}.cylinder`, e.target.value)} />
                <Input className="h-9 text-center bg-gray-50 focus:bg-white" placeholder="180" value={getValue('axis')} onChange={e => update(`${path}.axis`, e.target.value)} />
            </div>
            {hasAdd && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-dashed border-gray-100">
                    <Label className="text-xs font-bold text-blue-600 whitespace-nowrap">ADD</Label>
                    <Input className="h-9 w-full text-center bg-blue-50/30 focus:bg-white" placeholder="+2.00" value={getValue('add')} onChange={e => update(`${path}.add`, e.target.value)} />
                </div>
            )}
        </div>
    );
};

export default VitalsForm;
