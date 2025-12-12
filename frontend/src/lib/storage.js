import localforage from 'localforage';

// Configure localForage
localforage.config({
  name: 'ahalia-eye-hospital',
  storeName: 'hospital_data',
  description: 'Offline storage for Ahalia Eye Hospital PWA'
});

const KEYS = {
  BOOKINGS: 'bookings',
  PATIENTS: 'patients',
  SYNC_QUEUE: 'sync_queue',
  USER: 'user',
  TOKEN_COUNTER: 'token_counter'
};

// ============ BOOKINGS ============
export const saveBooking = async (booking) => {
  try {
    const bookings = await getBookings();
    const exists = bookings.find(b => b.id === booking.id);
    
    let updatedBookings;
    if (exists) {
      updatedBookings = bookings.map(b => b.id === booking.id ? booking : b);
    } else {
      updatedBookings = [...bookings, booking];
    }
    
    await localforage.setItem(KEYS.BOOKINGS, updatedBookings);
    return booking;
  } catch (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
};

export const getBookings = async () => {
  try {
    const bookings = await localforage.getItem(KEYS.BOOKINGS);
    return bookings || [];
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
};

export const getBookingById = async (id) => {
  const bookings = await getBookings();
  return bookings.find(b => b.id === id);
};

// ============ PATIENTS ============
export const savePatient = async (patient) => {
  try {
    const patients = await getPatients();
    const exists = patients.find(p => p.id === patient.id);
    
    let updatedPatients;
    if (exists) {
      updatedPatients = patients.map(p => p.id === patient.id ? patient : p);
    } else {
      updatedPatients = [...patients, patient];
    }
    
    await localforage.setItem(KEYS.PATIENTS, updatedPatients);
    return patient;
  } catch (error) {
    console.error('Error saving patient:', error);
    throw error;
  }
};

export const getPatients = async () => {
  try {
    const patients = await localforage.getItem(KEYS.PATIENTS);
    return patients || [];
  } catch (error) {
    console.error('Error getting patients:', error);
    return [];
  }
};

export const getPatientById = async (id) => {
  const patients = await getPatients();
  return patients.find(p => p.id === id);
};

export const deletePatient = async (id) => {
  try {
    const patients = await getPatients();
    const updated = patients.filter(p => p.id !== id);
    await localforage.setItem(KEYS.PATIENTS, updated);
    return true;
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};

// ============ SYNC QUEUE ============
export const addToSyncQueue = async (operation) => {
  try {
    const queue = await getSyncQueue();
    const updated = [...queue, { ...operation, timestamp: new Date().toISOString() }];
    await localforage.setItem(KEYS.SYNC_QUEUE, updated);
  } catch (error) {
    console.error('Error adding to sync queue:', error);
  }
};

export const getSyncQueue = async () => {
  try {
    const queue = await localforage.getItem(KEYS.SYNC_QUEUE);
    return queue || [];
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
};

export const clearSyncQueue = async () => {
  try {
    await localforage.setItem(KEYS.SYNC_QUEUE, []);
  } catch (error) {
    console.error('Error clearing sync queue:', error);
  }
};

// ============ USER / AUTH ============
export const saveUser = async (user) => {
  try {
    await localforage.setItem(KEYS.USER, user);
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const getUser = async () => {
  try {
    return await localforage.getItem(KEYS.USER);
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const removeUser = async () => {
  try {
    await localforage.removeItem(KEYS.USER);
  } catch (error) {
    console.error('Error removing user:', error);
  }
};

// ============ TOKEN COUNTER ============
export const getNextTokenNumber = async () => {
  try {
    const counter = await localforage.getItem(KEYS.TOKEN_COUNTER) || 1000;
    const nextCounter = counter + 1;
    await localforage.setItem(KEYS.TOKEN_COUNTER, nextCounter);
    return `T${nextCounter}`;
  } catch (error) {
    console.error('Error getting token number:', error);
    return `T${Date.now()}`;
  }
};

// ============ UTILITY ============
export const clearAllData = async () => {
  try {
    await localforage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};