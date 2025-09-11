'use client';

import { motion } from 'framer-motion';
import { Mic, Volume2, Brain, Zap, Eye, MessageSquare } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Mic,
      title: 'Advanced TTS',
      description: 'Natural-sounding text-to-speech with emotion and intonation control',
    },
    {
      icon: Volume2,
      title: 'Real-time Lipsync',
      description: 'Precise lip synchronization with audio using advanced phoneme mapping',
    },
    {
      icon: Brain,
      title: 'AI-Powered',
      description: 'Intelligent responses and natural conversation flow',
    },
    {
      icon: Zap,
      title: 'Low Latency',
      description: 'Optimized for real-time interaction with minimal delay',
    },
    {
      icon: Eye,
      title: 'Realistic Visuals',
      description: 'High-quality 3D avatars with realistic expressions and movements',
    },
    {
      icon: MessageSquare,
      title: 'Interactive Chat',
      description: 'Seamless conversation interface with voice and text support',
    },
  ];

  return (
    <section id="features" className="py-20 bg-dark-panel">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the next generation of AI avatars with cutting-edge technology
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-dark-bg/50 p-8 rounded-2xl border border-dark-border hover:border-primary-500/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
