import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { fetchAppointments } from '@/lib/data';
import { Stethoscope, LogOut, RefreshCw, UserCheck, Clock, Activity } from 'lucide-react';

const NurseDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await fetchAppointments();
            // Sort by time descending
            const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setAppointments(sorted);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
            toast.error('Could not load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPatient = (appointment) => {
        navigate(`/nurse/vitals/${appointment.id}`, { state: { appointment } });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Top Bar */}
            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 px-8 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-heading font-bold text-gray-800">Nurse Station</h1>
                        <p className="text-xs text-muted-foreground">Vitals & Triage</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </Button>
                    <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>
                    <div className="text-right hidden md:block mr-2">
                        <p className="text-sm font-medium text-gray-900">{user?.username}</p>
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
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-500" />
                                Today's Appointments
                            </CardTitle>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                {appointments.length} Patients
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="text-center py-12 text-muted-foreground animate-pulse">Loading appointments...</div>
                            ) : appointments.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground">
                                    <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No appointments pending triage.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50">
                                            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                <th className="p-6 cursor-help" title="Token Number">Token</th>
                                                <th className="p-6">Time</th>
                                                <th className="p-6">Patient Details</th>
                                                <th className="p-6">Type</th>
                                                <th className="p-6">Status</th>
                                                <th className="p-6 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {appointments.map((apt) => (
                                                <tr key={apt.id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="p-6">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-mono font-bold text-blue-700">
                                                            {apt.token_number}
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-sm text-gray-600">
                                                        {apt.created_at ? format(new Date(apt.created_at), 'h:mm a') : '-'}
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="font-heading font-semibold text-gray-900">{apt.patient_name}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                            <span className="inline-block w-2 h-2 rounded-full bg-gray-300"></span>
                                                            {apt.mobile}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <Badge variant={apt.booking_type === 'New' ? 'default' : 'secondary'} className={apt.booking_type === 'New' ? 'bg-blue-600' : 'bg-teal-600'}>
                                                            {apt.booking_type}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-6">
                                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 uppercase text-[10px] tracking-widest">
                                                            Pending Triage
                                                        </Badge>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleProcessPatient(apt)}
                                                            className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-sm group-hover:shadow-md"
                                                        >
                                                            <Stethoscope className="w-4 h-4 mr-2" />
                                                            Take Vitals
                                                        </Button>
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

export default NurseDashboard;
