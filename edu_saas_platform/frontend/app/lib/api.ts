// import { Course, Enrollment, User, LoginCredentials, RegisterData, AuthResponse, Session, Chapter } from '../types'

// const getApiBaseUrl = () => {
//   // ✅ 1. Client-Side: ALWAYS use the current browser domain.
//   // This is critical for Multi-Tenancy. 
//   // If you are on 'ruwanwella.com', requests must go to 'ruwanwella.com/api'
//   if (typeof window !== 'undefined') {
//     return window.location.origin;
//   }

//   // 2. Server-Side (SSR): Use Environment Variable (set in Docker)
//   // This is only used when Next.js fetches data on the server before rendering
//   if (process.env.NEXT_PUBLIC_API_URL) {
//       return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '');
//   }

//   // 3. Fallback for local development
//   return 'http://localhost:8000';
// };

// const API_BASE_URL = getApiBaseUrl();

// export const getMediaUrl = (path: string | null | undefined) => {
//   if (!path) return null;
//   if (path.startsWith('http')) return path;
//   const baseUrl = getApiBaseUrl();
//   const cleanPath = path.startsWith('/') ? path : `/${path}`;
//   return `${baseUrl}${cleanPath}`;
// };

// // ✅ FIX: Custom Interface to allow 'body' to be an object (any)
// // This fixes the "username does not exist in type" error
// interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
//   body?: any;
// }

// // ✅ FIX: Use ApiRequestOptions instead of RequestInit
// async function apiRequest(endpoint: string, options: ApiRequestOptions = {}) {
//   let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
//   if (!normalizedEndpoint.startsWith('/api/')) {
//     normalizedEndpoint = `/api${normalizedEndpoint}`;
//   }

//   const url = `${getApiBaseUrl()}${normalizedEndpoint}`;
//   const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

//   const headers: any = {
//     ...(token && { 'Authorization': `Bearer ${token}` }),
//     ...options.headers,
//   };

//   // Auto-set JSON content type if it's NOT FormData
//   if (options.body && !(options.body instanceof FormData)) {
//     headers['Content-Type'] = 'application/json';
//   }

//   const config: RequestInit = {
//     headers,
//     ...options as RequestInit, // Cast back to RequestInit for fetch
//   };

//   // Auto-stringify body if it's a plain object
//   if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
//     config.body = JSON.stringify(config.body);
//   }

//   try {
//     const response = await fetch(url, config);
//     if (response.status === 204) return null;

//     const responseText = await response.text();
//     let data;
//     try {
//       data = responseText ? JSON.parse(responseText) : null;
//     } catch (e) {
//       data = { detail: responseText };
//     }

//     if (!response.ok) {
//       const errorMsg = data?.detail || data?.message || JSON.stringify(data) || `HTTP Error ${response.status}`;
//       throw new Error(errorMsg);
//     }

//     return data;
//   } catch (error) {
//     console.error('API Call Error:', error);
//     throw error;
//   }
// }

// // --- Auth API ---
// export const authApi = {
//   async login(credentials: LoginCredentials) {
//     // This body object is now allowed because of ApiRequestOptions
//     const response = await apiRequest('/auth/login/', {
//       method: 'POST',
//       body: { 
//         username: credentials.email, 
//         password: credentials.password 
//       }
//     });
    
//     if (response.access && typeof window !== 'undefined') {
//       localStorage.setItem('accessToken', response.access);
//       localStorage.setItem('refreshToken', response.refresh);
//     }
//     return response;
//   },

//   async register(userData: RegisterData) {
//     return apiRequest('/auth/register/', {
//       method: 'POST',
//       body: userData
//     });
//   },

//   async getCurrentUser() {
//     return apiRequest('/auth/profile/');
//   },

//   async logout() {
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//     }
//   },
  
//   async updateProfile(data: any) {
//     return apiRequest('/auth/profile/', {
//       method: 'PATCH',
//       body: data
//     });
//   },
  
//   async profile(token: string) {
//     return this.getCurrentUser();
//   }
// };

// // --- Super Admin API ---
// export const superAdminApi = {
//   async listTenants() { return apiRequest('/auth/teachers/'); },
//   async getTenantDomains() { return apiRequest('/auth/teacher-domains/'); },
//   async createAcademy(data: any) { return authApi.register({ ...data, role: 'teacher' }); },
//   async updateTenant(id: string, data: { domain?: string, password?: string }) {
//     return apiRequest(`/auth/teacher-domains/${id}/`, { method: 'PATCH', body: data });
//   },
//   async getRevenueReport(month?: string) {
//     const query = month ? `?month=${month}` : '';
//     return apiRequest(`/auth/admin/revenue/${query}`);
//   },
//   async deleteTenant(id: string) { return apiRequest(`/tenants/${id}/`, { method: 'DELETE' }); }
// };

