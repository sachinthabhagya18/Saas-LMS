'use client'

import { useEffect, useState } from 'react'
import { settingsApi, getMediaUrl } from '../lib/api'
import { useAcademy } from '../contexts/AcademyContext'
import { Image as ImageIcon, Search, Filter, Grid, List, X, ZoomIn, Heart, Share2, Download } from 'lucide-react'
import Footer from '../components/StudentFooter'

export default function GalleryPage() {
  const { settings } = useAcademy()
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry')
  const [searchTerm, setSearchTerm] = useState('')
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  useEffect(() => {
    const loadImages = async () => {
      try {
        const data = await settingsApi.getGallery()
        let list = []
        if (Array.isArray(data)) {
          list = data
        } else if (data && Array.isArray(data.results)) {
          list = data.results
        }
        setImages(list)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadImages()
  }, [])

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const filteredImages = images.filter(img =>
    img.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const primaryColor = settings.primary_color || '#2563eb'
  const secondaryColor = settings.secondary_color || '#7c3aed'
  const gradient = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="text-center">
        <div 
          className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
          style={{ 
            borderColor: `${primaryColor} transparent transparent transparent` 
          }}
        ></div>
        <p className="text-gray-600 font-medium">Loading gallery...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5"
          style={{ background: gradient }}
        ></div>
        
        <div className="container mx-auto px-6 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ 
                background: `${primaryColor}10`,
                color: primaryColor
              }}
            >
              <ImageIcon size={16} />
              <span className="text-sm font-medium">Memorable Moments</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Our{' '}
              <span 
                className="bg-clip-text text-transparent"
                style={{ 
                  background: gradient,
                  WebkitBackgroundClip: 'text'
                }}
              >
                Gallery
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the vibrant learning environment and memorable moments from {settings.academy_name}
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Controls */}
      <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100 py-4">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search 
                size={20} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search photos by caption or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ 
                  // @ts-ignore
                  '--tw-ring-color': primaryColor 
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'masonry' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  style={{ color: viewMode === 'masonry' ? primaryColor : '#6B7280' }}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  style={{ color: viewMode === 'grid' ? primaryColor : '#6B7280' }}
                >
                  <List size={20} />
                </button>
              </div>

              <div className="text-sm text-gray-500">
                <span style={{ color: primaryColor }} className="font-medium">
                  {filteredImages.length}
                </span> images found
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {filteredImages.length === 0 ? (
            <div className="text-center py-24">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ 
                  background: `${primaryColor}10`,
                  color: primaryColor
                }}
              >
                <ImageIcon size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Images Found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                {searchTerm ? 'No images match your search. Try different keywords.' : 'Gallery is currently empty.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all"
                  style={{ 
                    background: gradient,
                    color: 'white'
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredImages.map((img) => (
                    <GalleryCard
                      key={img.id}
                      img={img}
                      primaryColor={primaryColor}
                      gradient={gradient}
                      isFavorite={favorites.has(img.id)}
                      onFavorite={() => toggleFavorite(img.id)}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              ) : (
                // Masonry View
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                  {filteredImages.map((img) => (
                    <div key={img.id} className="break-inside-avoid">
                      <GalleryCard
                        img={img}
                        primaryColor={primaryColor}
                        gradient={gradient}
                        isFavorite={favorites.has(img.id)}
                        onFavorite={() => toggleFavorite(img.id)}
                        onClick={() => setSelectedImage(img)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main Image */}
              <div className="flex-1 bg-black rounded-2xl overflow-hidden flex items-center justify-center">
                <img
                  // ✅ FIX: Fallback to empty string to avoid null type error
                  src={getMediaUrl(selectedImage.image) || ''}
                  alt={selectedImage.caption || 'Gallery Image'}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              </div>
              
              {/* Image Info */}
              <div className="lg:w-96 bg-white rounded-2xl p-6 overflow-y-auto max-h-[70vh]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Image Details</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(selectedImage.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      style={{ color: favorites.has(selectedImage.id) ? '#EF4444' : '#6B7280' }}
                    >
                      <Heart 
                        size={20} 
                        fill={favorites.has(selectedImage.id) ? '#EF4444' : 'none'}
                      />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                      <Share2 size={20} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                      <Download size={20} />
                    </button>
                  </div>
                </div>
                
                {selectedImage.caption && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Caption</h4>
                    <p className="text-gray-900 font-medium">{selectedImage.caption}</p>
                  </div>
                )}
                
                {selectedImage.description && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                    <p className="text-gray-700 whitespace-pre-line">{selectedImage.description}</p>
                  </div>
                )}
                
                {selectedImage.created_at && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Date</h4>
                    <p className="text-gray-700">
                      {new Date(selectedImage.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

// Gallery Card Component
function GalleryCard({ img, primaryColor, gradient, isFavorite, onFavorite, onClick }: any) {
  return (
    <div 
      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white border border-gray-100"
    >
      {/* Image Container */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          // ✅ FIX: Fallback to empty string here as well
          src={getMediaUrl(img.image) || ''}
          alt={img.caption || 'Gallery Image'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800'
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFavorite()
            }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
            style={{ color: isFavorite ? '#EF4444' : '#6B7280' }}
          >
            <Heart size={18} fill={isFavorite ? '#EF4444' : 'none'} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
            style={{ color: primaryColor }}
          >
            <ZoomIn size={18} />
          </button>
        </div>
        
        {/* View Button */}
        <button
          onClick={onClick}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0"
          style={{ background: gradient }}
        >
          View Image
        </button>
      </div>
      
      {/* Caption */}
      {(img.caption || img.description) && (
        <div className="p-4">
          {img.caption && (
            <h3 
              className="font-bold text-gray-900 mb-1 truncate"
              style={{ color: primaryColor }}
            >
              {img.caption}
            </h3>
          )}
          {img.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {img.description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}