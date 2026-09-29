const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface UserProfile {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'counsellor' | 'student';
  studentId?: string;
  department?: string;
  specialization?: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface CounsellorAvailability {
  days: string[];
  timeSlots: string[];
}

export interface CounsellorProfile {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'counsellor';
  department?: string;
  specialization?: string;
  phone?: string;
  status: 'active' | 'inactive';
  bio?: string;
  officeLocation?: string;
  sessionModes?: string[];
  availability?: CounsellorAvailability;
  createdAt?: string;
}

export interface AppointmentItem {
  _id: string;
  student: string;
  studentName: string;
  studentId?: string;
  studentEmail?: string;
  counselor?: string;
  counselorName?: string;
  date: string;
  time: string;
  mode?: string;
  urgency: 'normal' | 'moderate' | 'high' | 'critical';
  concerns?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt?: string;
}

const getStoredToken = (): string | null => {
  return localStorage.getItem('uniheal_token');
};

export const setStoredAuth = (token: string, user: UserProfile) => {
  localStorage.setItem('uniheal_token', token);
  localStorage.setItem('uniheal_user', JSON.stringify(user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem('uniheal_token');
  localStorage.removeItem('uniheal_user');
};

export const getStoredUser = (): UserProfile | null => {
  const user = localStorage.getItem('uniheal_user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }

  return data;
}

export const api = {
  // Auth
  async login(credentials: { identifier?: string; email?: string; studentId?: string; password: string; role?: string }) {
    const data = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token && data.user) {
      setStoredAuth(data.token, data.user);
    }
    return data;
  },

  async getMe() {
    return fetchWithAuth('/auth/me');
  },

  logout() {
    clearStoredAuth();
  },

  // Admin User Management
  async getUsers(params?: { role?: string; search?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchWithAuth(`/admin/users${queryString}`);
  },

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'counsellor' | 'admin';
    studentId?: string;
    department?: string;
    specialization?: string;
    phone?: string;
  }) {
    return fetchWithAuth('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async updateUser(id: string, userData: Partial<UserProfile> & { password?: string }) {
    return fetchWithAuth(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async deleteUser(id: string) {
    return fetchWithAuth(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminStats() {
    return fetchWithAuth('/admin/stats');
  },

  // Appointments
  async getAppointments() {
    return fetchWithAuth('/appointments');
  },

  async createAppointment(appointmentData: {
    date: string;
    time: string;
    mode?: string;
    urgency?: string;
    concerns?: string;
    counselorId?: string;
    counselorName?: string;
  }) {
    return fetchWithAuth('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  async updateAppointmentStatus(id: string, data: { status?: string; notes?: string }) {
    return fetchWithAuth(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Counsellors Directory & Scheduling
  async getCounsellors(params?: { search?: string; department?: string; specialization?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department) query.append('department', params.department);
    if (params?.specialization) query.append('specialization', params.specialization);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchWithAuth(`/counsellors${queryString}`);
  },

  async getCounsellorById(id: string) {
    return fetchWithAuth(`/counsellors/${id}`);
  },

  async getCounsellorBookedSlots(counselorId: string, date: string) {
    return fetchWithAuth(`/counsellors/${counselorId}/booked-slots?date=${encodeURIComponent(date)}`);
  },

  async updateCounsellorSchedule(scheduleData: {
    days?: string[];
    timeSlots?: string[];
    bio?: string;
    officeLocation?: string;
    sessionModes?: string[];
    phone?: string;
    department?: string;
    specialization?: string;
  }) {
    return fetchWithAuth('/counsellors/my-schedule', {
      method: 'PATCH',
      body: JSON.stringify(scheduleData),
    });
  },
};
