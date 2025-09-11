'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Download, Github } from 'lucide-react';

export default function CTA() {
  return (
    <section
      id="contact"
      className="py-20 bg-gradient-to-r from-primary-500/10 to-secondary-500/10"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to <span className="text-gradient">Get Started?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Experience the future of interactive avatars. Download the source code, explore the
            documentation, or get in touch for custom implementations.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-glow transition-all duration-200 flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download Source</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-500/10 transition-all duration-200 flex items-center space-x-2"
            >
              <Github className="w-5 h-5" />
              <span>View on GitHub</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-transparent text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">Open Source</h3>
              <p className="text-gray-300">Free to use and modify under MIT license</p>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">Production Ready</h3>
              <p className="text-gray-300">Built with Next.js 15 and enterprise-grade security</p>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">Active Support</h3>
              <p className="text-gray-300">Community-driven development and regular updates</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
