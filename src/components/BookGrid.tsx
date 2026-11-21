import { ArrowUpDown, RotateCcw } from 'lucide-react';
import type { Book, ExamCategory } from '../types';
import { BookCard } from './BookCard';

interface BookGridProps {
  books: Book[];
  loading: boolean;
  error: string | null;
  selectedCategory: ExamCategory;
  selectedStream: string;
  streams: string[];
  sortBy: string;
  searchQuery: string;
  wishlistIds: number[];
  onStreamChange: (stream: string) => void;
  onSortChange: (sort: string) => void;
  onResetFilters: () => void;
  onToggleWishlist: (bookId: number) => void;
  onAddToCart: (bookId: number) => Promise<void>;
  onOpenDetail: (book: Book) => void;
}

export function BookGrid({
  books,
  loading,
  error,
  selectedCategory,
  selectedStream,
  streams,
  sortBy,
  searchQuery,
  wishlistIds,
  onStreamChange,
  onSortChange,
  onResetFilters,
  onToggleWishlist,
  onAddToCart,
  onOpenDetail,
}: BookGridProps) {
  const hasFilters =
    selectedCategory !== 'All' || selectedStream !== 'All' || searchQuery.trim() !== '';

  return (
    <section id="catalog" className="py-12 lg:py-16">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Catalog Header & Stream/Sort Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Verified Print &amp; Workbook Editions
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {selectedCategory === 'All'
                ? 'Exam Preparation Catalog'
                : `${selectedCategory} Guides & Manuals`}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono tabular-nums text-slate-500 mr-1">
              {books.length} {books.length === 1 ? 'edition' : 'editions'}
            </span>

            <select
              aria-label="Filter by subject stream"
              value={selectedStream}
              onChange={(e) => onStreamChange(e.target.value)}
              className="h-10 px-3 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="All">All Subject Streams</option>
              {streams.map((stream) => (
                <option key={stream} value={stream}>
                  {stream}
                </option>
              ))}
            </select>

            <div className="relative inline-flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                aria-label="Sort catalog"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="h-10 pl-8 pr-4 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="featured">Sort: Bestsellers</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading, Error, Empty, and 3-Column Product Grid */}
        {error ? (
          <div className="bg-white border border-rose-200 rounded-xl p-8 text-center">
            <p className="text-sm font-medium text-rose-700">{error}</p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg cursor-pointer"
            >
              Retry Loading Catalog
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/4.6] bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-1/2 bg-slate-100 rounded" />
                  <div className="h-5 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded" />
                  <div className="h-9 w-full bg-slate-100 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <h3 className="font-display text-lg font-semibold text-slate-900">
              No books match those filters
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Try clearing your search term or switching back to all exam streams.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-5 px-5 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] transition-colors cursor-pointer"
            >
              Show All Editions
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isWishlisted={wishlistIds.includes(book.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
