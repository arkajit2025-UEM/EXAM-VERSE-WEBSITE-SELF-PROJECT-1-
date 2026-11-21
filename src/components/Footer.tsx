import { Logo3D } from './Logo3D';
import type { ExamCategory } from '../types';

interface FooterProps {
  onSelectCategory: (cat: ExamCategory) => void;
  onScrollToSection: (id: string) => void;
}

export function Footer({ onSelectCategory, onScrollToSection }: FooterProps) {
  function jumpCat(cat: ExamCategory) {
    onSelectCategory(cat);
    onScrollToSection('catalog');
  }

  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <Logo3D size="sm" />
              <span className="font-display text-lg font-bold tracking-tight text-white">
                EXAM VERSE
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Dedicated academic bookstore for GATE, ESE, UPSC, SSC, Banking, and
              Software/Core Engineering job interview preparation guides.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Exam Streams
            </p>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => jumpCat('GATE')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  GATE &amp; ESE Archives
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpCat('Govt Exams')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  UPSC, SSC &amp; Banking
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpCat('Engineering')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Core Engineering Texts
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jumpCat('Interview Prep')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  DSA &amp; System Design
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2.5 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Fulfillment &amp; Support
            </p>
            <ul className="space-y-2 text-slate-400 text-xs leading-relaxed">
              <li>Pan-India Cash on Delivery (COD), UPI &amp; Cards accepted</li>
              <li>Free delivery on orders ₹999+ · ₹150 bonus savings on ₹1,800+</li>
              <li>7-day print defect replacement guarantee</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EXAM VERSE Academic Books. All rights reserved.</p>
          <p>Built for engineering &amp; competitive examination aspirants.</p>
        </div>
      </div>
    </footer>
  );
}
