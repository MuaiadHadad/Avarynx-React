'use client';

import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Showcase', href: '#showcase' },
    { name: 'FAQ', href: '#faq' },
  ];

  const resources = [
    { name: 'Documentation', href: '#' },
    { name: 'API Reference', href: '#' },
    { name: 'Source Code', href: '#' },
    { name: 'Examples', href: '#' },
  ];

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com', icon: <Github className="w-5 h-5" /> },
    { name: 'Twitter', href: 'https://twitter.com', icon: <Twitter className="w-5 h-5" /> },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: <Linkedin className="w-5 h-5" /> },
    { name: 'Email', href: 'mailto:support@avarynx.com', icon: <Mail className="w-5 h-5" /> },
  ];

  return (
    <footer className="bg-dark-bg border-t border-dark-border">
      {/* Newsletter Section */}
      <div className="border-b border-dark-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-6">
              Subscribe to our newsletter for the latest updates on avatar technology and new
              features.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-dark-panel border border-dark-border rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg hover:shadow-glow transition-all duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-gradient">Avarynx AI</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Creating the future of interactive AI avatars with cutting-edge technology and
              seamless user experiences.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-dark-panel border border-dark-border rounded-lg text-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200"
                  title={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-primary-500 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-primary-500 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div>
                <p className="text-gray-300">
                  <strong className="text-white">Email:</strong>
                  <br />
                  support@avarynx.com
                </p>
              </div>
              <div>
                <p className="text-gray-300">
                  <strong className="text-white">Technology:</strong>
                  <br />
                  Next.js 15 + React Three Fiber
                </p>
              </div>
              <div>
                <p className="text-gray-300">
                  <strong className="text-white">License:</strong>
                  <br />
                  MIT Open Source
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © {currentYear} Avarynx AI. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-400 text-sm mt-2 md:mt-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>and cutting-edge technology</span>
            </div>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-primary-500 text-sm transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-500 text-sm transition-colors duration-200"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
