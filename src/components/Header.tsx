import { ShoppingBag } from 'lucide-react';
import { Logo3D } from './Logo3D';
import type { ExamCategory } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onSelectCategory: (cat: ExamCategory) => void;
  onScrollToSection: (id: string) => void;
}

export function Header({
  cartCount,
  onOpenCart,
  onSelectCategory,
  onScrollToSection,
}: HeaderProps) {
  function handleNavCategory(cat: ExamCategory) {
    onSelectCategory(cat);
    onScrollToSection('catalog');
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title with 3D Logo */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory('All');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
        >
          <Logo3D size="sm" />
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            EXAM VERSE
          </span>
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Primary exam streams"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => handleNavCategory('All')}
            className="hover:text-slate-900 hover:underline underline-offset-4 decoration-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Catalog
          </button>
          <button
            type="button"
            onClick={() => handleNavCategory('GATE')}
            className="hover:text-slate-900 hover:underline underline-offset-4 decoration-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            GATE
          </button>
          <button
            type="button"
            onClick={() => handleNavCategory('Govt Exams')}
            className="hover:text-slate-900 hover:underline underline-offset-4 decoration-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Govt Exams
          </button>
          <button
            type="button"
            onClick={() => handleNavCategory('Interview Prep')}
            className="hover:text-slate-900 hover:underline underline-offset-4 decoration-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Interview
          </button>
          <button
            type="button"
            onClick={() => onScrollToSection('study-advisor')}
            className="hover:text-slate-900 hover:underline underline-offset-4 decoration-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Study Advisor
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag</span>
            <span className="tabular-nums text-xs font-mono bg-white/15 px-1.5 py-0.5 rounded">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
