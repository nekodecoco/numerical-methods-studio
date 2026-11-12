'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-white/10 bg-[#060608] pt-20 pb-12 overflow-hidden text-stone-400">
      {/* Colossal Patensify Watermark */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 pointer-events-none select-none text-[8vw] font-black uppercase tracking-tight text-white/[0.02] whitespace-nowrap font-mono">
        NUMERICAL METHODS STUDIO
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs font-mono">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>NUMS STUDIO</span>
            </div>
            <p className="text-stone-400 leading-relaxed font-sans text-xs">
              Next-generation classroom laboratory for numerical analysis, polynomial expansions, and root-finding iterations.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <span className="text-white font-bold tracking-wider uppercase">BRACKETING &amp; SERIES</span>
            <ul className="space-y-2 text-stone-400">
              <li>
                <Link href="/taylor" className="hover:text-white transition">
                  Taylor Series Visualizer
                </Link>
              </li>
              <li>
                <Link href="/bisection" className="hover:text-white transition">
                  Bisection Method
                </Link>
              </li>
              <li>
                <Link href="/false-position" className="hover:text-white transition">
                  Regula Falsi (False Position)
                </Link>
              </li>
              <li>
                <Link href="/tutorial" className="hover:text-white transition">
                  Bolzano&apos;s Theorem
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <span className="text-white font-bold tracking-wider uppercase">OPEN METHODS</span>
            <ul className="space-y-2 text-stone-400">
              <li>
                <Link href="/fixed-point" className="hover:text-white transition">
                  Fixed-Point Cobweb
                </Link>
              </li>
              <li>
                <Link href="/newton-raphson" className="hover:text-white transition">
                  Newton-Raphson Tangents
                </Link>
              </li>
              <li>
                <Link href="/secant" className="hover:text-white transition">
                  Secant Method
                </Link>
              </li>
              <li>
                <Link href="/mullers" className="hover:text-white transition">
                  Muller&apos;s Method (Complex)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <span className="text-white font-bold tracking-wider uppercase">RESOURCES</span>
            <ul className="space-y-2 text-stone-400">
              <li>
                <Link href="/tutorial" className="hover:text-white transition">
                  Full Study Guide &amp; Formulas
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/nekodecoco/numerical-methods-studio"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition inline-flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span className="text-stone-500">Built with Next.js &amp; Plotly</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-500">
          <div>
            © 2026 Numerical Methods Studio. MIT License.
          </div>
          <div className="flex items-center gap-4">
            <span>Classroom &amp; Research Grade</span>
            <span>·</span>
            <span className="text-emerald-400">v2.0 Production</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
