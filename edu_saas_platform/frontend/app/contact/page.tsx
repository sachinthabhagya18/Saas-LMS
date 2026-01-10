'use client'

import Footer from '../components/Footer'
import { useAcademy } from '../contexts/AcademyContext'
import { Mail, Phone, MapPin, Facebook, Youtube, MessageCircle, Send, User, MessageSquare, Clock, Headphones } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const { settings, loading } = useAcademy()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading contact information...</p>
      </div>
    </div>
  )

  const primaryColor = settings.primary_color || '#2563eb'
  const secondaryColor = settings.secondary_color || '#7c3aed'
  const gradient = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
  const primaryLight = `${primaryColor}10`
  const primaryMedium = `${primaryColor}30`

  // CSS Variables for dynamic colors
  const formStyles = {
    '--primary': primaryColor,
  } as React.CSSProperties

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      alert('Message sent successfully!')
      setFormData({ name: '', email: '', phone: '', message: '' })
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    // ✅ Applied formStyles here so --primary variable works
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50" style={formStyles}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ background: gradient }}
        ></div>
        
        <div className="container mx-auto px-6 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: primaryLight, color: primaryColor }}
            >
              <MessageSquare size={16} />
              <span className="text-sm font-medium">Get in Touch</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Let's{' '}
              <span 
                className="bg-clip-text text-transparent"
                style={{ 
                  background: gradient,
                  WebkitBackgroundClip: 'text'
                }}
              >
                Connect
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions or need assistance? Our team is here to help you with everything.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 mt-10">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* Left Column - Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <p className="text-gray-600">
                  Reach out to us for course inquiries, enrollment assistance, or technical support.
                  We're here to help you succeed in your learning journey.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                {settings.email && (
                  <div 
                    className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
                    style={{ background: primaryLight }}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                        style={{ 
                          background: gradient,
                          color: 'white'
                        }}
                      >
                        <Mail size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">Email Address</h3>
                        <a 
                          href={`mailto:${settings.email}`}
                          className="text-lg font-medium hover:underline transition-all"
                          style={{ color: primaryColor }}
                        >
                          {settings.email}
                        </a>
                        <p className="text-sm text-gray-500 mt-2">Typically respond within 24 hours</p>
                      </div>
                    </div>
                  </div>
                )}

                {settings.phone && (
                  <div 
                    className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
                    style={{ background: primaryLight }}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                        style={{ 
                          background: gradient,
                          color: 'white'
                        }}
                      >
                        <Phone size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">Phone Number</h3>
                        <a 
                          href={`tel:${settings.phone}`}
                          className="text-lg font-medium hover:underline transition-all"
                          style={{ color: primaryColor }}
                        >
                          {settings.phone}
                        </a>
                        <p className="text-sm text-gray-500 mt-2">Monday - Friday, 9AM - 6PM</p>
                      </div>
                    </div>
                  </div>
                )}

                {settings.address && (
                  <div 
                    className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
                    style={{ background: primaryLight }}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                        style={{ 
                          background: gradient,
                          color: 'white'
                        }}
                      >
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">Visit Us</h3>
                        <p className="text-lg font-medium" style={{ color: primaryColor }}>
                          {settings.address}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Schedule a visit for consultation</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="pt-8 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 text-xl">Follow Our Journey</h3>
                <div className="flex gap-4">
                  {settings.facebook_url && (
                    <a 
                      href={settings.facebook_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group p-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      style={{ background: primaryLight }}
                    >
                      <Facebook 
                        size={24} 
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
                      className="group p-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      style={{ background: primaryLight }}
                    >
                      <Youtube 
                        size={24} 
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
                      className="group p-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      style={{ background: primaryLight }}
                    >
                      <MessageCircle 
                        size={24} 
                        className="group-hover:scale-110 transition-transform duration-300"
                        style={{ color: '#25D366' }}
                      />
                    </a>
                  )}
                </div>
              </div>

              {/* Response Time Info */}
              <div className="pt-6">
                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: `${secondaryColor}10` }}>
                  <Clock size={20} style={{ color: secondaryColor }} />
                  <div>
                    <p className="font-medium text-gray-900">Quick Response</p>
                    <p className="text-sm text-gray-600">We typically respond within 2-4 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Send us a Message
                </h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <div className="relative">
                        <User 
                          size={20} 
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                          style={{ 
                            borderColor: formData.name ? primaryMedium : '#E5E7EB'
                          }}
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone 
                          size={20} 
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                          style={{ 
                            borderColor: formData.phone ? primaryMedium : '#E5E7EB'
                          }}
                          placeholder="+94 77 123 4567"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail 
                        size={20} 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                        style={{ 
                          borderColor: formData.email ? primaryMedium : '#E5E7EB'
                        }}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message *
                    </label>
                    <div className="relative">
                      <MessageSquare 
                        size={20} 
                        className="absolute left-4 top-4 text-gray-400"
                      />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all resize-none"
                        style={{ 
                          borderColor: formData.message ? primaryMedium : '#E5E7EB'
                        }}
                        placeholder="Tell us how we can help you..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl font-bold text-white hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ 
                      background: gradient,
                      boxShadow: `0 8px 30px ${primaryColor}30`
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    By submitting this form, you agree to our privacy policy.
                  </p>
                </form>
              </div>

              {/* Support Info */}
              <div className="p-6 rounded-2xl border border-gray-100" style={{ background: `${primaryColor}05` }}>
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ 
                      background: gradient,
                      color: 'white'
                    }}
                  >
                    <Headphones size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Need Immediate Help?</h3>
                    <p className="text-sm text-gray-600">
                      Call us directly at{' '}
                      {settings.phone ? (
                        <a 
                          href={`tel:${settings.phone}`}
                          className="font-medium hover:underline"
                          style={{ color: primaryColor }}
                        >
                          {settings.phone}
                        </a>
                      ) : 'our support number'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}