'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What browsers are supported for the avatar experience?',
      answer:
        'The avatar works best in modern browsers that support WebGL 2.0, WebAudio API, and getUserMedia. This includes Chrome 80+, Firefox 75+, Safari 14+, and Edge 80+. For the best performance, we recommend Chrome or Firefox.',
    },
    {
      question: 'How does the real-time lipsync technology work?',
      answer:
        'Our lipsync system uses WebAudio API to analyze microphone input in real-time, calculating RMS values to determine volume levels. These values are then mapped to morph targets (blendshapes) on the 3D avatar model, creating realistic mouth movement synchronized with speech.',
    },
    {
      question: 'Which TTS (Text-to-Speech) providers are supported?',
      answer:
        'We support multiple TTS providers including Microsoft Azure Speech Services, Google Cloud Text-to-Speech, ElevenLabs, and StreamElements. The system automatically handles API routing through secure server-side endpoints to protect API keys.',
    },
    {
      question: 'Can I use my own 3D avatar models?',
      answer:
        "Yes! The system supports GLB/GLTF format models with proper rigging and blendshapes. Your model should have morph targets for facial expressions like 'V_Open', 'jawOpen', or 'mouthOpen' for lipsync functionality.",
    },
    {
      question: 'Is the avatar technology suitable for commercial use?',
      answer:
        'Absolutely! The technology is built with production-ready frameworks (Next.js 15, React Three Fiber) and includes proper error handling, security measures, and performance optimizations. API routes ensure secure handling of sensitive data.',
    },
    {
      question: 'What are the system requirements for optimal performance?',
      answer:
        'For best performance, we recommend: WebGL 2.0 compatible graphics, 4GB+ RAM, modern CPU (Intel i5/AMD Ryzen 5 or better), and a stable internet connection for TTS services. Mobile devices with iOS 14+ or Android 8+ are also supported.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-dark-bg to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-gradient">Frequently Asked Questions</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get answers to common questions about our avatar technology and implementation.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 bg-dark-panel border border-dark-border rounded-xl text-left hover:border-primary-500 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white group-hover:text-primary-500 transition-colors duration-300">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-primary-500 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0">
                      <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
