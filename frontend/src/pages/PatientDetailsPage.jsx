import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Printer } from 'lucide-react';
import { format } from 'date-fns';

const PatientDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { patient } = location.state || {};

    if (!patient) {
        return <div className="p-8">Error: No patient data loaded.</div>;
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 print:bg-white print:p-0">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header - No Print */}
                <div className="flex justify-between items-center print:hidden">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button onClick={handlePrint} variant="outline">
                        <Printer className="mr-2 h-4 w-4" /> Print Record
                    </Button>
                </div>

                {/* Main Record Card */}
                <Card className="print:shadow-none print:border-none">
                    <CardHeader className="text-center border-b pb-6">
                        <div className="uppercase tracking-widest text-sm text-gray-500 mb-2">Ahalia Eye Hospital</div>
                        <CardTitle className="text-4xl text-blue-900">{patient.patient_name}</CardTitle>
                        <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600 font-mono">
                            <span>MRN: {patient.mr_number || 'N/A'}</span>
                            <span>•</span>
                            <span>{patient.age ? `${patient.age} Yrs` : 'Age N/A'} / {patient.gender || 'Gen N/A'}</span>
                            <span>•</span>
                            <span>{patient.mobile}</span>
                        </div>
                        <div className="mt-4">
                            <Badge variant={patient.status === 'Completed' ? 'default' : 'secondary'}>
                                Status: {patient.status}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-8 pt-8">

                        {/* 1. Vitals & Nurse Assessment */}
                        <section>
                            <h3 className="section-title">Nurse Assessment</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                <InfoBox label="Height" value={patient.height ? `${patient.height} cm` : '-'} />
                                <InfoBox label="Weight" value={patient.weight ? `${patient.weight} kg` : '-'} />
                                <InfoBox label="BMI" value={patient.bmi || '-'} />
                                <InfoBox label="Triage" value={patient.triage_level || '-'} />

                                <InfoBox label="BP" value={patient.vitals?.bp || '-'} />
                                <InfoBox label="Pulse" value={patient.vitals?.pulse || '-'} />
                                <InfoBox label="Temp" value={patient.vitals?.temperature || '-'} />
                                <InfoBox label="SpO2" value={patient.vitals?.spo2 || '-'} />
                            </div>
                            {patient.nursing_notes && (
                                <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                                    <span className="font-semibold text-gray-500">Notes:</span> {patient.nursing_notes}
                                </div>
                            )}
                        </section>

                        <Separator />

                        {/* 2. Complaints & History */}
                        <section>
                            <h3 className="section-title">Clinical History</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-bold">Chief Complaints</label>
                                    <p className="mt-1">{patient.chief_complaints || 'None'}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-bold">History of Present Illness</label>
                                    <p className="mt-1">{patient.present_illness_history || 'None'}</p>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* 3. Refraction */}
                        <section>
                            <h3 className="section-title">Refraction & Visual Acuity</h3>
                            {patient.visual_acuity && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold mb-2">Visual Acuity</h4>
                                    <table className="w-full text-sm border-collapse border">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="border p-2">Eye</th>
                                                <th className="border p-2">Unaided</th>
                                                <th className="border p-2">With Glasses</th>
                                                <th className="border p-2">Pinhole</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-center">
                                            <tr>
                                                <td className="border p-2 font-medium">Right (OD)</td>
                                                <td className="border p-2">{patient.visual_acuity.right_unaided || '-'}</td>
                                                <td className="border p-2">{patient.visual_acuity.right_with_glasses || '-'}</td>
                                                <td className="border p-2">{patient.visual_acuity.right_pinhole || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2 font-medium">Left (OS)</td>
                                                <td className="border p-2">{patient.visual_acuity.left_unaided || '-'}</td>
                                                <td className="border p-2">{patient.visual_acuity.left_with_glasses || '-'}</td>
                                                <td className="border p-2">{patient.visual_acuity.left_pinhole || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {patient.prescription && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Final Prescription (Rx)</h4>
                                    <table className="w-full text-sm border-collapse border">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="border p-2">Eye</th>
                                                <th className="border p-2">Sphere</th>
                                                <th className="border p-2">Cylinder</th>
                                                <th className="border p-2">Axis</th>
                                                <th className="border p-2">Add</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-center">
                                            <tr>
                                                <td className="border p-2 font-medium">Right (OD)</td>
                                                <td className="border p-2">{patient.prescription.right?.sphere || '-'}</td>
                                                <td className="border p-2">{patient.prescription.right?.cylinder || '-'}</td>
                                                <td className="border p-2">{patient.prescription.right?.axis || '-'}</td>
                                                <td className="border p-2">{patient.prescription.right?.add || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2 font-medium">Left (OS)</td>
                                                <td className="border p-2">{patient.prescription.left?.sphere || '-'}</td>
                                                <td className="border p-2">{patient.prescription.left?.cylinder || '-'}</td>
                                                <td className="border p-2">{patient.prescription.left?.axis || '-'}</td>
                                                <td className="border p-2">{patient.prescription.left?.add || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className="mt-2 text-sm grid grid-cols-2 gap-4">
                                        {patient.prescription.pd && <p><strong>PD:</strong> {patient.prescription.pd}</p>}
                                        {patient.prescription.lens_type && <p><strong>Lens Type:</strong> {patient.prescription.lens_type}</p>}
                                        {patient.prescription.notes && <p className="col-span-2"><strong>Notes:</strong> {patient.prescription.notes}</p>}
                                    </div>
                                </div>
                            )}
                        </section>

                        <Separator />

                        {/* 4. Examination */}
                        <section>
                            <h3 className="section-title">Ophthalmic Examination</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mt-3">
                                <InfoBox label="External Exam" value={patient.external_exam} fullWidth />
                                <InfoBox label="Anterior Segment" value={patient.anterior_segment} fullWidth />

                                <div>
                                    <label className="info-label">IOP (mmHg)</label>
                                    <p className="info-value">OD: {patient.iop?.right || '-'} / OS: {patient.iop?.left || '-'}</p>
                                </div>

                                <InfoBox label="Pupillary Reactions" value={patient.pupillary_reactions} />
                                <InfoBox label="Fundus Exam" value={patient.fundus_exam} fullWidth />
                                <InfoBox label="Slit Lamp" value={patient.slit_lamp} fullWidth />
                            </div>
                        </section>

                        <Separator />

                        {/* 5. Diagnosis & Plan */}
                        <section className="bg-blue-50 -mx-6 p-6 rounded-b-lg">
                            <h3 className="section-title text-blue-900">Diagnosis & Plan</h3>
                            <div className="space-y-4 mt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="info-label">Primary Diagnosis</label>
                                        <p className="text-lg font-medium">{patient.diagnosis?.primary || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="info-label">Secondary Diagnosis</label>
                                        <p className="text-lg font-medium">{patient.diagnosis?.secondary || '-'}</p>
                                    </div>
                                </div>

                                {patient.medications && patient.medications.length > 0 && (
                                    <div>
                                        <label className="info-label">Medications</label>
                                        <ul className="list-disc pl-5 mt-1">
                                            {patient.medications.map((med, i) => (
                                                <li key={i}>{med.name} - {med.dosage || med.notes}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <InfoBox label="Advice / Instructions" value={patient.advice} fullWidth />

                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-blue-200">
                                    <InfoBox label="Follow Up" value={patient.follow_up_date || 'PRN'} />
                                    <div className="text-right">
                                        <p className="font-signature text-xl">Dr. {patient.attending_doctor || 'Unknown'}</p>
                                        <p className="text-xs text-gray-500 uppercase">Consultant Ophthalmologist</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </CardContent>
                </Card>

                <div className="text-center text-xs text-gray-400 print:block hidden mt-8">
                    Generated on {format(new Date(), 'PPP')} • AFEH PWA
                </div>

            </div>
        </div>
    );
};

const InfoBox = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? 'col-span-full' : ''}>
        <label className="block text-xs uppercase text-gray-500 font-bold mb-1">{label}</label>
        <p className="text-gray-900 text-sm whitespace-pre-wrap">{value || '-'}</p>
    </div>
);

const style = document.createElement('style');
style.innerHTML = `
  .section-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }
  .info-label {
      display: block;
      font-size: 0.75rem;
      text-transform: uppercase;
      color: #6b7280;
      font-weight: 700;
      margin-bottom: 0.25rem;
  }
  .info-value {
      color: #111827;
      font-size: 0.875rem;
  }
  .font-signature {
      font-family: 'Cursive', sans-serif; 
      /* Fallback if no specific signature font loaded, usually generic cursive works for demo */
  }
`;
document.head.appendChild(style);

export default PatientDetailsPage;
