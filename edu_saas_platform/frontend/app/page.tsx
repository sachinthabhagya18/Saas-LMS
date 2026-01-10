'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useAcademy } from './contexts/AcademyContext'
import { coursesApi, settingsApi, getMediaUrl } from './lib/api' // ✅ Import settingsApi
import { 
  ArrowRight, BookOpen, CheckCircle, Users, Star, Phone, Mail, 
  MapPin, Facebook, Youtube, MessageCircle, Clock, Target, 
  Award, Zap, Sparkles, Brain, GraduationCap, PlayCircle,
  ChevronRight, Shield, Users as UsersIcon, TrendingUp, ChevronLeft, Image as ImageIcon
} from 'lucide-react'
import StudentFooter from './components/StudentFooter'

export default function HomePage() {
  const { settings, loading } = useAcademy()
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([])
  const [gallery, setGallery] = useState<any[]>([]) // ✅ Gallery State
  const [coursesLoading, setCoursesLoading] = useState(true)
  
  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0)
  const timeoutRef = useRef<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Fetch Courses AND Gallery
        const [coursesData, galleryData] = await Promise.all([
            coursesApi.list(),
            settingsApi.getGallery()
        ])

        // Process Courses
        const cList = Array.isArray(coursesData) ? coursesData : (coursesData.results || [])
        setFeaturedCourses(cList.filter((c: any) => c.published).slice(0, 3))

        // Process Gallery
        const gList = Array.isArray(galleryData) ? galleryData : (galleryData.results || [])
        setGallery(gList)

      } catch (e) {
        console.error("Failed to load content", e)
      } finally {
        setCoursesLoading(false)
      }
    }
    fetchData()
  }, [])

  // ✅ Auto-play Slider Logic
  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  useEffect(() => {
    resetTimeout()
    if (gallery.length > 0) {
        timeoutRef.current = setTimeout(() => {
            setCurrentSlide((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))
        }, 5000) // 5 Seconds per slide
    }
    return () => resetTimeout()
  }, [currentSlide, gallery.length])

  const nextSlide = () => {
      setCurrentSlide((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
      setCurrentSlide((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium animate-pulse">Loading Academy...</p>
      </div>
    </div>
  )

  const primaryColor = settings.primary_color || '#3b82f6'
  const secondaryColor = settings.secondary_color || '#8b5cf6'
  
  const gradientText = {
    backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    display: 'inline-block'
  }

  const gradientBg = {
    backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-5 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-5 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Image / Gradient */}
        {settings.hero_image ? (
          <div className="absolute inset-0 z-0">
            <img 
              src={getMediaUrl(settings.hero_image) || ''} 
              className="w-full h-full object-cover opacity-30 transform scale-105" 
              alt="Hero" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-transparent"></div>
          </div>
        ) : (
          <div 
            className="absolute inset-0 z-0 opacity-90"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, #0f172a)` 
            }}
          ></div>
        )}

        {/* Animated Elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

        <div className="container mx-auto px-6 relative z-10 py-32">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse"></div>
              <p className="text-sm font-bold text-blue-300 uppercase tracking-wider">Premium Education Platform</p>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight drop-shadow-2xl animate-slide-up">
              {settings.hero_title}
            </h1>
            <p className="text-2xl text-blue-100 mb-12 max-w-2xl leading-relaxed drop-shadow-lg">
              {settings.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link 
                href="/register" 
                className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-white to-slate-100 text-slate-900 font-black text-xl hover:shadow-2xl hover:shadow-white/30 hover:scale-105 transition-all duration-500 flex items-center justify-center gap-3 shadow-xl"
              >
                <span>Get Started Free</span>
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link 
                href="/student/courses" 
                className="group px-10 py-5 rounded-2xl border-2 border-white/40 text-white font-black text-xl hover:bg-white/10 hover:border-white/60 transition-all duration-500 flex items-center justify-center gap-3 backdrop-blur-sm"
              >
                <BookOpen size={24} />
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Students', value: '1000+', icon: UsersIcon, color: 'from-blue-500 to-cyan-400' },
              { label: 'Expert Courses', value: '50+', icon: BookOpen, color: 'from-emerald-500 to-green-400' },
              { label: 'Instructors', value: '10+', icon: GraduationCap, color: 'from-purple-500 to-pink-400' },
              { label: 'Satisfaction', value: '4.9/5', icon: Star, color: 'from-amber-500 to-orange-400' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white to-slate-50/50 p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/80 text-center hover:shadow-2xl hover:shadow-slate-300/70 hover:-translate-y-2 transition-all duration-500">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} mx-auto mb-6 flex items-center justify-center text-white shadow-lg`}>
                  <stat.icon size={32} />
                </div>
                <div className="text-4xl font-black text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED COURSES --- */}
      {featuredCourses.length > 0 && (
        <section className="py-24 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-3 mb-6">
                <Sparkles size={28} className="text-amber-500" />
                <h2 className="text-5xl font-black text-slate-900">Featured Courses</h2>
                <Sparkles size={28} className="text-amber-500" />
              </div>
              <div 
                className="w-32 h-2 mx-auto rounded-full mb-8"
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
              ></div>
              <p className="text-slate-600 text-xl max-w-3xl mx-auto">
                Handpicked courses designed to help you master in-demand skills
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
              {featuredCourses.map((course) => (
                <Link 
                  href={`/student/courses/${course.id}`} 
                  key={course.id} 
                  className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-2xl shadow-slate-200/50 border border-white/80 overflow-hidden hover:shadow-3xl hover:shadow-slate-300/70 hover:-translate-y-4 transition-all duration-500 group"
                >
                  <div className="h-56 relative overflow-hidden">
                    {course.banner ? (
                      <img 
                        src={getMediaUrl(course.banner) || ''} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                      >
                        <BookOpen size={64} className="text-white/30 group-hover:scale-125 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-slate-800 text-xs font-black border border-white/50 shadow-lg">
                      {course.course_type === 'online' ? '🌐 Online' : '📚 Physical'}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-black text-slate-900 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed line-clamp-2 mb-6">
                      {course.description}
                    </p>
                    <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                      <span className={`text-xl font-black ${course.is_free ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {course.is_free ? 'FREE' : `${course.currency} ${course.price}`}
                      </span>
                      <span className="text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-300/50 hover:scale-105 transition-all duration-300 group-hover:gap-2 flex items-center gap-1">
                        View Details <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-16">
              <Link 
                href="/student/courses" 
                className="inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-slate-50 to-white text-slate-700 font-bold hover:shadow-2xl hover:shadow-slate-300/50 hover:scale-105 transition-all border border-slate-200 hover:border-slate-300"
              >
                View All Courses <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ✅ GALLERY SLIDER SECTION */}
      {gallery.length > 0 && (
        <section className="py-24 bg-white overflow-hidden">
             <div className="container mx-auto px-6 mb-16 text-center">
                 <div className="inline-flex items-center gap-3 mb-6">
                     <ImageIcon size={28} className="text-purple-500" />
                     <h2 className="text-5xl font-black text-slate-900">Our Gallery</h2>
                     <ImageIcon size={28} className="text-purple-500" />
                 </div>
                 <div className="w-24 h-1.5 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-8"></div>
                 <p className="text-slate-600 text-xl max-w-2xl mx-auto">
                     Capture the moments and memories from {settings.academy_name}.
                 </p>
             </div>

             {/* Slider Container */}
             <div className="relative max-w-[1400px] mx-auto px-4 group">
                 
                 {/* Slide Track */}
                 <div className="overflow-hidden rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100">
                     <div 
                        className="whitespace-nowrap transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(${-currentSlide * 100}%)` }}
                     >
                         {gallery.map((img, index) => (
                             <div key={index} className="inline-block w-full h-[500px] relative bg-slate-100">
                                 <img 
                                    src={getMediaUrl(img.image) || ''} 
                                    alt={img.caption || 'Gallery Image'} 
                                    className="w-full h-full object-cover"
                                 />
                                 {/* {img.caption && (
                                     <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
                                         <p className="text-white text-2xl font-bold drop-shadow-md">{img.caption}</p>
                                     </div>
                                 )} */}
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Navigation Arrows */}
                 {gallery.length > 1 && (
                     <>
                         <button 
                            onClick={prevSlide}
                            className="absolute top-1/2 left-8 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                         >
                             <ChevronLeft size={32} />
                         </button>
                         <button 
                            onClick={nextSlide}
                            className="absolute top-1/2 right-8 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                         >
                             <ChevronRight size={32} />
                         </button>
                     </>
                 )}

                 {/* Dots */}
                 <div className="flex justify-center gap-2 mt-6">
                     {gallery.map((_, idx) => (
                         <button 
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                currentSlide === idx ? 'w-8 bg-purple-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                            }`}
                         />
                     ))}
                 </div>
             </div>
             
             <div className="text-center mt-10">
                  <Link href="/student/gallery" className="text-purple-600 font-bold hover:underline inline-flex items-center gap-1">
                      View Full Gallery <ArrowRight size={16} />
                  </Link>
             </div>
        </section>
      )}

      {/* --- WHY CHOOSE US --- */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Why Choose Us</p>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-tight">
                Why learn with <br/>
                <span 
                  className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent"
                  style={{ 
                    backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {settings.academy_name}
                </span>
                ?
              </h2>
              <p className="text-slate-600 text-xl mb-12 leading-relaxed">
                We provide a comprehensive learning experience designed to help you succeed. From expert-led courses to hands-on projects.
              </p>
              
              <div className="space-y-8">
                {[
                  { 
                    title: 'Expert Instructors', 
                    desc: 'Learn from industry professionals with real-world experience.', 
                    icon: Users,
                    color: 'from-blue-500 to-cyan-400'
                  },
                  { 
                    title: 'Flexible Learning', 
                    desc: 'Study at your own pace with lifetime access to materials.', 
                    icon: Clock,
                    color: 'from-emerald-500 to-green-400'
                  },
                  { 
                    title: 'Community Support', 
                    desc: 'Join a community of learners and get support when needed.', 
                    icon: Shield,
                    color: 'from-purple-500 to-pink-400'
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group hover:-translate-x-2 transition-transform duration-300">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <item.icon size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Feature Image / Graphic */}
            <div className="relative">
              <div 
                className="absolute -inset-6 rounded-3xl opacity-20 blur-3xl"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              ></div>
              <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-3xl overflow-hidden aspect-square border border-slate-200 shadow-2xl p-10 flex flex-col items-center justify-center text-center">
                <div className="w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-r from-slate-100 to-slate-50 flex items-center justify-center">
                  {settings.logo ? (
                    <img 
                      src={getMediaUrl(settings.logo) || ''} 
                      alt="Academy Logo" 
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <div 
                      className="w-32 h-32 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                      {settings.academy_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black text-slate-900 mb-3">100%</div>
                  <div className="text-xl text-slate-600 mb-6">Satisfaction Guarantee</div>
                  <div className="flex items-center justify-center gap-4">
                    <Star size={20} className="text-amber-500 fill-current" />
                    <Star size={20} className="text-amber-500 fill-current" />
                    <Star size={20} className="text-amber-500 fill-current" />
                    <Star size={20} className="text-amber-500 fill-current" />
                    <Star size={20} className="text-amber-500 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 bg-white">
         <div className="container mx-auto px-6">
             <div className="bg-gradient-to-br from-white to-slate-50/80 rounded-3xl shadow-2xl shadow-blue-100/30 border border-white/70 backdrop-blur-sm p-16 text-center relative overflow-hidden max-w-8xl mx-auto">
                 {/* Background Effects */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                 <div className="absolute top-10 right-10 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl"></div>
                 <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl"></div>
                 
                 <div className="relative z-10">
                    <div className="w-28 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                      <Zap size={40} className="text-blue-500" />
                    </div>
                    
                    <h2 className="text-4xl font-black text-slate-900 mb-6">Ready to Start Your Journey?</h2>
                    <p className="text-slate-600 text-xl mb-12 max-w-8xl mx-auto leading-relaxed">
                      Join thousands of students who are already learning with {settings.academy_name}.
                    </p>

                    {/* Contact Info */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-12xl mx-auto">
                      {settings.email && (
                        <div className="flex items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50/50 border border-blue-100 hover:border-blue-200 transition-all group">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white">
                            <Mail size={24} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-slate-500">Email</p>
                            <p className="font-bold text-slate-900 truncate">{settings.email}</p>
                          </div>
                        </div>
                      )}
                      {settings.phone && (
                        <div className="flex items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50/50 border border-emerald-100 hover:border-emerald-200 transition-all group">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 flex items-center justify-center text-white">
                            <Phone size={24} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-slate-500">Phone</p>
                            <p className="font-bold text-slate-900 truncate">{settings.phone}</p>
                          </div>
                        </div>
                      )}
                       {settings.address && (
                        <div className="flex items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50/50 border border-purple-100 hover:border-purple-200 transition-all group">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 flex items-center justify-center text-white">
                            <MapPin size={24} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-slate-500">Address</p>
                            <p className="font-bold text-slate-900 truncate">{settings.address.split(',')[0]}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Link 
                      href="/register" 
                      className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      style={gradientBg}
                    >
                        Join Now for Free
                    </Link>

                    {/* Social Icons */}
                    <div className="mt-10 flex justify-center gap-6">
                        {settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition"><Facebook size={24}/></a>}
                        {settings.youtube_url && <a href={settings.youtube_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-600 transition"><Youtube size={24}/></a>}
                        {settings.whatsapp_number && <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-green-500 transition"><MessageCircle size={24}/></a>}
                    </div>
                 </div>
             </div>
         </div>
      </section>

      <StudentFooter/>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }
      `}</style>
    </div>
  )
}