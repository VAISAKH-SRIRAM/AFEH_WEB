import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchPatients } from '@/lib/data';
import { Stethoscope, LogOut, RefreshCw, User, FileText, Activity } from 'lucide-react';

const DoctorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const allPatients = await fetchPatients();
            // Show all relevant patients: Ready for Doctor OR Completed (for viewing)
            // Sorting: Ready first, then by date recent
            const filtered = allPatients.filter(p => !p.diagnosis || p.status === 'Ready for Doctor' || p.status === 'Completed');

            const sorted = filtered.sort((a, b) => {
                if (a.status === 'Ready for Doctor' && b.status !== 'Ready for Doctor') return -1;
                if (a.status !== 'Ready for Doctor' && b.status === 'Ready for Doctor') return 1;
                return new Date(b.created_at) - new Date(a.created_at);
            });

            setPatients(sorted);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            toast.error('Could not load patient list');
        } finally {
            setLoading(false);
        }
    };

    const handleConsult = (patient) => {
        navigate(`/doctor/consult/${patient.id}`, { state: { patient } });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
            {/* Top Bar */}
            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 px-8 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-600/10 p-2 rounded-lg">
                        <Stethoscope className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-heading font-bold text-gray-800">Doctor's Cabin</h1>
                        <p className="text-xs text-muted-foreground">Consultation Console</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </Button>
                    <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>
                    <div className="text-right hidden md:block mr-2">
                        <p className="text-sm font-medium text-gray-900">Dr. {user?.username}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => { logout(); navigate('/'); }}>
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6 md:p-8 animate-fade-in">
                <div className="grid gap-6">
                    <Card className="glass border-0 shadow-lg overflow-hidden">
                        <CardHeader className="bg-white/50 border-b border-gray-100 flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-teal-800">
                                <User className="w-5 h-5" />
                                Patient Queue
                            </CardTitle>
                            <Badge variant="secondary" className="bg-teal-100 text-teal-700 hover:bg-teal-200">
                                {patients.length} Active
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="text-center py-12 text-muted-foreground animate-pulse">Loading patient list...</div>
                            ) : patients.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Activity className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p>No patients waiting for consultation.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50">
                                            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                <th className="p-6">MR Number</th>
                                                <th className="p-6">Patient Details</th>
                                                <th className="p-6">Vitals Summary</th>
                                                <th className="p-6">Status</th>
                                                <th className="p-6 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {patients.map((patient) => (
                                                <tr key={patient.id} className={`hover:bg-teal-50/30 transition-colors group ${patient.status === 'Completed' ? 'opacity-60 bg-gray-50' : ''}`}>
                                                    <td className="p-6">
                                                        <div className="font-mono font-bold text-teal-700 text-sm bg-teal-50 px-2 py-1 rounded inline-block">
                                                            {patient.mr_number || 'Pending'}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="font-heading font-semibold text-gray-900">{patient.patient_name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {patient.age ? `${patient.age} Y` : 'Age N/A'} • {patient.gender || 'Gender N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="text-sm flex flex-col gap-1">
                                                            {patient.vitals?.bp && (
                                                                <span className="flex items-center gap-1 text-red-600 font-medium">
                                                                    BP: {patient.vitals.bp}
                                                                </span>
                                                            )}
                                                            {patient.vitals?.temperature && (
                                                                <span className="text-gray-600 text-xs">
                                                                    Temp: {patient.vitals.temperature}°C
                                                                </span>
                                                            )}
                                                            {(!patient.vitals?.bp && !patient.vitals?.temperature) && (
                                                                <span className="text-muted-foreground text-xs italic">No vitals recorded</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <Badge variant={patient.status === 'Completed' ? 'outline' : 'default'} className={
                                                            patient.status === 'Completed'
                                                                ? 'bg-gray-100 text-gray-500 border-gray-200'
                                                                : 'bg-green-100 text-green-700 border-green-200 animate-pulse'
                                                        }>
                                                            {patient.status || 'Ready'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        {patient.status !== 'Completed' ? (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleConsult(patient)}
                                                                className="bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all"
                                                            >
                                                                <Stethoscope className="w-4 h-4 mr-2" />
                                                                Consult
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => navigate(`/patient-details/${patient.id}`, { state: { patient } })}
                                                                className="text-gray-500 hover:text-gray-900"
                                                            >
                                                                <FileText className="w-4 h-4 mr-2" />
                                                                View Record
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
