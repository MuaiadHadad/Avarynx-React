'use client';

import { motion } from 'framer-motion';
import { Play, Mic, MessageSquare } from 'lucide-react';

export default function Hero() {
  return (
    <div className="flex flex-col justify-center space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
          <span className="text-gradient">AI Avatar</span>
          <br />
          <span className="text-white">Experience</span>
        </h1>

        <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
          Interact with cutting-edge AI avatars featuring advanced lipsync, real-time voice
          recognition, and natural conversation capabilities.
        </p>

        <div className="flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-glow transition-all duration-200"
          >
            <Play className="w-5 h-5 inline mr-2" />
            Try Live Demo
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 border border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-500/10 transition-all duration-200"
          >
            Learn More
          </motion.button>
        </div>

        {/* Feature highlights */}
        <div className="flex flex-wrap gap-6 pt-8">
          <div className="flex items-center space-x-2 text-gray-300">
            <Mic className="w-5 h-5 text-primary-500" />
            <span>Voice Recognition</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <MessageSquare className="w-5 h-5 text-secondary-500" />
            <span>Real-time Chat</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <div className="w-5 h-5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" />
            <span>Advanced Lipsync</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
