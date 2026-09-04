import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20 sm:h-22">
          {/* Vivantify Logo Only (Enlarged, No Technology Solutions Badge) */}
          <Link href="/jobs" className="flex items-center transition-opacity hover:opacity-90">
            <img
              src="/vivantify-logo.png"
              alt="Vivantify Logo"
              className="h-11 sm:h-13 md:h-14 w-auto object-contain"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
