'use client';

import { motion } from 'framer-motion';
import { Play, ExternalLink } from 'lucide-react';

export default function Showcase() {
  const showcaseItems = [
    {
      title: 'Interactive Portfolio',
      description:
        'AI avatar showcasing portfolio projects with voice navigation and dynamic presentations.',
      image: '/images/interactiveportfolio.jpg',
      tags: ['3D Avatar', 'Voice Control', 'Portfolio'],
    },
    {
      title: 'Virtual Dating Profile',
      description:
        'Personalized avatar for dating applications with emotion recognition and natural conversation.',
      image: '/images/datingprofile.jpg',
      tags: ['Emotion AI', 'Chat', 'Personalization'],
    },
    {
      title: 'Dynamic Bones Demo',
      description:
        'Advanced physics simulation with dynamic bone movement and realistic hair/clothing animation.',
      image: '/images/dynamicbones.jpg',
      tags: ['Physics', 'Animation', 'Realism'],
    },
    {
      title: 'Gaming Integration',
      description:
        'Avatar integration in gaming environments with real-time lipsync and player interaction.',
      image: '/images/evertrail.jpg',
      tags: ['Gaming', 'Real-time', 'Multiplayer'],
    },
  ];

  return (
    <section id="showcase" className="py-20 bg-dark-bg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-gradient">Showcase</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore real-world applications and implementations of our avatar technology.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {showcaseItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-xl bg-dark-panel border border-dark-border hover:border-primary-500 transition-all duration-300"
            >
              <div className="aspect-video bg-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-4 bg-primary-500/20 backdrop-blur-sm rounded-full border border-primary-500 hover:bg-primary-500/30 transition-all duration-200">
                    <Play className="w-8 h-8 text-primary-500" />
                  </button>
                </div>
                {/* Placeholder for image */}
                <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Demo Image</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary-500 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">{item.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 text-xs bg-primary-500/20 text-primary-500 rounded-full border border-primary-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="flex items-center space-x-2 text-primary-500 hover:text-white transition-colors duration-200">
                  <span>View Demo</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
