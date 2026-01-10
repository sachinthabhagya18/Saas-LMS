'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { coursesApi, paymentsApi } from '../lib/api'
import { Course } from '../types'
import {
  BookOpen,
  PlayCircle,
  Video,
  FileText,
  ArrowRight,
  Search,
  Filter,
  TrendingUp,
  Bookmark,
  GraduationCap
} from 'lucide-react'

type CourseCardProps = {
  course: Course
  onEnroll: (courseId: string) => Promise<void>
  enrollingId: string | null
}

function CourseCard({ course, onEnroll, enrollingId }: CourseCardProps) {
  const lessonsCount = course.chapters?.reduce(
    (total, chapter) => total + (chapter.sessions?.length || 0),
    0
  ) ?? 0

  const priceNumber = Number(course.price)
  const priceLabel = course.is_free || priceNumber === 0
    ? 'Free'
    : `${course.currency} ${priceNumber.toLocaleString('en-US', {
      minimumFractionDigits: 0,
    })}`

  const getCourseIcon = (courseType?: string) => {
    switch (courseType) {
      case 'video':
        return <Video className="w-6 h-6 text-red-500" />
      case 'pdf':
        return <FileText className="w-6 h-6 text-blue-500" />
      case 'mixed':
        return <PlayCircle className="w-6 h-6 text-green-500" />
      default:
        return <BookOpen className="w-6 h-6 text-purple-500" />
    }
  }

  return (
    <div 
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-sm hover:shadow-xl transition-all duration-300 hover:border-blue-200 group cursor-pointer"
      onClick={() => {/* You can add view course details here */}}
    >
      <div className="flex flex-col h-full">
        {/* Course Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
            {getCourseIcon(course.course_type)}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              course.is_free 
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {course.is_free ? 'FREE' : 'PREMIUM'}
            </span>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {course.course_type?.toUpperCase() || 'COURSE'}
            </span>
          </div>
        </div>

        {/* Course Info */}
        <div className="flex-1 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3">
            {course.description}
          </p>
        </div>

        {/* Course Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BookOpen className="w-4 h-4 text-purple-500" />
              <span>{course.chapters?.length || 0} Chapters</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <PlayCircle className="w-4 h-4 text-blue-500" />
              <span>{lessonsCount} Lessons</span>
            </div>
          </div>
        </div>

        {/* Instructor & Price */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
          <div>
            <p className="text-xs text-gray-500">Instructor</p>
            <p className="text-sm font-semibold truncate">
              {/* ✅ FIXED: Added (course.owner as any) to resolve type error */}
              {typeof course.owner === 'object' && course.owner ? (course.owner as any).username : 'Instructor'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Investment</p>
            <p className="text-lg font-bold text-blue-600">{priceLabel}</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEnroll(course.id)
          }}
          disabled={enrollingId === course.id}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 group/btn disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {enrollingId === course.id ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <BookOpen className="w-5 h-5" />
              Enroll Now
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [courseTypeFilter, setCourseTypeFilter] = useState<'all' | 'online' | 'physical'>('all')
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null)

  const { user, enrollCourse } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('🔄 Starting to fetch courses...');
        const coursesData = await coursesApi.list();
        console.log('✅ Courses fetched successfully:', coursesData);

        // Handle potential paginated response
        const list = Array.isArray(coursesData) ? coursesData : (coursesData.results || []);
        setCourses(list);
      } catch (err: any) {
        console.error('💥 Error fetching courses:', err);
        setError(err.message || 'Failed to load courses. Please check if the API server is running.');
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCourseType = courseTypeFilter === 'all' || course.course_type === courseTypeFilter

      const matchesPrice = priceFilter === 'all' ? true :
        priceFilter === 'free' ? (course.is_free || Number(course.price) === 0) :
          !course.is_free && Number(course.price) > 0

      return matchesSearch && matchesCourseType && matchesPrice
    })
  }, [courses, courseTypeFilter, priceFilter, searchTerm])

  const stats = useMemo(() => ({
    total: courses.length,
    online: courses.filter(c => c.course_type === 'online').length,
    physical: courses.filter(c => c.course_type === 'physical').length,
    free: courses.filter(c => c.is_free || Number(c.price) === 0).length,
  }), [courses])

 const handleEnroll = async (courseId: string) => {
  if (!user) {
    router.push('/login')
    return
  }

  const courseData = courses.find(c => c.id === courseId)

  try {
    setEnrollingCourseId(courseId);
    console.log('🚀 Starting enrollment process for course:', courseId);

    const result = await enrollCourse(courseId);
    console.log('🎉 Enrollment result:', result);

    if (result.requiresPayment) {
      const proceed = confirm(
        `This course costs ${courseData?.currency ?? ''} ${courseData?.price ?? ''}. You will be redirected to complete the payment. Continue?`
      );
      
      if (proceed) {
        console.log('💳 Starting payment process...');
        const payment = await paymentsApi.startPayment(result.enrollment.id);
        console.log('✅ Payment initiated:', payment);
        
        if (payment.payment_url) {
          window.location.href = payment.payment_url;
        } else {
          alert('Payment gateway not available. Please try again later.');
        }
      } else {
        alert('Payment cancelled. You can complete the payment later from your dashboard.');
        router.push('/student/dashboard');
      }
    } else {
      if (result.enrollment.status === 'paid') {
        alert('You are already enrolled in this course! Redirecting to your courses...');
        router.push('/student/dashboard');
      } else {
        alert('Successfully enrolled in the course!');
        router.push('/student/dashboard');
      }
    }
    
  } catch (err: any) {
    console.error('💥 Enrollment failed:', err);
    
    if (err.message.includes('already enrolled')) {
      alert('You are already enrolled in this course!');
      router.push('/student/dashboard');
    } else {
      alert(err.message || 'Enrollment failed. Please try again.');
    }
  } finally {
    setEnrollingCourseId(null);
  }
}

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-white">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 text-red-600">⚠️</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Courses</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white shadow-sm mb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <GraduationCap className="w-4 h-4" />
              Explore Learning Programs
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Build Future-Ready Skills
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Browse curated programs crafted by industry experts. Start your learning journey today.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Courses</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.online}</div>
              <div className="text-sm text-gray-600">Online</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.physical}</div>
              <div className="text-sm text-gray-600">On-site</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.free}</div>
              <div className="text-sm text-gray-600">Free Programs</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
              />
            </div>

            {/* Course Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={courseTypeFilter}
                onChange={(e) => setCourseTypeFilter(e.target.value as 'all' | 'online' | 'physical')}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 appearance-none"
              >
                <option value="all">All Types</option>
                <option value="online">Online</option>
                <option value="physical">On-site</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 appearance-none"
              >
                <option value="all">All Pricing</option>
                <option value="free">Free Only</option>
                <option value="paid">Paid Only</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-blue-50 rounded-xl p-3">
              <Bookmark className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-600">
                {filteredCourses.length} Courses
              </span>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-sm animate-pulse"
              >
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={handleEnroll}
                  enrollingId={enrollingCourseId}
                />
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white shadow-sm">
                <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {courses.length === 0
                    ? 'No Courses Available'
                    : 'No Courses Match Your Search'
                  }
                </h3>
                <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                  {courses.length === 0
                    ? 'Check back later for new courses.'
                    : 'Try adjusting your search criteria or filters.'
                  }
                </p>
                {courses.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setCourseTypeFilter('all')
                      setPriceFilter('all')
                    }}
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}