import axios from 'axios';
import { getSyncQueue, clearSyncQueue, getBookings, getPatients, saveBooking, savePatient } from './storage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

let syncInProgress = false;

export const isOnline = () => navigator.onLine;

export const syncData = async () => {
  if (!isOnline() || syncInProgress) {
    return { success: false, reason: syncInProgress ? 'sync_in_progress' : 'offline' };
  }

  syncInProgress = true;
  
  try {
    const queue = await getSyncQueue();
    
    if (queue.length === 0) {
      syncInProgress = false;
      return { success: true, synced: 0 };
    }

    // Process queue operations
    for (const operation of queue) {
      try {
        if (operation.type === 'create_booking') {
          await axios.post(`${API}/appointments`, operation.data);
          // Mark as synced in local storage
          const booking = { ...operation.data, synced: true };
          await saveBooking(booking);
        } else if (operation.type === 'update_booking') {
          await axios.put(`${API}/appointments/${operation.data.id}`, operation.data);
          const booking = { ...operation.data, synced: true };
          await saveBooking(booking);
        } else if (operation.type === 'create_patient') {
          await axios.post(`${API}/patients`, operation.data);
          const patient = { ...operation.data, synced: true };
          await savePatient(patient);
        } else if (operation.type === 'update_patient') {
          await axios.put(`${API}/patients/${operation.data.id}`, operation.data);
          const patient = { ...operation.data, synced: true };
          await savePatient(patient);
        }
      } catch (error) {
        console.error('Error syncing operation:', operation, error);
        // Continue with other operations even if one fails
      }
    }

    // Clear the queue after successful sync
    await clearSyncQueue();
    
    syncInProgress = false;
    return { success: true, synced: queue.length };
  } catch (error) {
    console.error('Error during sync:', error);
    syncInProgress = false;
    return { success: false, error: error.message };
  }
};

// Auto-sync when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Network online - attempting to sync...');
    syncData();
  });
}

// Periodic sync (every 30 seconds if online)
export const startPeriodicSync = () => {
  setInterval(() => {
    if (isOnline()) {
      syncData();
    }
  }, 30000);
};