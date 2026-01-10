'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { coursesApi } from '../../../../../../lib/api'
import { 
  ArrowLeft, CheckCircle, Calendar, ExternalLink, Video as VideoIcon, 
  FileText, Maximize, Minimize, Play, Pause, Volume2, VolumeX, 
  Settings, Clock, Shield, Sparkles, Zap, Brain, Award,
  ChevronRight, BookOpen, Users, Target, Star, Download, Share2
} from 'lucide-react'

export default function SessionPlayer() {
  const { courseId, chapterId, sessionId } = useParams()
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  useEffect(() => {
    coursesApi.getSession(sessionId as string)
      .then(data => {
        setSession(data)
        setCompleted(data.is_completed || false)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [sessionId])

  const handleComplete = async () => {
    try {
      await coursesApi.markSessionComplete(sessionId as string)
      setCompleted(true)
      setTimeout(() => {
        router.push(`/student/courses/${courseId}/learn/${chapterId}`)
      }, 1500)
    } catch (e) { 
      console.error(e) 
    }
  }

  const toggleFullScreen = () => {
    if (!videoContainerRef.current) return

    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Full-screen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setPlaying(true)
      } else {
        videoRef.current.pause()
        setPlaying(false)
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setMuted(videoRef.current.muted)
    }
  }

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 font-medium animate-pulse">Loading session...</p>
      </div>
    </div>
  )
  
  if (!session) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-100/10 to-pink-100/10 flex items-center justify-center">
          <Shield size={64} className="text-red-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4">Session Not Found</h2>
        <p className="text-slate-400 text-lg mb-8">The requested session doesn't exist or has been removed.</p>
        <button 
          onClick={() => router.back()}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-blue-500/20 hover:scale-105 transition-all"
        >
          Go Back
        </button>
      </div>
    </div>
  )

  const isZoom = session.media_type === 'zoom'
  const videoLink = isZoom ? session.recording_url : session.video_url
  const videoId = getYoutubeId(videoLink)
  const scheduledDate = session.scheduled_at ? new Date(session.scheduled_at) : null
  const isLive = scheduledDate && Math.abs(new Date().getTime() - scheduledDate.getTime()) < 3600000

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Modern Header */}
      <div className="relative z-10 px-6 py-4 bg-gradient-to-r from-black/80 via-slate-900/90 to-black/80 border-b border-slate-800/50 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()} 
            className="group p-3 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:from-blue-900/50 hover:to-cyan-900/50 border border-slate-700/50 hover:border-blue-600/50 transition-all hover:scale-105"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
              <p className="text-sm font-bold text-blue-300 uppercase tracking-wider">
                {isZoom ? 'Live Session' : 'Course Lesson'}
              </p>
            </div>
            <h1 className="text-xl md:text-2xl font-black truncate max-w-2xl">
              {session.title}
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {session.duration_seconds && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50">
              <Clock size={16} className="text-blue-400" />
              <span className="text-sm font-bold">
                {Math.round(session.duration_seconds / 60)} min
              </span>
            </div>
          )}
          
          <div className={`px-4 py-2 rounded-xl font-bold ${
            completed ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-500/30' :
            'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {completed ? '✅ Completed' : '📚 In Progress'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 px-4 md:px-6 py-8 max-w-10xl mx-auto">
        <div className="grid lg:grid-cols-1 gap-8">
          {/* Player Column */}
          <div className="lg:col-span-2">
            {/* Zoom Live View */}
            {isZoom && !videoLink && (
              <div className="bg-gradient-to-br from-slate-900/80 to-black/80 rounded-3xl border border-slate-800/50 backdrop-blur-sm p-10 text-center shadow-2xl shadow-blue-900/20">
                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <VideoIcon size={64} className="text-blue-400" />
                </div>
                
                <h2 className="text-3xl font-black text-white mb-4">Live Zoom Session</h2>
                <p className="text-slate-400 text-lg mb-8">Recording will be available after the class ends</p>
                
                {scheduledDate && (
                  <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-2xl p-6 mb-8 border border-slate-700/50 inline-block">
                    <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Scheduled For</p>
                    <div className="flex items-center justify-center gap-3 text-2xl font-black text-blue-300">
                      <Calendar size={24} />
                      {scheduledDate.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-lg text-blue-400 font-bold mt-2">
                      {scheduledDate.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                )}

                <a 
                  href={session.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all"
                >
                  <Zap size={24} />
                  {isLive ? 'Join Live Session Now' : 'Launch Zoom Meeting'}
                </a>
              </div>
            )}

            {/* Video Player */}
            {(session.media_type === 'video' && videoId) || (isZoom && videoId) ? (
              <div 
                ref={videoContainerRef} 
                className="relative bg-black rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/30 border border-slate-800/50 group"
              >
                <div className="aspect-video relative">
                  <iframe 
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1&iv_load_policy=3&disablekb=0`} 
                    className="w-full h-full" 
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title="Course Video"
                  ></iframe>
                  
                  {/* Protection Layers */}
                  <div className="absolute top-0 left-0 w-full h-16 bg-transparent z-20"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-16 bg-transparent z-20"></div>

                  {/* Custom Controls */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-30">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={togglePlayPause}
                        className="p-3 rounded-xl bg-slate-900/90 text-white hover:bg-blue-600 transition-all border border-slate-700/50"
                      >
                        {playing ? <Pause size={20} /> : <Play size={20} />}
                      </button>
                      <button 
                        onClick={toggleMute}
                        className="p-3 rounded-xl bg-slate-900/90 text-white hover:bg-blue-600 transition-all border border-slate-700/50"
                      >
                        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                    </div>
                    
                    <button 
                      onClick={toggleFullScreen}
                      className="p-3 rounded-xl bg-slate-900/90 text-white hover:bg-blue-600 transition-all border border-slate-700/50"
                    >
                      {document.fullscreenElement ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Direct Video Player */}
            {session.media_type === 'video' && session.video_url && !videoId && (
              <div 
                ref={videoContainerRef} 
                className="relative bg-black rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/30 border border-slate-800/50"
              >
                <video 
                  ref={videoRef}
                  controls 
                  className="w-full aspect-video"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onVolumeChange={() => setMuted(videoRef.current?.muted || false)}
                >
                  <source src={session.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* PDF Viewer */}
            {session.media_type === 'pdf' && session.file && (
              <div className="bg-gradient-to-br from-slate-900/80 to-black/80 rounded-3xl border border-slate-800/50 overflow-hidden shadow-2xl shadow-blue-900/20">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-blue-400" />
                    <span className="font-bold">Document Viewer</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Protected View</div>
                </div>
                <iframe 
                  src={`${session.file}#toolbar=0&navpanes=0&scrollbar=0`} 
                  className="w-full h-[600px]" 
                  title="PDF Viewer" 
                />
              </div>
            )}

            {/* External Link */}
            {session.media_type === 'link' && (
              <div className="bg-gradient-to-br from-slate-900/80 to-black/80 rounded-3xl border border-slate-800/50 backdrop-blur-sm p-10 text-center shadow-2xl shadow-blue-900/20">
                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                  <ExternalLink size={64} className="text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4">External Resource</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                  This lesson requires you to visit an external learning resource.
                </p>
                <a 
                  href={session.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 transition-all"
                >
                  <ExternalLink size={24} />
                  Open Learning Resource
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}