// // --- Courses API ---
// export const coursesApi = {
//   async list() { return apiRequest('/courses/'); },
//   async get(id: string) { return apiRequest(`/courses/${id}/`); },
//   async getMyEnrollments() { return apiRequest('/courses/enrollments/'); },
//   async checkEnrollment(courseId: string) { return apiRequest(`/courses/${courseId}/enrollment_status/`); },
//   async enroll(courseId: string) { return apiRequest(`/courses/${courseId}/enroll/`, { method: 'POST' }); },
//   async getCourseProgress(courseId: string) { return apiRequest(`/courses/${courseId}/progress/`); },
//   async getCourseChapters(courseId: string) { return apiRequest(`/courses/${courseId}/chapters/`); },
//   async getChapterSessions(chapterId: string) { return apiRequest(`/courses/chapters/${chapterId}/sessions/`); },
//   async getSession(sessionId: string) { return apiRequest(`/courses/sessions/${sessionId}/`); },
//   async markSessionComplete(sessionId: string) { return apiRequest(`/courses/sessions/${sessionId}/complete/`, { method: 'POST' }); },
//   async directEnroll(courseId: string) { return this.enroll(courseId); },
//   async quickEnroll(courseId: string) { return this.enroll(courseId); },
  
//   async updateEnrollment(id: string, data: any) {
//       return apiRequest(`/courses/enrollments/${id}/`, {
//           method: 'PATCH',
//           body: data
//       });
//   }
// };

// // --- Teacher API ---
// export const teacherApi = {
//   toFormData(data: any) {
//     const formData = new FormData();
//     Object.keys(data).forEach(key => {
//       if (data[key] !== null && data[key] !== undefined) {
//         if (key === 'file' || key === 'banner') {
//            if (data[key] instanceof File) {
//                formData.append(key, data[key]);
//            }
//         } else {
//            formData.append(key, data[key]);
//         }
//       }
//     });
//     return formData;
//   },

//   async createCourse(data: any) {
//     return apiRequest('/courses/', { 
//       method: 'POST',
//       body: this.toFormData(data)
//     });
//   },

//   async updateCourse(id: string, data: any) {
//     return apiRequest(`/courses/${id}/`, {
//       method: 'PATCH',
//       body: this.toFormData(data)
//     });
//   },

//   async deleteCourse(id: string) {
//     return apiRequest(`/courses/${id}/`, { method: 'DELETE' });
//   },

//   async createChapter(data: any) {
//     return apiRequest('/courses/chapters/', {
//       method: 'POST',
//       body: this.toFormData(data)
//     });
//   },

//   async updateChapter(id: string, data: any) {
//     return apiRequest(`/courses/chapters/${id}/`, {
//         method: 'PATCH',
//         body: this.toFormData(data)
//     });
//   },

//   async deleteChapter(id: string) {
//     return apiRequest(`/courses/chapters/${id}/`, { method: 'DELETE' });
//   },

//   async createSession(data: any) {
//     return apiRequest('/courses/sessions/', {
//       method: 'POST',
//       body: this.toFormData(data)
//     });
//   },
  
//   async updateSession(id: string, data: any) {
//      return apiRequest(`/courses/sessions/${id}/`, {
//         method: 'PATCH',
//         body: this.toFormData(data)
//      });
//   },

//   async deleteSession(id: string) {
//     return apiRequest(`/courses/sessions/${id}/`, { method: 'DELETE' });
//   },

//   async createAssignment(data: any) {
//     return apiRequest('/courses/assignments/', { method: 'POST', body: data });
//   },

//   async getStats() {
//     return apiRequest('/courses/stats/'); 
//   },

//   // Student Management
//   async getStudents() { return apiRequest('/auth/students/'); },
//   async createStudent(data: any) { return apiRequest('/auth/students/', { method: 'POST', body: data }); },
//   async updateStudent(id: string, data: any) { return apiRequest(`/auth/students/${id}/`, { method: 'PATCH', body: data }); },
//   async deleteStudent(id: string) { return apiRequest(`/auth/students/${id}/`, { method: 'DELETE' }); },
// };

// // --- Settings API ---
// export const settingsApi = {
//   async get() {
//     return apiRequest('/auth/settings/');
//   },
  
