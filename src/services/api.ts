const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new ApiError(response.status, error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Network error');
  }
}

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getProfile: () => apiRequest('/auth/profile'),
};

export const casesApi = {
  getCases: () => apiRequest('/cases'),

  createCase: (data: { issue_type: string; selected_transaction?: string }) =>
    apiRequest('/cases', { method: 'POST', body: JSON.stringify(data) }),

  getCase: (id: string) => apiRequest(`/cases/${id}`),

  updateTransaction: (id: string, transaction: string) =>
    apiRequest(`/cases/${id}/transaction`, { method: 'PATCH', body: JSON.stringify({ selected_transaction: transaction }) }),

  updateStatus: (id: string, status: string) =>
    apiRequest(`/cases/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  getEvidence: (caseId: string) => apiRequest(`/cases/${caseId}/evidence`),

  getDiagnosis: (caseId: string) => apiRequest(`/cases/${caseId}/diagnosis`),

  getTracker: (caseId: string) => apiRequest(`/cases/${caseId}/tracker`),

  updateTrackerStage: (caseId: string, stageIndex: number, completed: boolean) =>
    apiRequest(`/cases/${caseId}/tracker/${stageIndex}`, { method: 'PATCH', body: JSON.stringify({ completed }) }),
};

export const diagnosisApi = {
  generate: (data: {
    incidentType: string;
    userDescription?: string;
    transactionDetails?: string;
    evidenceSummary?: string;
  }) => apiRequest('/diagnosis', { method: 'POST', body: JSON.stringify(data) }),

  save: (caseId: string, diagnosis: any) =>
    apiRequest(`/diagnosis/${caseId}`, { method: 'POST', body: JSON.stringify(diagnosis) }),
};

export const evidenceApi = {
  upload: async (caseId: string, files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/evidence/${caseId}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new ApiError(response.status, error.error || `HTTP ${response.status}`);
    }

    return response.json();
  },

  verify: (evidenceId: string, verified: boolean) =>
    apiRequest(`/evidence/${evidenceId}/verify`, { method: 'PATCH', body: JSON.stringify({ verified }) }),
};

export { ApiError };