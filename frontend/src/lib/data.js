import axios from 'axios';
import {
    savePatient,
    getPatients,
    saveBooking,
    getBookings,
    addToSyncQueue
} from './storage';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

// Helper to check network status
const isOnline = () => navigator.onLine;

// ============ PATIENTS ============

export const fetchPatients = async () => {
    try {
        if (isOnline()) {
            const response = await axios.get(`${API}/patients`);
            const patients = response.data;
            // Update local storage with fresh data
            await Promise.all(patients.map(p => savePatient(p)));
            return patients;
        } else {
            // Fallback to local storage
            return await getPatients();
        }
    } catch (error) {
        console.error('Error fetching patients:', error);
        // Fallback to local on error
        return await getPatients();
    }
};

export const createPatientRecord = async (patientData) => {
    // Always save local first
    const savedPatient = await savePatient(patientData);

    if (isOnline()) {
        try {
            const response = await axios.post(`${API}/patients`, patientData);
            // Update local with server response (e.g. generated MRN)
            await savePatient(response.data);
            return response.data;
        } catch (error) {
            console.error('API call failed, queuing sync:', error);
            await addToSyncQueue({ type: 'create_patient', data: patientData });
            toast.info('Saved locally. Will sync when online.');
            return savedPatient;
        }
    } else {
        await addToSyncQueue({ type: 'create_patient', data: patientData });
        toast.info('Saved locally using Offline Mode.');
        return savedPatient;
    }
};

export const updatePatientRecord = async (patientId, updates) => {
    // Get current state to merge
    const current = await getPatients();
    const patient = current.find(p => p.id === patientId);
    if (!patient) throw new Error('Patient not found locally');

    const updatedPatient = { ...patient, ...updates };
    await savePatient(updatedPatient);

    if (isOnline()) {
        try {
            await axios.put(`${API}/patients/${patientId}`, updatedPatient);
            return updatedPatient;
        } catch (error) {
            console.error('API update failed, queuing sync:', error);
            await addToSyncQueue({ type: 'update_patient', data: updatedPatient });
            toast.info('Update saved locally. Will sync when online.');
            return updatedPatient;
        }
    } else {
        await addToSyncQueue({ type: 'update_patient', data: updatedPatient });
        toast.info('Update saved locally.');
        return updatedPatient;
    }
};

// ============ APPOINTMENTS ============

// ============ APPOINTMENTS ============

export const fetchAppointments = async () => {
    try {
        if (isOnline()) {
            try {
                const response = await axios.get(`${API}/appointments`);
                const serverBookings = response.data;

                // Save server bookings to local
                await Promise.all(serverBookings.map(b => saveBooking(b)));

                // Get all local bookings to check for unsynced ones
                const allLocal = await getBookings();

                // Merge: unsynced local bookings + server bookings
                // (Assuming server is source of truth, but we don't want to lose local unsynced work)
                // A simple strategy: ID based merge.
                const serverIds = new Set(serverBookings.map(b => b.id));
                const unsyncedLocal = allLocal.filter(b => !serverIds.has(b.id));

                return [...unsyncedLocal, ...serverBookings];
            } catch (err) {
                console.error('Server fetch failed, falling back to local', err);
                return await getBookings();
            }
        } else {
            return await getBookings();
        }
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return await getBookings();
    }
};

export const createBooking = async (bookingData) => {
    // Always save local first
    const savedBooking = await saveBooking(bookingData);

    if (isOnline()) {
        try {
            const response = await axios.post(`${API}/appointments`, bookingData);
            // Update local with server response (if any extra fields added)
            // Note: Server usually assigns the canonical ID, but here we generate UUIDs client-side.
            // If backend generates a different ID, we might have specific logic. 
            // For this app, we trust client-generated UUIDs or update them.
            // Let's assume server accepts our ID.
            const serverBooking = response.data;
            await saveBooking(serverBooking);
            return serverBooking;
        } catch (error) {
            console.error('API call failed, queuing sync:', error);
            await addToSyncQueue({ type: 'create_booking', data: bookingData });
            toast.info('Booking saved locally. Will sync when online.');
            return savedBooking;
        }
    } else {
        await addToSyncQueue({ type: 'create_booking', data: bookingData });
        toast.info('Booking saved locally (Offline Mode).');
        return savedBooking;
    }
};
