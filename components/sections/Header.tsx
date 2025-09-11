'use client';

import { useState } from 'react';
import { Menu, X, Search, ArrowRight } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navigation = [
    {
      name: 'Home',
      href: '#home',
      hasDropdown: true,
      submenu: [
        { name: 'Home 01', href: '#home' },
        { name: 'Home 02', href: '#home-2' },
        { name: 'Home 03', href: '#home-3' },
        { name: 'Home 04', href: '#home-4' },
      ],
    },
    {
      name: 'Pages',
      href: '#pages',
      hasDropdown: true,
      submenu: [
        { name: 'About Us', href: '#about' },
        { name: 'Team', href: '#team' },
        { name: 'Team Details', href: '#team-details' },
        { name: 'FAQ', href: '#faq' },
        { name: 'Pricing Page', href: '#pricing' },
        { name: 'Error 404', href: '#error' },
      ],
    },
    {
      name: 'Services',
      href: '#services',
      hasDropdown: true,
      submenu: [
        { name: 'Services', href: '#services' },
        { name: 'Services Details', href: '#service-details' },
      ],
    },
    {
      name: 'Projects',
      href: '#projects',
      hasDropdown: true,
      submenu: [
        { name: 'Projects', href: '#projects' },
        { name: 'Project Details', href: '#project-details' },
      ],
    },
    {
      name: 'Blog',
      href: '#blog',
      hasDropdown: true,
      submenu: [
        { name: 'Blog', href: '#blog' },
        { name: 'Blog Details', href: '#blog-details' },
      ],
    },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Search Popup */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50">
          <div className="search_popup fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-dark-panel rounded-lg p-8 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-semibold text-white">
                  Search Projects, Service or Blog.
                </h4>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="search-box flex">
                <input
                  type="search"
                  placeholder="Search here..."
                  className="flex-1 px-4 py-3 bg-dark-bg border border-dark-border rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="header-area header-2 fixed top-0 left-0 right-0 z-50 bg-dark-panel backdrop-blur-sm border-b border-dark-border">
        <div className="header-bottom">
          <div className="container-fluid px-4">
            <div className="row">
              <div className="col-12">
                <div className="header-wrapper flex items-center justify-between py-4">
                  {/* Site Logo */}
                  <div className="site_logo">
                    <a className="logo flex items-center space-x-2" href="#home">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">A</span>
                      </div>
                      <span className="text-xl font-bold text-gradient">Avarynx AI</span>
                    </a>
                  </div>

                  {/* Navigation */}
                  <div className="menu-area hidden lg:flex items-center">
                    <nav className="mainmenu">
                      <ul className="flex items-center space-x-8">
                        {navigation.map((item) => (
                          <li
                            key={item.name}
                            className={`relative ${item.hasDropdown ? 'has-dropdown' : ''} ${
                              item.name === 'Home' ? 'current-menu-ancestor' : ''
                            }`}
                            onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                            onMouseLeave={() => setActiveDropdown(null)}
                          >
                            <a
                              href={item.href}
                              className="text-primary-500 hover:text-white transition-colors duration-200 py-2"
                            >
                              {item.name}
                            </a>
                            {item.hasDropdown && item.submenu && activeDropdown === item.name && (
                              <ul className="sub-menu absolute top-full left-0 mt-2 bg-dark-panel border border-dark-border rounded-lg shadow-lg min-w-[200px] py-2">
                                {item.submenu.map((subItem) => (
                                  <li key={subItem.name}>
                                    <a
                                      href={subItem.href}
                                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-bg transition-colors"
                                    >
                                      {subItem.name}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>

                  {/* Header Right Info */}
                  <div className="header-right-item hidden lg:flex items-center space-x-4">
                    <div className="header-search">
                      <button
                        onClick={() => setIsSearchOpen(true)}
                        className="search flex items-center space-x-2 text-primary-500 hover:text-white transition-colors"
                      >
                        <Search className="w-4 h-4" />
                        <span>Search</span>
                      </button>
                    </div>
                    <div className="header-button">
                      <a
                        className="tj-primary-btn bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
                        href="#contact"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Get In Touch</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Mobile Menu Button */}
                  <div className="menu_bar mobile_menu_bar lg:hidden">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 text-primary-500 hover:text-white"
                    >
                      {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="hamburger-area lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="hamburger_wrapper bg-dark-panel h-full w-80 ml-auto p-6 overflow-y-auto">
            <div className="hamburger_inner">
              <div className="hamburger_top flex items-center justify-between mb-6">
                <div className="hamburger_logo">
                  <a href="#home" className="mobile_logo flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">A</span>
                    </div>
                    <span className="text-lg font-bold text-gradient">Avarynx AI</span>
                  </a>
                </div>
                <div className="hamburger_close">
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="hamburger_menu">
                <div className="mobile_menu">
                  <ul className="space-y-4">
                    {navigation.map((item) => (
                      <li key={item.name} className="border-b border-dark-border pb-4">
                        <a
                          href={item.href}
                          className="text-white hover:text-primary-500 transition-colors text-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </a>
                        {item.hasDropdown && item.submenu && (
                          <ul className="mt-2 ml-4 space-y-2">
                            {item.submenu.map((subItem) => (
                              <li key={subItem.name}>
                                <a
                                  href={subItem.href}
                                  className="text-gray-400 hover:text-white transition-colors"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {subItem.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="hamburger-infos mt-8">
                <h5 className="hamburger-title text-white font-semibold mb-4">Contact Info</h5>
                <div className="contact-info space-y-3">
                  <div className="contact-item">
                    <span className="subtitle text-gray-400 block">Phone</span>
                    <a
                      className="contact-link text-white hover:text-primary-500"
                      href="tel:8089091313"
                    >
                      808-909-1313
                    </a>
                  </div>
                  <div className="contact-item">
                    <span className="subtitle text-gray-400 block">Email</span>
                    <a
                      className="contact-link text-white hover:text-primary-500"
                      href="mailto:info@avarynx.com"
                    >
                      info@avarynx.com
                    </a>
                  </div>
                  <div className="contact-item">
                    <span className="subtitle text-gray-400 block">Location</span>
                    <span className="contact-link text-white">
                      993 Renner Burg, West Rond, MT 94251-030
                    </span>
                  </div>
                </div>
              </div>
              <div className="hamburger-socials mt-8">
                <h5 className="hamburger-title text-white font-semibold mb-4">Follow Us</h5>
                <div className="social-links flex space-x-4">
                  <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    className="text-gray-400 hover:text-primary-500"
                  >
                    Facebook
                  </a>
                  <a
                    href="https://www.linkedin.com/"
                    target="_blank"
                    className="text-gray-400 hover:text-primary-500"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    className="text-gray-400 hover:text-primary-500"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://x.com/"
                    target="_blank"
                    className="text-gray-400 hover:text-primary-500"
                  >
                    Twitter
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
