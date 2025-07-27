'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { Shield, ArrowRight, Sparkles, Lock, CreditCard, Users } from 'lucide-react'

// You'll need to import your actual images
import Hero from "../../assets/images/logo.png"
import Logo from "../../assets/images/hero.png"

export default function HomePage() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  const messages = [
    {
      title: "Welcome to Demo Bank",
      subtitle: "Your trusted financial partner",
      icon: Shield
    },
    {
      title: "Secure Banking Solutions",
      subtitle: "Advanced security for your peace of mind",
      icon: Lock
    },
    {
      title: "Modern Digital Experience",
      subtitle: "Banking reimagined for the digital age",
      icon: CreditCard
    },
    {
      title: "24/7 Customer Support",
      subtitle: "We're here whenever you need us",
      icon: Users
    }
  ]

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setIsVisible(false)
      
      setTimeout(() => {
        setCurrentMessageIndex((prev) => 
          prev === messages.length - 1 ? 0 : prev + 1
        )
        setIsVisible(true)
      }, 300)
    }, 2000)

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0
        }
        return prev + 1
      })
    }, 50)

    // Navigate to login after 5 seconds
    const navigationTimer = setTimeout(() => {
      router.push('/login')
    }, 15000)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
      clearTimeout(navigationTimer)
    }
  }, [router, messages.length])

  const currentMessage = messages[currentMessageIndex]
  const IconComponent = currentMessage.icon

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-300/10 to-teal-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Sparkles className="w-3 h-3 text-emerald-400/30" />
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Logo Section */}
        <div className="mb-8 transform hover:scale-105 transition-all duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border border-white/50">
              {/* Replace with your actual logo */}
              {/* Uncomment when you have your logo */}
               <Image
                src={Logo}
                alt="Demo Bank Logo"
                width={80}
                height={80}
                className="rounded-full"
              /> 
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mb-8 transform hover:scale-105 transition-all duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full blur-xl opacity-20 animate-pulse delay-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl border border-white/50">
              {/* Replace with your actual hero image */}
              <div className="w-32 h-32 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                <CreditCard className="w-16 h-16 text-white" />
              </div>
              {/* Uncomment when you have your hero image */}
              <Image
                src={Hero}
                alt="Hero Bank"
                width={128}
                height={128}
                className="rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Message Section */}
        <div className={`transition-all duration-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mr-4">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                {currentMessage.title}
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                {currentMessage.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 w-64 bg-gray-200/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Loading Text */}
        <div className="mt-6 flex items-center space-x-3">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              ></div>
            ))}
          </div>
          <span className="text-gray-500 font-medium">Preparing your banking experience...</span>
        </div>

        {/* Navigation Hint */}
        <div className="mt-8 flex items-center space-x-2 text-gray-400">
          <span className="text-sm">Redirecting to login</span>
          <ArrowRight className="w-4 h-4 animate-pulse" />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </main>
  )
}