//   async update(data: any) {
//     if (data instanceof FormData) {
//        return apiRequest('/auth/settings/', { method: 'PATCH', body: data });
//     }
//     return apiRequest('/auth/settings/', { method: 'PATCH', body: data });
//   },

//   async getGallery() {
//     return apiRequest('/auth/gallery/');
//   },
//   async uploadGalleryImage(data: FormData) {
//     return apiRequest('/auth/gallery/', { method: 'POST', body: data });
//   },
//   async deleteGalleryImage(id: string) {
//     return apiRequest(`/auth/gallery/${id}/`, { method: 'DELETE' });
//   }
// };

// // --- Payments API ---
// export const paymentsApi = {
//   async startPayment(enrollmentId: string) {
//     return { payment_url: '', payment_id: '123' };
//   },
  
//   async initPayHerePayment(enrollmentId: string) {
//     return apiRequest(`/payments/init-payhere/${enrollmentId}/`, {
//       method: 'POST'
//     });
//   },

//   async initOnePayPayment(enrollmentId: string) {
//     return apiRequest(`/payments/init-onepay/${enrollmentId}/`, { method: 'POST' });
//   },

//   async uploadReceipt(enrollmentId: string, file: File) {
//     const formData = new FormData();
//     formData.append('enrollment_id', enrollmentId);
//     formData.append('receipt_image', file);
    
//     return apiRequest('/payments/upload_receipt/', {
//         method: 'POST',
//         body: formData
//     });
//   },

//   async getTeacherPayments() {
//     return apiRequest('/payments/'); 
//   },

//   async approvePayment(paymentId: string) {
//     return apiRequest(`/payments/${paymentId}/approve/`, { method: 'POST' });
//   },

//   async rejectPayment(paymentId: string) {
//     return apiRequest(`/payments/${paymentId}/reject/`, { method: 'POST' });
//   }
// };

// // --- Notifications API ---
// export const notificationsApi = {
//   async getNotifications() {
//     return apiRequest('/notifications/personal/');
//   },
  
//   async getUnread() {
//     return apiRequest('/notifications/personal/unread/');
//   },

//   async markRead(id: string) {
//     return apiRequest(`/notifications/personal/${id}/mark_read/`, { method: 'POST' });
//   },

//   async markAllRead() {
//     return apiRequest('/notifications/personal/mark_all_read/', { method: 'POST' });
//   },
  
//   async getNotices() {
//     return apiRequest('/notifications/notices/');
//   },

//   async createNotice(data: any) {
//     const formData = new FormData();
//     Object.keys(data).forEach(key => {
//         if (key === 'image' && data[key] instanceof File) {
//             formData.append(key, data[key]);
//         } else if (data[key] !== null) {
//             formData.append(key, data[key]);
//         }
//     });

//     return apiRequest('/notifications/notices/', { 
//         method: 'POST', 
//         body: formData
//     });
//   },

//   async updateNotice(id: string, data: any) {
//     const formData = new FormData();
//     Object.keys(data).forEach(key => {
//         if (key === 'image' && data[key] instanceof File) {
//              formData.append(key, data[key]);
//         } else if (data[key] !== null) {
//              formData.append(key, data[key]);
//         }
//     });
    
//     return apiRequest(`/notifications/notices/${id}/`, { 
//         method: 'PATCH', 
//         body: formData
//     });
//   },

//   async deleteNotice(id: string) {
//     return apiRequest(`/notifications/notices/${id}/`, { method: 'DELETE' });
//   }
// };


