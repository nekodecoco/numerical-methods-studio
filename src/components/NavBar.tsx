'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  TrendingUp,
  Scissors,
  Split,
  BookOpen,
} from 'lucide-react';

export const NavBar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Taylor Series',
      icon: TrendingUp,
      active: pathname === '/',
    },
    {
      href: '/bisection',
      label: 'Bisection Method',
      icon: Scissors,
      active: pathname === '/bisection',
    },
    {
      href: '/false-position',
      label: 'False Position',
      icon: Split,
      active: pathname === '/false-position',
    },
    {
      href: '/tutorial',
      label: 'Study Guide',
      icon: BookOpen,
      active: pathname === '/tutorial',
    },
  ];

  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
          <div className="w-10 h-10 rounded-xl bg-[#800020] text-white flex items-center justify-center shadow-md shadow-[#800020]/20 font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-stone-950 font-serif">
                Numerical Methods Studio
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#800020]/10 text-[#800020] border border-[#800020]/20 hidden sm:inline-block">
                Classroom Suite
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Interactive root-finding, polynomial approximations &amp; error analysis
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  item.active
                    ? 'bg-[#800020] text-white shadow-sm shadow-[#800020]/25'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
