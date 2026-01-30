"use client"

import { motion } from 'framer-motion'
import { Calendar, MapPin, Star, Heart, Share2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import type { EntertainmentItem } from './mockData'

interface EntertainmentDetailHeroProps {
  item: EntertainmentItem
}

export function EntertainmentDetailHero({ item }: EntertainmentDetailHeroProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    // TODO: Integrate with useWishlist hook
  }

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy link')
      }
    }
  }

  return (
    <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden rounded-b-[2.5rem]">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
      </div>

      {/* Action Buttons - Top Right */}
      <div className="absolute top-6 right-6 flex gap-3 z-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <Share2 className="w-5 h-5" strokeWidth={1.5} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleWishlist}
          className={`w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center transition-colors ${
            isWishlisted
              ? 'bg-[#FF5E1F] border-[#FF5E1F] text-white'
              : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
          }`}
        >
          <Heart
            className="w-5 h-5"
            strokeWidth={1.5}
            fill={isWishlisted ? 'currentColor' : 'none'}
          />
        </motion.button>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          <Link href="/entertainment" className="hover:text-white transition-colors">
            Entertainment
          </Link>
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-white font-bold capitalize">{item.category.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Content - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 z-10">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#FF5E1F] text-white text-sm font-bold uppercase tracking-wider">
                {item.category.replace('-', ' ')}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 tracking-tight">
              {item.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-white/90 mb-6">
              {/* Rating */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" strokeWidth={1.5} />
                <span className="font-bold text-white">{item.rating}</span>
                <span className="text-sm text-white/70">({item.reviewCount.toLocaleString()} reviews)</span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-medium">{item.date}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-medium">{item.location}</span>
              </div>
            </div>

            {/* Short Description */}
            <p className="text-lg text-white/90 max-w-3xl font-medium leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
