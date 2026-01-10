'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAcademy } from '../contexts/AcademyContext'
import { getMediaUrl } from '../lib/api'
import { Facebook, Youtube, MessageCircle, Mail, Phone, MapPin, BookOpen, ArrowRight, Send, Instagram, Twitter, Linkedin } from 'lucide-react'
import { useState } from 'react'

export default function StudentFooter() {
  const { settings, loading } = useAcademy()
  const pathname = usePathname()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const logoUrl = settings.logo ? getMediaUrl(settings.logo) : null
  // Don't show on Teacher/Admin dashboard routes
  if (pathname.startsWith('/teacher') || pathname.startsWith('/admin')) return null

  if (loading) return null

  const primaryColor = settings.primary_color || '#2563eb'
  const secondaryColor = settings.secondary_color || '#7c3aed'
  const gradient = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
  const primaryLight = `${primaryColor}15`
  const primaryMedium = `${primaryColor}30`

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Add your newsletter subscription logic here
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <footer className="bg-gradient-to-b from-slate-950 to-slate-900 text-white pt-16 pb-8">
      {/* Top Section */}
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              {settings.logo ? (
                <div className="h-12 w-12 relative">
                  <img 
                    src={logoUrl || ''} 
                    alt={settings.academy_name}
                    className="h-full w-full object-contain bg-white/5 rounded-xl p-1 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div 
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                  style={{ background: gradient }}
                >
                  {settings.academy_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span className="font-bold text-2xl block" style={{ color: primaryColor }}>
                  {settings.academy_name}
                </span>
                <span className="text-sm text-gray-400">Education Platform</span>
              </div>
            </Link>
            
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              {settings.hero_subtitle || 'Empowering students with high-quality education and expert guidance.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-xl mb-6" style={{ color: primaryColor }}>
              Quick Links
            </h3>
            <ul className="space-y-4">
              {['Home', 'Courses', 'About', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                    className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300"
                  >
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-xl mb-6" style={{ color: primaryColor }}>
              Resources
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'About Us', href: '/about' },
                { name: 'Gallery', href: '/gallery' },
                { name: 'Support', href: '/contact' },
                { name: 'FAQ', href: '/faq' },
                { name: 'Privacy Policy', href: '/privacy' },
              ].map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300"
                  >
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-xl mb-6" style={{ color: primaryColor }}>
              Contact Info
            </h3>
            <ul className="space-y-6">
              {settings.phone && (
                <li>
                  <a 
                    href={`tel:${settings.phone}`}
                    className="group flex items-start gap-4 hover:text-white transition-colors"
                  >
                    <div 
                      className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                      style={{ 
                        background: primaryLight,
                        color: primaryColor
                      }}
                    >
                      <Phone size={20} />
                    </div>
                    <div>
                      <div className="font-medium">Call Us</div>
                      <div className="text-gray-400 group-hover:text-white transition-colors">
                        {settings.phone}
                      </div>
                    </div>
                  </a>
                </li>
              )}
              
              {settings.email && (
                <li>
                  <a 
                    href={`mailto:${settings.email}`}
                    className="group flex items-start gap-4 hover:text-white transition-colors"
                  >
                    <div 
                      className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                      style={{ 
                        background: primaryLight,
                        color: primaryColor
                      }}
                    >
                      <Mail size={20} />
                    </div>
                    <div>
                      <div className="font-medium">Email Us</div>
                      <div className="text-gray-400 group-hover:text-white transition-colors">
                        {settings.email}
                      </div>
                    </div>
                  </a>
                </li>
              )}
              
              {settings.address && (
                <li>
                  <div className="group flex items-start gap-4">
                    <div 
                      className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                      style={{ 
                        background: primaryLight,
                        color: primaryColor
                      }}
                    >
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div className="font-medium">Visit Us</div>
                      <div className="text-gray-400 group-hover:text-white transition-colors">
                        {settings.address}
                      </div>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Social Links & Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-6">
              <div className="text-gray-400">Follow us:</div>
              <div className="flex gap-4">
                {settings.facebook_url && (
                  <a 
                    href={settings.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group p-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    style={{ background: primaryLight }}
                  >
                    <Facebook 
                      size={20} 
                      className="group-hover:scale-110 transition-transform duration-300"
                      style={{ color: '#1877F2' }}
                    />
                  </a>
                )}
                {settings.youtube_url && (
                  <a 
                    href={settings.youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group p-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    style={{ background: primaryLight }}
                  >
                    <Youtube 
                      size={20} 
                      className="group-hover:scale-110 transition-transform duration-300"
                      style={{ color: '#FF0000' }}
                    />
                  </a>
                )}
                {settings.whatsapp_number && (
                  <a 
                    href={`https://wa.me/${settings.whatsapp_number}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group p-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    style={{ background: primaryLight }}
                  >
                    <MessageCircle 
                      size={20} 
                      className="group-hover:scale-110 transition-transform duration-300"
                      style={{ color: '#25D366' }}
                    />
                  </a>
                )}
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} {settings.academy_name}. All rights reserved.
              </p>
              <div className="flex items-center justify-center md:justify-end gap-2 mt-2 text-gray-400 text-sm">
                <BookOpen size={14} />
                <span>Powered by <span style={{ color: primaryColor }} className="font-medium">EduSaaS</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-3 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-0 group-hover:opacity-100"
          style={{ 
            background: gradient,
            boxShadow: `0 8px 30px ${primaryColor}40`
          }}
        >
          <ArrowRight size={20} className="rotate-270 text-white" />
        </button>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .rotate-270 {
          transform: rotate(-90deg);
        }
      `}</style>
    </footer>
  )
}