import React from 'react';
import Navbar from '../../components/Navbar';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-8">
            {/* About Vivantify */}
            <div id="about">
              <div className="mb-4">
                <img
                  src="/vivantify-logo.png"
                  alt="Vivantify Logo"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                <strong>Vivantify Technology Solutions</strong> delivers next-generation IT consulting, custom application development, enterprise cloud architectures, and specialized technology staffing. We partner with fast-growing enterprises and global leaders to accelerate digital transformation.
              </p>
            </div>

            {/* Contact Details */}
            <div id="contact" className="md:justify-self-end md:ml-auto">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Contact & Address
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#ed7a1c] shrink-0" />
                  <a
                    href="tel:+919366615960"
                    className="hover:text-[#ed7a1c] font-semibold transition text-slate-900"
                  >
                    +91 9366615960
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#ed7a1c] shrink-0" />
                  <a
                    href="mailto:info@vivantify.com"
                    className="hover:text-[#ed7a1c] font-medium transition"
                  >
                    info@vivantify.com
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#ed7a1c] shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    25, Subramaniam St, Olymbus, Bharathi Nagar,<br />
                    Ramanathapuram, Coimbatore, Tamil Nadu 641045
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Vivantify Technology Solutions. All rights reserved.</p>
            <p className="flex items-center gap-1 text-slate-400">
              Enterprise Careers & Resume Collector Portal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
