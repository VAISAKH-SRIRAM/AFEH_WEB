import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPatients } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, CalendarPlus, User, Smartphone, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PatientListPage = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await fetchPatients();
            setPatients(data);
            setFilteredPatients(data);
        } catch (error) {
            console.error('Error fetching patients:', error);
            toast.error('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (!query) {
            setFilteredPatients(patients);
            return;
        }

        const filtered = patients.filter(patient =>
            patient.patient_name.toLowerCase().includes(query) ||
            patient.mr_number.toLowerCase().includes(query) ||
            patient.mobile.includes(query)
        );
        setFilteredPatients(filtered);
    };

    const handleBookAppointment = (patient) => {
        navigate('/admin/book', {
            state: {
                prefillPatient: patient
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 lg:p-10 font-sans">
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Button variant="ghost" onClick={() => navigate('/admin')} className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground group mb-2">
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                        </Button>
                        <h1 className="text-4xl font-heading font-bold text-gray-900 tracking-tight">Patient Records</h1>
                        <p className="text-gray-500 mt-2">View and manage all registered patient records.</p>
                    </div>
                </div>

                <Card className="glass border-0 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                    <CardHeader className="bg-white/50 border-b border-gray-100 pb-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2.5 rounded-xl">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-gray-800">All Patients</CardTitle>
                                    <CardDescription>Total Records: {patients.length}</CardDescription>
                                </div>
                            </div>
                            <div className="relative w-full md:w-96 group">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <Input
                                    placeholder="Search by Name, MRN, or Mobile..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all rounded-xl shadow-sm"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                                <p>Loading patient records...</p>
                            </div>
                        ) : filteredPatients.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50/50">
                                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">No patients found</h3>
                                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                                    {searchQuery ? `No matches found for "${searchQuery}"` : "Get started by adding a new patient."}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50/80">
                                        <TableRow className="hover:bg-gray-50/80 border-b border-gray-100">
                                            <TableHead className="font-bold text-gray-600 uppercase text-xs tracking-wider py-5 pl-6">MR Number</TableHead>
                                            <TableHead className="font-bold text-gray-600 uppercase text-xs tracking-wider py-5">Patient Name</TableHead>
                                            <TableHead className="font-bold text-gray-600 uppercase text-xs tracking-wider py-5">Mobile</TableHead>
                                            <TableHead className="font-bold text-gray-600 uppercase text-xs tracking-wider py-5 text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPatients.map((patient) => (
                                            <TableRow key={patient.id} className="group hover:bg-blue-50/50 transition-colors border-b border-gray-50">
                                                <TableCell className="font-mono font-medium text-blue-600 py-4 pl-6">
                                                    <span className="bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                                        {patient.mr_number}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-medium text-gray-900 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {patient.patient_name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-600 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Smartphone className="w-4 h-4 text-gray-400" />
                                                        {patient.mobile}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right py-4 pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Future: View Record Buttom */}
                                                        {/* <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 text-gray-500">
                                                            <FileText className="w-4 h-4" />
                                                        </Button> */}
                                                        <Button
                                                            size="sm"
                                                            className="bg-white border text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm rounded-lg"
                                                            onClick={() => handleBookAppointment(patient)}
                                                        >
                                                            <CalendarPlus className="w-4 h-4 mr-2" />
                                                            Book Appt
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PatientListPage;
