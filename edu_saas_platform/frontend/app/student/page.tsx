'use client'

import Link from 'next/link'
import { useAcademy } from '../contexts/AcademyContext'
import { getMediaUrl } from '../lib/api'
import { ArrowRight, BookOpen, CheckCircle, Users, Sparkles, Target, Rocket, Zap, Star, GraduationCap } from 'lucide-react'

export default function HomePage() {
  const { settings, loading } = useAcademy()

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium animate-pulse">Loading Academy...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-5 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-5 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-100/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20 animate-pulse"></div>
        
        {/* Background Image */}
        {settings.hero_image ? (
          <div className="absolute inset-0 z-0">
            <img src={getMediaUrl(settings.hero_image) || ''} className="w-full h-full object-cover opacity-30" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] opacity-90"></div>
        )}

        <div className="container mx-auto px-4 py-40 relative z-10">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse"></div>
              <p className="text-sm font-bold text-blue-300 uppercase tracking-wider">Premium Online Education</p>
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

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-100/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 mb-6">
              <Sparkles className="text-amber-500" size={28} />
              <h2 className="text-5xl font-black text-slate-900">Why Learn With Us?</h2>
              <Sparkles className="text-amber-500" size={28} />
            </div>
            <div className="w-32 h-2 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-8"></div>
            <p className="text-slate-600 text-xl max-w-3xl mx-auto">
              Join thousands of students who have transformed their careers with our proven learning methodology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-gradient-to-br from-white to-blue-50/50 p-10 rounded-3xl shadow-2xl shadow-blue-100/50 border border-white/80 backdrop-blur-sm hover:shadow-3xl hover:shadow-blue-200/70 hover:-translate-y-3 transition-all duration-500 group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-blue-500/30">
                <BookOpen size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Expert Curriculum</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Our courses are designed by industry experts to help you master skills effectively and stay ahead in your career.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-white to-emerald-50/50 p-10 rounded-3xl shadow-2xl shadow-emerald-100/50 border border-white/80 backdrop-blur-sm hover:shadow-3xl hover:shadow-emerald-200/70 hover:-translate-y-3 transition-all duration-500 group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-emerald-500/30">
                <CheckCircle size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Practical Learning</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Gain hands-on experience with real-world projects, interactive assignments, and industry-relevant case studies.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-white to-purple-50/50 p-10 rounded-3xl shadow-2xl shadow-purple-100/50 border border-white/80 backdrop-blur-sm hover:shadow-3xl hover:shadow-purple-200/70 hover:-translate-y-3 transition-all duration-500 group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-400 flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-purple-500/30">
                <Users size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Community Support</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Join a vibrant community of learners, mentors, and experts who support each other throughout the learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>

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