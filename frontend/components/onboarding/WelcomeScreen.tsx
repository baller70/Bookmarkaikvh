'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  Users, 
  Target, 
  Zap,
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Rocket,
  Heart
} from 'lucide-react'

interface WelcomeScreenProps {
  onGetStarted: () => void
  onSkip: () => void
  userInfo?: {
    name?: string
    email: string
    avatar?: string
  }
}

export function WelcomeScreen({ onGetStarted, onSkip, userInfo }: WelcomeScreenProps) {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [showStats, setShowStats] = useState(false)

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Organization",
      description: "Automatically categorize and tag your bookmarks with advanced AI",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: Sparkles,
      title: "Smart Recommendations",
      description: "Discover new content based on your interests and reading patterns",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: Users,
      title: "Collaborative Collections",
      description: "Share and collaborate on bookmark collections with your team",
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: Target,
      title: "Intelligent Search",
      description: "Find exactly what you're looking for with semantic search",
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    }
  ]

  const stats = [
    { label: "Bookmarks Organized", value: "1M+", icon: BookOpen },
    { label: "AI Processing", value: "99.9%", icon: Brain },
    { label: "Time Saved", value: "50hrs", icon: Zap },
    { label: "User Satisfaction", value: "4.9★", icon: Star }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)

    const statsTimer = setTimeout(() => {
      setShowStats(true)
    }, 1000)

    return () => {
      clearInterval(timer)
      clearTimeout(statsTimer)
    }
  }, [features.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg"
            >
              <BookOpen className="h-12 w-12 text-white" />
            </motion.div>
          </div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            Welcome to BookAIMark
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            {userInfo?.name ? `Hi ${userInfo.name}! ` : 'Hi! '}
            Transform how you organize, discover, and share bookmarks with the power of AI
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-2 mt-4"
          >
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Free to start
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Rocket className="h-3 w-3 mr-1" />
              AI-powered
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Heart className="h-3 w-3 mr-1" />
              Loved by 10k+ users
            </Badge>
          </motion.div>
        </motion.div>

        {/* Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid md:grid-cols-2 gap-8 mb-12"
        >
          {/* Rotating Feature Display */}
          <Card className="relative overflow-hidden border-2 border-gray-100 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <motion.div
                  key={currentFeature}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`p-3 rounded-xl ${features[currentFeature].bgColor}`}
                >
                  <features[currentFeature].icon className={`h-6 w-6 ${features[currentFeature].color}`} />
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentFeature}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {features[currentFeature].title}
                  </motion.span>
                </AnimatePresence>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentFeature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-600"
                >
                  {features[currentFeature].description}
                </motion.p>
              </AnimatePresence>
              
              {/* Progress indicators */}
              <div className="flex gap-2 mt-6">
                {features.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentFeature ? 'bg-blue-500 w-8' : 'bg-gray-200 w-2'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Display */}
          <Card className="border-2 border-gray-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Trusted by Thousands
              </CardTitle>
              <CardDescription>
                Join a community of productive bookmark managers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={showStats ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-3 rounded-lg bg-gray-50"
                  >
                    <stat.icon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Play className="h-5 w-5 mr-2" />
            Get Started
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          
          <Button
            onClick={onSkip}
            variant="ghost"
            size="lg"
            className="text-gray-600 hover:text-gray-800 px-8 py-3 text-lg"
          >
            Skip for now
          </Button>
        </motion.div>

        {/* Estimated time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            Setup takes only 3-5 minutes • You can always customize later
          </p>
        </motion.div>
      </div>
    </div>
  )
} 