import { Course, Enrollment, User, LoginCredentials, RegisterData, AuthResponse, Session, Chapter } from '../types'

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8000`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

export const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// ✅ FIX: Create a custom interface that overrides the strict 'body' type
// This tells TypeScript: "It's okay if body is an object, we handle it."
interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
}

async function apiRequest(endpoint: string, options: ApiRequestOptions = {}) {
  let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  if (!normalizedEndpoint.startsWith('/api/')) {
    normalizedEndpoint = `/api${normalizedEndpoint}`;
  }

  const url = `${getApiBaseUrl()}${normalizedEndpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: any = {
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  // Auto-set JSON content type if it's NOT FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    headers,
    ...options as RequestInit, // Type cast back to RequestInit for fetch
  };

  // Auto-stringify body if it's a plain object
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    if (response.status === 204) return null;

    const responseText = await response.text();
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      data = { detail: responseText };
    }

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || JSON.stringify(data) || `HTTP Error ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

// --- Auth API ---
export const authApi = {
  async login(credentials: LoginCredentials) {
    const response = await apiRequest('/auth/login/', {
      method: 'POST',
      body: {
        username: credentials.email,
        password: credentials.password
      }
    });
    
    if (response.access && typeof window !== 'undefined') {
      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
    }
    return response;
  },

  async register(userData: RegisterData) {
    return apiRequest('/auth/register/', {
      method: 'POST',
      body: userData
    });
  },

  async getCurrentUser() {
    return apiRequest('/auth/profile/');
  },

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
  
  async updateProfile(data: any) {
    return apiRequest('/auth/profile/', {
      method: 'PATCH',
      body: data
    });
  },
  
  async profile(token: string) {
    return this.getCurrentUser();
  }
};

// --- Super Admin API ---
export const superAdminApi = {
  async listTenants() { return apiRequest('/auth/teachers/'); },
  async getTenantDomains() { return apiRequest('/auth/teacher-domains/'); },
  async createAcademy(data: any) { return authApi.register({ ...data, role: 'teacher' }); },
  async updateTenant(id: string, data: { domain?: string, password?: string }) {
    return apiRequest(`/auth/teacher-domains/${id}/`, { method: 'PATCH', body: data });
  },
  async getRevenueReport(month?: string) {
    const query = month ? `?month=${month}` : '';
    return apiRequest(`/auth/admin/revenue/${query}`);
  },
  async deleteTenant(id: string) { return apiRequest(`/tenants/${id}/`, { method: 'DELETE' }); }
};

// --- Courses API ---
export const coursesApi = {
  async list() { return apiRequest('/courses/'); },
  async get(id: string) { return apiRequest(`/courses/${id}/`); },
  async getMyEnrollments() { return apiRequest('/courses/enrollments/'); },
  async checkEnrollment(courseId: string) { return apiRequest(`/courses/${courseId}/enrollment_status/`); },
  async enroll(courseId: string) { return apiRequest(`/courses/${courseId}/enroll/`, { method: 'POST' }); },
  async getCourseProgress(courseId: string) { return apiRequest(`/courses/${courseId}/progress/`); },
  async getCourseChapters(courseId: string) { return apiRequest(`/courses/${courseId}/chapters/`); },
  async getChapterSessions(chapterId: string) { return apiRequest(`/courses/chapters/${chapterId}/sessions/`); },
  async getSession(sessionId: string) { return apiRequest(`/courses/sessions/${sessionId}/`); },
  async markSessionComplete(sessionId: string) { return apiRequest(`/courses/sessions/${sessionId}/complete/`, { method: 'POST' }); },
  async directEnroll(courseId: string) { return this.enroll(courseId); },
  async quickEnroll(courseId: string) { return this.enroll(courseId); },
  
  async updateEnrollment(id: string, data: any) {
      return apiRequest(`/courses/enrollments/${id}/`, {
          method: 'PATCH',
          body: data
      });
  },

    // ✅ NEW: Delete Enrollment
  async deleteEnrollment(id: string) {
    return apiRequest(`/courses/enrollments/${id}/`, {
        method: 'DELETE'
    });
  }
};

// --- Teacher API ---
export const teacherApi = {
  toFormData(data: any) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (key === 'file' || key === 'banner') {
           if (data[key] instanceof File) {
               formData.append(key, data[key]);
           }
        } else {
           formData.append(key, data[key]);
        }
      }
    });
    return formData;
  },

  async createCourse(data: any) {
    return apiRequest('/courses/', { 
      method: 'POST',
      body: this.toFormData(data)
    });
  },

  async updateCourse(id: string, data: any) {
    return apiRequest(`/courses/${id}/`, {
      method: 'PATCH',
      body: this.toFormData(data)
    });
  },

  async deleteCourse(id: string) {
    return apiRequest(`/courses/${id}/`, { method: 'DELETE' });
  },

  async createChapter(data: any) {
    return apiRequest('/courses/chapters/', {
      method: 'POST',
      body: this.toFormData(data)
    });
  },

  async updateChapter(id: string, data: any) {
    return apiRequest(`/courses/chapters/${id}/`, {
        method: 'PATCH',
        body: this.toFormData(data)
    });
  },

  async deleteChapter(id: string) {
    return apiRequest(`/courses/chapters/${id}/`, { method: 'DELETE' });
  },

  async createSession(data: any) {
    return apiRequest('/courses/sessions/', {
      method: 'POST',
      body: this.toFormData(data)
    });
  },
  
  async updateSession(id: string, data: any) {
     return apiRequest(`/courses/sessions/${id}/`, {
        method: 'PATCH',
        body: this.toFormData(data)
     });
  },

  async deleteSession(id: string) {
    return apiRequest(`/courses/sessions/${id}/`, { method: 'DELETE' });
  },

  async createAssignment(data: any) {
    return apiRequest('/courses/assignments/', { method: 'POST', body: data });
  },

  async getStats() {
    return apiRequest('/courses/stats/'); 
  },

  async createEnrollment(data: { student_id: string, course_id: string, status: string }) {
    // Fix: Map *_id fields to model field names expected by Django serializer
    const payload = {
        student: data.student_id,
        course: data.course_id,
        status: data.status
    };
    
    return apiRequest('/courses/enrollments/', {
        method: 'POST',
        body: payload
    });
  },
  // Student Management
  async getStudents() { return apiRequest('/auth/students/'); },
  async createStudent(data: any) { return apiRequest('/auth/students/', { method: 'POST', body: data }); },
  async updateStudent(id: string, data: any) { return apiRequest(`/auth/students/${id}/`, { method: 'PATCH', body: data }); },
  async deleteStudent(id: string) { return apiRequest(`/auth/students/${id}/`, { method: 'DELETE' }); },
};

// --- Settings API ---
export const settingsApi = {
  async get() {
    return apiRequest('/auth/settings/');
  },
  
  async update(data: any) {
    if (data instanceof FormData) {
       return apiRequest('/auth/settings/', { method: 'PATCH', body: data });
    }
    return apiRequest('/auth/settings/', { method: 'PATCH', body: data });
  },

  async getGallery() {
    return apiRequest('/auth/gallery/');
  },
  async uploadGalleryImage(data: FormData) {
    return apiRequest('/auth/gallery/', { method: 'POST', body: data });
  },
  async deleteGalleryImage(id: string) {
    return apiRequest(`/auth/gallery/${id}/`, { method: 'DELETE' });
  }
};

export const paymentsApi = {
  async startPayment(enrollmentId: string) {
    return { payment_url: '', payment_id: '123' };
  },
  
  // Changed enrollmentId to courseId
  async initPayHerePayment(courseId: string) {
    return apiRequest(`/payments/init-payhere/${courseId}/`, {
      method: 'POST'
    });
  },

  // Changed enrollmentId to courseId
  async initOnePayPayment(courseId: string) {
    return apiRequest(`/payments/init-onepay/${courseId}/`, { method: 'POST' });
  },

  // Changed enrollmentId to courseId
  async uploadReceipt(courseId: string, file: File) {
    const formData = new FormData();
    formData.append('course_id', courseId); // ✅ Sending course_id to backend
    formData.append('receipt_image', file);
    
    return apiRequest('/payments/upload_receipt/', {
        method: 'POST',
        body: formData
    });
  },

  async getTeacherPayments() {
    return apiRequest('/payments/'); 
  },

  async approvePayment(paymentId: string) {
    return apiRequest(`/payments/${paymentId}/approve/`, { method: 'POST' });
  },

  async rejectPayment(paymentId: string) {
    return apiRequest(`/payments/${paymentId}/reject/`, { method: 'POST' });
  }
};

// --- Notifications API ---
export const notificationsApi = {
  async getNotifications() {
    return apiRequest('/notifications/personal/');
  },
  
  async getUnread() {
    return apiRequest('/notifications/personal/unread/');
  },

  async markRead(id: string) {
    return apiRequest(`/notifications/personal/${id}/mark_read/`, { method: 'POST' });
  },

  async markAllRead() {
    return apiRequest('/notifications/personal/mark_all_read/', { method: 'POST' });
  },
  
  async getNotices() {
    return apiRequest('/notifications/notices/');
  },

  async createNotice(data: any) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (key === 'image' && data[key] instanceof File) {
            formData.append(key, data[key]);
        } else if (data[key] !== null) {
            formData.append(key, data[key]);
        }
    });

    return apiRequest('/notifications/notices/', { 
        method: 'POST', 
        body: formData
    });
  },

  async updateNotice(id: string, data: any) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (key === 'image' && data[key] instanceof File) {
             formData.append(key, data[key]);
        } else if (data[key] !== null) {
             formData.append(key, data[key]);
        }
    });
    
    return apiRequest(`/notifications/notices/${id}/`, { 
        method: 'PATCH', 
        body: formData
    });
  },

  async deleteNotice(id: string) {
    return apiRequest(`/notifications/notices/${id}/`, { method: 'DELETE' });
  }
};