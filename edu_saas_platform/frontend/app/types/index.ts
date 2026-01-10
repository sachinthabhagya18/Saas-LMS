export interface User {
  id: string
  email: string
  username: string
  role: 'student' | 'teacher' | 'admin'
  first_name?: string
  last_name?: string
  avatar?: string
  is_active?: boolean
  date_joined?: string
}

export interface UserProfile {
  address: string
  phone: string
  id: string
  email: string
  username: string
  role: 'student' | 'teacher' | 'admin'
  first_name?: string
  last_name?: string
  avatar?: string
  is_active?: boolean
  date_joined?: string
}

export type UserRole = 'student' | 'teacher' | 'admin'

export interface LoginCredentials {
  email: string
  password: string
  
}

export interface RegisterData {
  email: string
  username: string
  password: string
  first_name?: string
  last_name?: string
  role?: 'student' | 'teacher'
}

export interface AuthResponse {
  token: string
  user: User
  access: string
  refresh: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface Course {
  owner: any
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  course_type: string;
  is_free: boolean;
  published: boolean;
  created_at: string;
  enrollment_count?: number;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  course: string;
  sessions?: Session[];
}

export interface Session {
  id: string;
  title: string;
  description: string;
  media_type: string;
  video_url?: string;
  file?: string;
  order: number;
  duration_seconds?: number;
  chapter: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  price: number;
  course_type: string;
  is_free: boolean;
}

export interface ChapterFormData {
  title: string;
  order: number;
}

export interface SessionFormData {
  title: string;
  description: string;
  media_type: string;
  video_url: string;
  order: number;
  duration_seconds: number;
  chapter: string;
}

// Enrollment related interfaces
export interface Enrollment {
  requiresPayment: any
  enrollment: any
  id: string
  student: string | User
  course: string | Course
  enrolled_at: string
  expires_at?: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  amount: string
  transaction_ref?: string
  progress?: number
  last_accessed_at?: string
}

export interface EnrollmentResult {
  enrollment: Enrollment
  requiresPayment: boolean
  coursePrice?: number
  courseCurrency?: string
}

// Payment related interfaces
export interface Payment {
  id: string
  enrollment: string | Enrollment
  gateway: 'onepay' | 'stripe' | 'manual'
  amount: string
  paid_at?: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  gateway_ref?: string
  raw_response?: any
}

export interface PaymentResponse {
  payment_url: string
  payment_id: string
  checkout_url?: string
  client_secret?: string
}

// Assignment related interfaces
export interface Assignment {
  id: string
  course: string | Course
  title: string
  description: string
  created_at: string
  due_date?: string
  max_points?: number
  assignment_type?: 'file' | 'text' | 'quiz'
}

export interface Submission {
  id: string
  assignment: string | Assignment
  student: string | User
  file?: string
  text_content?: string
  submitted_at: string
  grade?: number
  feedback?: string
  graded_by?: string | User
  graded_at?: string
  status: 'submitted' | 'graded' | 'returned'
}

// Notification related interfaces
export interface Notification {
  id: string
  recipient: string | User
  title: string
  message: string
  notification_type: 'course_enrollment' | 'payment_success' | 'assignment_submitted' | 'announcement' | 'system'
  is_read: boolean
  created_at: string
  data?: any
  course?: string | Course
  enrollment?: string | Enrollment
  assignment?: string | Assignment
  submission?: string | Submission
}

// API Response interfaces
export interface ApiResponse<T> {
  data?: T
  results?: T[]
  count?: number
  next?: string
  previous?: string
  message?: string
  detail?: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Course Stats interface
export interface CourseStats {
  total: number
  online: number
  physical: number
  free: number
  enrolled: number
  completed: number
}

// Progress tracking interfaces
export interface CourseProgress {
  course_id: string
  course_title: string
  progress_percentage: number
  completed_sessions: number
  total_sessions: number
  last_accessed_at?: string
  enrollment_status: string
}

// Error handling interfaces
export interface ApiError {
  detail: string
  message?: string
  code?: string
  status?: number
  errors?: {
    [key: string]: string[]
  }
}

// Form data interfaces
// export interface CourseFormData {
//   title: string
//   description: string
//   price: number
//   currency: string
//   course_type: 'online' | 'physical'
//   is_free: boolean
//   expiry_days?: number
//   published: boolean
// }

// Search and filter interfaces
export interface CourseFilters {
  course_type?: 'online' | 'physical' | 'all'
  price_filter?: 'all' | 'free' | 'paid'
  search_query?: string
  sort_by?: 'title' | 'created_at' | 'price'
  sort_order?: 'asc' | 'desc'
}

// Dashboard interfaces
export interface StudentDashboard {
  enrolled_courses: number
  completed_courses: number
  courses_in_progress: number
  recent_enrollments: Enrollment[]
  upcoming_assignments: Assignment[]
  recent_activity: Notification[]
}

export interface TeacherDashboard {
  total_courses: number
  total_students: number
  total_earnings: number
  recent_enrollments: Enrollment[]
  pending_submissions: Submission[]
}

// Context Types
export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  enrollCourse: (courseId: string, courseData?: { price: number; is_free: boolean; currency: string }) => Promise<EnrollmentResult>
  accessToken: string | null
}

// Component Props Types
export interface CourseCardProps {
  course: Course
  onEnroll: (courseId: string, courseData?: Course) => Promise<void>
  enrollingId: string | null
}

export interface EnrollmentButtonProps {
  course: Course
  onEnroll: (courseId: string, courseData?: Course) => Promise<void>
  isEnrolling: boolean
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type Nullable<T> = T | null