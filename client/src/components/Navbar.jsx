import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Vivantify Logo Only */}
          <Link href="/jobs" className="flex items-center gap-2.5">
            <img
              src="/vivantify-logo.png"
              alt="Vivantify Logo"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
              Technology Solutions
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
