import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { updatePatientRecord } from '@/lib/data';
import { ArrowLeft, Glasses, Eye, FileText, ClipboardCheck, Microscope, User, Save } from 'lucide-react';

const ConsultationForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { patient } = location.state || {};
    const [loading, setLoading] = useState(false);

    // Initial State - Prefill with Patient Data if exists
    const [formData, setFormData] = useState({
        // Refraction - Prefilled from Nurse
        visual_acuity: patient?.visual_acuity || {
            right_unaided: '', left_unaided: '',
            right_with_glasses: '', left_with_glasses: '',
            right_pinhole: '', left_pinhole: ''
        },
        auto_refraction: patient?.auto_refraction || {
            right: { sphere: '', cylinder: '', axis: '' },
            left: { sphere: '', cylinder: '', axis: '' }
        },
        subjective_refraction: patient?.subjective_refraction || {
            right: { sphere: '', cylinder: '', axis: '', add: '' },
            left: { sphere: '', cylinder: '', axis: '', add: '' }
        },
        prescription: patient?.prescription || {
            right: { sphere: '', cylinder: '', axis: '', add: '' },
            left: { sphere: '', cylinder: '', axis: '', add: '' },
            pd: '', lens_type: '', notes: ''
        },

        // Examination
        external_exam: patient?.external_exam || '',
        anterior_segment: patient?.anterior_segment || '',
        iop: patient?.iop || { right: '', left: '' },
        pupillary_reactions: patient?.pupillary_reactions || '',
        fundus_exam: patient?.fundus_exam || '',
        slit_lamp: patient?.slit_lamp || '',

        // Diagnosis & Plan
        diagnosis: patient?.diagnosis || { primary: '', secondary: '' },
        medications: Array.isArray(patient?.medications)
            ? patient.medications.map(m => m.name).join('\n') // Convert objects to string for textarea
            : '',
        advice: patient?.advice || '',
        follow_up: patient?.follow_up_date || ''
    });

    if (!patient) return <div className="p-8 text-center text-red-500">Error: No patient loaded.</div>;

    // Helper for updating nested state
    const updatePath = (path, value) => {
        setFormData(prev => {
            const keys = path.split('.');
            if (keys.length === 1) return { ...prev, [keys[0]]: value };
            if (keys.length === 2) return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } };
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
            // Medication parsing (simple line split)
            const medList = formData.medications.split('\n').filter(Boolean).map(m => ({ name: m, notes: '' }));

            const updates = {
                visual_acuity: formData.visual_acuity,
                auto_refraction: formData.auto_refraction,
                subjective_refraction: formData.subjective_refraction,
                prescription: formData.prescription,

                external_exam: formData.external_exam,
                anterior_segment: formData.anterior_segment,
                iop: formData.iop,
                pupillary_reactions: formData.pupillary_reactions,
                fundus_exam: formData.fundus_exam,
                slit_lamp: formData.slit_lamp,

                diagnosis: formData.diagnosis,
                medications: medList,
                advice: formData.advice,

                follow_up_date: formData.follow_up,
                status: "Completed",
                attending_doctor: "Dr. Admin"
            };

            await updatePatientRecord(patient.id, updates);
            toast.success('Consultation complete!');
            navigate('/doctor');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 lg:p-8 font-sans">
            <div className="max-w-[1600px] mx-auto animate-fade-in">
                <Button variant="ghost" onClick={() => navigate('/doctor')} className="mb-6 hover:bg-white/50 group text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar: Patient Info & Vitals */}
                    <Card className="lg:col-span-1 h-fit glass border-0 shadow-lg sticky top-8">
                        <CardHeader className="bg-teal-50/50 border-b border-teal-100/50 pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-white p-2 rounded-full shadow-sm">
                                    <User className="w-6 h-6 text-teal-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-teal-900">{patient.patient_name}</CardTitle>
                                    <div className="text-xs font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded inline-block mt-1">MR: {patient.mr_number}</div>
                                </div>
                            </div>
                            <CardDescription className="text-xs text-center flex justify-around mt-2">
                                <span>{patient.age || 'N/A'} Yrs</span>
                                <span>{patient.gender || 'N/A'}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6 text-sm">
                            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                <Label className="text-xs text-red-500 font-bold uppercase tracking-wider">Chief Complaint</Label>
                                <p className="font-medium text-gray-800 mt-1">{patient.chief_complaints || 'None listed'}</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Vitals</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-2 rounded border border-gray-100 text-center">
                                        <div className="text-xs text-gray-400">BP</div>
                                        <div className="font-bold text-gray-700">{patient.vitals?.bp || '-'}</div>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-gray-100 text-center">
                                        <div className="text-xs text-gray-400">Pulse</div>
                                        <div className="font-bold text-gray-700">{patient.vitals?.pulse || '-'}</div>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-gray-100 text-center">
                                        <div className="text-xs text-gray-400">SpO2</div>
                                        <div className="font-bold text-gray-700">{patient.vitals?.spo2 || '-'}</div>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-gray-100 text-center">
                                        <div className="text-xs text-gray-400">BMI</div>
                                        <div className="font-bold text-gray-700">{patient.bmi || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Nursing Notes</Label>
                                <p className="text-xs text-gray-600 italic bg-gray-50 p-3 rounded border border-gray-200">{patient.nursing_notes || 'No notes'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Form */}
                    <Card className="lg:col-span-3 glass border-0 shadow-xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500" />
                        <CardHeader className="border-b border-gray-100">
                            <CardTitle className="font-heading text-2xl flex items-center gap-2">
                                <Microscope className="w-6 h-6 text-teal-600" /> Clinical Consultation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit}>
                                <Tabs defaultValue="refraction" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100/50 p-1 rounded-xl">
                                        <TabsTrigger value="refraction" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm">
                                            <Glasses className="w-4 h-4" /> Refraction
                                        </TabsTrigger>
                                        <TabsTrigger value="exam" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                                            <Eye className="w-4 h-4" /> Examination
                                        </TabsTrigger>
                                        <TabsTrigger value="plan" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">
                                            <ClipboardCheck className="w-4 h-4" /> Diagnosis & Plan
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* TAB 1: REFRACTION */}
                                    <TabsContent value="refraction" className="space-y-8 animate-fade-in">
                                        {/* Visual Acuity */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider pl-1 border-l-4 border-teal-400">Visual Acuity</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <EyeBlock side="Right (OD)"
                                                    fields={[
                                                        { label: 'Unaided', path: 'visual_acuity.right_unaided' },
                                                        { label: 'With Glasses', path: 'visual_acuity.right_with_glasses' },
                                                        { label: 'Pinhole', path: 'visual_acuity.right_pinhole' }
                                                    ]}
                                                    data={formData} update={updatePath}
                                                />
                                                <EyeBlock side="Left (OS)"
                                                    fields={[
                                                        { label: 'Unaided', path: 'visual_acuity.left_unaided' },
                                                        { label: 'With Glasses', path: 'visual_acuity.left_with_glasses' },
                                                        { label: 'Pinhole', path: 'visual_acuity.left_pinhole' }
                                                    ]}
                                                    data={formData} update={updatePath}
                                                />
                                            </div>
                                        </div>

                                        {/* Auto Refraction */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider pl-1 border-l-4 border-blue-400">Auto Refraction</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <RefractionBlock label="Right (OD)" path="auto_refraction.right" data={formData} update={updatePath} />
                                                <RefractionBlock label="Left (OS)" path="auto_refraction.left" data={formData} update={updatePath} />
                                            </div>
                                        </div>

                                        {/* Prescription */}
                                        <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100 shadow-sm space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-heading font-bold text-teal-800 flex items-center gap-2">
                                                    <FileText className="w-5 h-5" /> Final Prescription
                                                </h3>
                                                <span className="text-xs text-teal-600 bg-white px-2 py-1 rounded-full border border-teal-100">Rx</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <RefractionBlock label="Right (OD)" path="prescription.right" hasAdd data={formData} update={updatePath} />
                                                <RefractionBlock label="Left (OS)" path="prescription.left" hasAdd data={formData} update={updatePath} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6 mt-4">
                                                <div className="space-y-1.5"><Label className="text-teal-900">PD (mm)</Label><Input className="bg-white border-teal-200" value={formData.prescription.pd} onChange={e => updatePath('prescription.pd', e.target.value)} /></div>
                                                <div className="space-y-1.5"><Label className="text-teal-900">Lens Type</Label><Input className="bg-white border-teal-200" placeholder="e.g. Bifocal, Progressive" value={formData.prescription.lens_type} onChange={e => updatePath('prescription.lens_type', e.target.value)} /></div>
                                            </div>
                                            <div className="space-y-1.5 mt-4">
                                                <Label className="text-teal-900">Prescription Notes</Label>
                                                <Input className="bg-white border-teal-200" placeholder="Special instructions..." value={formData.prescription.notes} onChange={e => updatePath('prescription.notes', e.target.value)} />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* TAB 2: EXAMINATION */}
                                    <TabsContent value="exam" className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <Label className="text-indigo-600 font-bold uppercase text-xs">IOP (mmHg)</Label>
                                                <div className="flex gap-4 items-center">
                                                    <div className="flex-1 flex items-center gap-3">
                                                        <Label className="text-gray-500 w-8">OD</Label>
                                                        <Input className="text-center font-mono text-lg" placeholder="-" value={formData.iop.right} onChange={e => updatePath('iop.right', e.target.value)} />
                                                    </div>
                                                    <div className="flex-1 flex items-center gap-3">
                                                        <Label className="text-gray-500 w-8">OS</Label>
                                                        <Input className="text-center font-mono text-lg" placeholder="-" value={formData.iop.left} onChange={e => updatePath('iop.left', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>External Exam</Label>
                                                <Textarea className="bg-white/50" value={formData.external_exam} onChange={e => updatePath('external_exam', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Anterior Segment</Label>
                                                <Textarea className="bg-white/50" value={formData.anterior_segment} onChange={e => updatePath('anterior_segment', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Slit Lamp</Label>
                                                <Textarea className="bg-white/50" value={formData.slit_lamp} onChange={e => updatePath('slit_lamp', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Fundus Exam</Label>
                                                <Textarea className="bg-white/50" value={formData.fundus_exam} onChange={e => updatePath('fundus_exam', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Pupillary Reactions</Label>
                                                <Input className="bg-white/50" value={formData.pupillary_reactions} onChange={e => updatePath('pupillary_reactions', e.target.value)} />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* TAB 3: DIAGNOSIS & PLAN */}
                                    <TabsContent value="plan" className="space-y-6 animate-fade-in">
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-blue-600 font-bold">Primary Diagnosis</Label>
                                                    <Input className="h-12 text-lg" placeholder="e.g. Myopia, Cataract" value={formData.diagnosis.primary} onChange={e => updatePath('diagnosis.primary', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Secondary Diagnosis</Label>
                                                    <Input className="h-12" placeholder="Optional" value={formData.diagnosis.secondary} onChange={e => updatePath('diagnosis.secondary', e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="space-y-2 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                                <Label className="text-yellow-800 font-bold">Medications (One per line)</Label>
                                                <Textarea
                                                    rows={5}
                                                    className="bg-white font-mono text-sm leading-relaxed"
                                                    value={formData.medications}
                                                    onChange={e => updatePath('medications', e.target.value)}
                                                    placeholder="e.g. Moxifloxacin Eye Drops 1-1-1&#10;Paracetamol 500mg 1-0-1"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Advice / Instructions</Label>
                                                <Textarea className="min-h-[100px]" value={formData.advice} onChange={e => updatePath('advice', e.target.value)} />
                                            </div>

                                            <div className="space-y-2 max-w-xs">
                                                <Label>Follow Up Date</Label>
                                                <Input type="date" value={formData.follow_up} onChange={e => updatePath('follow_up', e.target.value)} />
                                            </div>

                                            <div className="pt-6 border-t border-gray-100">
                                                <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700 h-14 text-white text-lg shadow-xl hover:translate-y-[-2px] transition-all" disabled={loading}>
                                                    {loading ? 'Finalizing...' : <> <Save className="w-5 h-5 mr-2" /> Complete Consultation</>}
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// --- Subcomponents for Clean Layout ---

const EyeBlock = ({ side, fields, data, update }) => {
    const getValue = (path) => path.split('.').reduce((acc, part) => acc && acc[part], data);
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <h4 className="font-heading font-semibold text-sm mb-3 text-gray-700 border-b border-gray-50 pb-2">{side}</h4>
            <div className="space-y-3">
                {fields.map(f => (
                    <div key={f.path} className="grid grid-cols-3 items-center gap-2">
                        <Label className="text-xs font-medium text-muted-foreground col-span-1">{f.label}</Label>
                        <Input className="h-9 col-span-2 bg-gray-50/50 focus:bg-white" value={getValue(f.path)} onChange={e => update(f.path, e.target.value)} />
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
        <div className="border border-gray-100 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
            <h4 className="font-heading font-semibold text-sm mb-3 text-center text-gray-700 border-b pb-2">{label}</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                <span>Sph</span><span>Cyl</span><span>Axis</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
                <Input className="h-9 text-center bg-gray-50 focus:bg-white" placeholder="0.00" value={getValue('sphere')} onChange={e => update(`${path}.sphere`, e.target.value)} />
                <Input className="h-9 text-center bg-gray-50 focus:bg-white" placeholder="0.00" value={getValue('cylinder')} onChange={e => update(`${path}.cylinder`, e.target.value)} />
                <Input className="h-9 text-center bg-gray-50 focus:bg-white" placeholder="180" value={getValue('axis')} onChange={e => update(`${path}.axis`, e.target.value)} />
            </div>
            {hasAdd && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dashed border-gray-100">
                    <Label className="text-xs font-bold text-blue-600 whitespace-nowrap">Add</Label>
                    <Input className="h-9 w-full text-center bg-blue-50/20 focus:bg-white" placeholder="+2.00" value={getValue('add')} onChange={e => update(`${path}.add`, e.target.value)} />
                </div>
            )}
        </div>
    );
};

export default ConsultationForm;
