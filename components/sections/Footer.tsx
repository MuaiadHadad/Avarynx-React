/* eslint-disable @next/next/no-img-element */
'use client';

export default function Footer() {
  return (
    <footer className="tj-footer-section footer-2 section-gap-x">
      <div className="footer-top-area">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="footer-widget widget-subscribe-2">
                <h2 className="title wow fadeInLeft" data-wow-delay=".3s">
                  Subscribe to Our Newsletter <img src="/assets/images/shape/bell.webp" alt="" />
                </h2>
                <div className="subscribe-form wow fadeInRight" data-wow-delay=".4s">
                  <form action="#">
                    <input type="email" name="email" placeholder="Enter email*" />
                    <button type="submit">
                      <i className="tji-plane"></i> Subscribe
                    </button>
                    <label htmlFor="agree">
                      <input id="agree" type="checkbox" />
                      Agree to our <a href="#">Terms & Condition?</a>
                    </label>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-main-area style-2">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-xl-3 col-md-6">
              <div className="footer-widget footer-col-1">
                <div className="footer-logo">
                  <a href="index.html">
                    <img src="/assets/images/logos/logoA.webp" alt="Logo" />
                  </a>
                </div>
                <div className="footer-text">
                  <p>
                    Understanding client needs, defining goals, and designing tailored AI crafting
                    solutions.
                  </p>
                </div>
                <div className="social-links style-2">
                  <ul>
                    <li>
                      <a href="https://www.facebook.com/" target="_blank">
                        <i className="tji-facebook"></i>
                      </a>
                    </li>
                    <li>
                      <a href="https://www.linkedin.com/" target="_blank">
                        <i className="tji-linkedin"></i>
                      </a>
                    </li>
                    <li>
                      <a href="https://www.instagram.com/" target="_blank">
                        <i className="tji-instagram"></i>
                      </a>
                    </li>
                    <li>
                      <a href="https://x.com/" target="_blank">
                        <i className="tji-x-twitter"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-xxl-2 col-xl-3 col-md-6">
              <div className="footer-widget widget-nav-menu footer-col-2">
                <h5 className="title">Quick Links</h5>
                <ul>
                  <li>
                    <a href="index.html">Home</a>
                  </li>
                  <li>
                    <a href="about.html">About Us</a>
                  </li>
                  <li>
                    <a href="service.html">Services</a>
                  </li>
                  <li>
                    <a href="blog.html">Blog</a>
                  </li>
                  <li>
                    <a href="project.html">Portfolio</a>
                  </li>
                  <li>
                    <a href="contact.html">Contact Us</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="footer-widget widget-nav-menu footer-col-3">
                <h5 className="title">Our Services</h5>
                <ul>
                  <li>
                    <a href="service-details.html">AI-Powered Solutions</a>
                  </li>
                  <li>
                    <a href="service-details.html">Custom Technology</a>
                  </li>
                  <li>
                    <a href="service-details.html">Predictive Analytics</a>
                  </li>
                  <li>
                    <a href="service-details.html">Machine Learning</a>
                  </li>
                  <li>
                    <a href="service-details.html">Language Processing</a>
                  </li>
                  <li>
                    <a href="service-details.html">Computer Vision</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="footer-widget widget-contact foote-col-4">
                <h5 className="title">Contact Info</h5>
                <div className="footer-contact-info">
                  <div className="contact-item">
                    <span>993 Renner Burg, West Rond, MT 94251-030, USA.</span>
                  </div>
                  <div className="contact-item">
                    <a href="tel:10095447818">P: +1 (009) 544-7818</a>
                    <a href="mailto:support@ainex.com">E: support@ainex.com</a>
                  </div>
                  <div className="contact-item">
                    <span>
                      <i className="tji-clock"></i> Mon-Fri 10am-10pm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tj-copyright-area-2">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="copyright-content-area">
                <div className="copyright-text">
                  <p>
                    &copy; 2025{' '}
                    <a
                      href="https://themeforest.net/user/theme-junction/portfolio"
                      target="_blank"
                    >
                      Ainex
                    </a>{' '}
                    All right reserved
                  </p>
                </div>
                <div className="copyright-menu">
                  <ul>
                    <li>
                      <a href="contact.html">Privacy Policy</a>
                    </li>
                    <li>
                      <a href="contact.html">Terms & Condition</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
