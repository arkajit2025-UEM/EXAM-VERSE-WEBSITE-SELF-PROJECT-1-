import { useState } from 'react';
import { BookOpen, Bookmark, Check, ShoppingBag, Star } from 'lucide-react';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  isWishlisted: boolean;
  onToggleWishlist: (bookId: number) => void;
  onAddToCart: (bookId: number) => Promise<void>;
  onOpenDetail: (book: Book) => void;
}

export function BookCard({
  book,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onOpenDetail,
}: BookCardProps) {
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const discountPct = Math.round(((book.mrp - book.price) / book.mrp) * 100);

  async function handleQuickAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (adding || book.stock <= 0) return;
    setAdding(true);
    try {
      await onAddToCart(book.id);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    } finally {
      setAdding(false);
    }
  }

  return (
    <article
      onClick={() => onOpenDetail(book)}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Studio Product Backdrop (~68% visual weight) */}
      <div className="relative aspect-[4/4.6] bg-[#F1F4F8] overflow-hidden p-5 flex items-center justify-center">
        {!imgError ? (
          <img
            src={book.image_url}
            alt={`${book.title} — ${book.edition}`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain rounded-sm transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] text-white p-6 flex flex-col justify-between">
            <BookOpen className="w-8 h-8 text-amber-400" />
            <div>
              <p className="text-xs uppercase tracking-wider text-blue-200">
                {book.exam_category}
              </p>
              <p className="font-display font-semibold text-base mt-1 leading-snug">
                {book.title}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(book.id);
          }}
          aria-label={isWishlisted ? 'Remove from saved books' : 'Save book to wishlist'}
          className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-white/95 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#1E3A8A] transition-colors cursor-pointer"
        >
          <Bookmark
            className={`w-4 h-4 ${isWishlisted ? 'fill-[#1E3A8A] text-[#1E3A8A]' : ''}`}
          />
        </button>

        {book.bestseller_rank <= 3 && (
          <span className="absolute top-3.5 left-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 bg-white/95 px-2 py-0.5 rounded border border-slate-200">
            Top Seller
          </span>
        )}
      </div>

      {/* Uniform Editorial Metadata & Price Baseline */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            <span className="truncate">{book.exam_category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{book.subject_stream}</span>
          </div>

          <h3 className="mt-1.5 font-display text-base font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#1E3A8A] transition-colors">
            {book.title}
          </h3>

          <p className="mt-1 text-xs text-slate-500 truncate">
            {book.author} · {book.edition}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-semibold text-slate-900 tabular-nums">
                ₹{book.price}
              </span>
              <span className="font-mono text-xs text-slate-400 line-through tabular-nums">
                ₹{book.mrp}
              </span>
              <span className="font-mono text-xs font-medium text-emerald-700 tabular-nums">
                {discountPct}% off
              </span>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="font-mono font-medium tabular-nums text-slate-800">
                {book.rating.toFixed(1)}
              </span>
              <span className="text-slate-400 tabular-nums">
                ({book.review_count})
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className={book.stock > 0 ? 'text-slate-500' : 'text-rose-600'}>
                {book.stock > 0 ? 'In Stock' : 'Sold Out'}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={adding || book.stock <= 0}
            onClick={handleQuickAdd}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-[#1E3A8A] hover:bg-[#172554] text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{adding ? 'Adding...' : 'Add to Bag'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
