import { Bookmark, PackageCheck, Search, Sparkles, X } from 'lucide-react';
import { Logo3D } from './Logo3D';
import type { ExamCategory } from '../types';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: ExamCategory;
  onSelectCategory: (cat: ExamCategory) => void;
  wishlistCount: number;
  ordersCount: number;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onJumpToAdvisor: () => void;
  onJumpToCatalog: () => void;
}

const CATEGORIES: ExamCategory[] = [
  'All',
  'GATE',
  'Govt Exams',
  'Engineering',
  'Interview Prep',
];

export function HeroSection({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  wishlistCount,
  ordersCount,
  onOpenWishlist,
  onOpenOrders,
  onJumpToAdvisor,
  onJumpToCatalog,
}: HeroSectionProps) {
  return (
    <section id="top" className="bg-white border-b border-slate-200">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 lg:pt-10 lg:pb-10">
        {/* Storefront Search & Category Access Layer */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200/80">
          <div className="relative flex-1 max-w-2xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search GATE CS, UPSC Polity, System Design, SSC CGL, author or ISBN..."
              aria-label="Search books by title, exam, author or ISBN"
              className="w-full h-11 pl-10 pr-10 text-sm bg-[#F8F9FB] border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-500 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <div
              role="tablist"
              aria-label="Filter by exam category"
              className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg overflow-x-auto"
            >
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      onSelectCategory(cat);
                      onJumpToCatalog();
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat === 'All' ? 'All Books' : cat}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onOpenWishlist}
              className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-500" />
              <span>Saved</span>
              <span className="font-mono tabular-nums text-slate-500">{wishlistCount}</span>
            </button>

            <button
              type="button"
              onClick={onOpenOrders}
              className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PackageCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Orders</span>
              <span className="font-mono tabular-nums text-slate-500">{ordersCount}</span>
            </button>
          </div>
        </div>

        {/* Storefront Focal Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center py-2">
            <div className="flex items-center gap-4 mb-5">
              <Logo3D size="lg" />
              <div className="text-xs text-slate-500 leading-relaxed">
                <div className="font-semibold text-slate-800 tracking-wide uppercase">
                  Academic &amp; Competitive Book Storefront
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span>2026 Revised Editions</span>
                  <span aria-hidden="true">·</span>
                  <span>Cash on Delivery &amp; UPI</span>
                </div>
              </div>
            </div>

            <h1
              className="font-display font-bold text-slate-900 tracking-tight leading-[1.08] max-w-xl"
              style={{
                fontSize: 'clamp(2.25rem, 3.6vw, 3.35rem)',
                textWrap: 'balance',
              }}
            >
              Authoritative books for GATE, Govt Exams &amp; Tech Interviews.
            </h1>

            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-xl">
              Built for engineering undergraduates, PSU/GATE rankers, UPSC &amp; SSC aspirants,
              and software candidates. Every edition includes verified syllabus mapping,
              table-of-contents previews, and 24-hour dispatch across India.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onJumpToCatalog}
                className="px-6 py-3 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore Book Catalog
              </button>
              <button
                type="button"
                onClick={onJumpToAdvisor}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-800 bg-[#F1F5F9] hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
                <span>AI Study Book Advisor</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[260px] lg:min-h-[380px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src="/src/assets/images/hero_examverse_library_1795251492268.jpg"
                alt="EXAM VERSE engineering textbooks, technical blueprints, and study desk"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4 text-white">
                <div>
                  <p className="text-xs font-medium text-slate-200">
                    2026 Exam Cycle Collection
                  </p>
                  <p className="font-display text-lg font-semibold leading-snug mt-0.5">
                    35-Year Solved Archives &amp; System Design Manuals
                  </p>
                </div>
                <span className="text-xs font-mono tabular-nums bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded">
                  Free Shipping ₹999+
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Storefront Assurance Strip Below Split */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
              Exam Coverage
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">
              GATE · UPSC · SSC · SDE
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
              Student Savings
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">
              Up to 32% Off MRP + ₹150 Pack Bonus
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
              Payment Options
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              Cash on Delivery, UPI &amp; Cards
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
              Dispatch Promise
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              24-Hour Warehouse Fulfillment
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
