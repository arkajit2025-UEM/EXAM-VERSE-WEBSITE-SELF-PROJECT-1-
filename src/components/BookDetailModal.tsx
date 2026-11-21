import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  Check,
  ShieldCheck,
  Star,
  Truck,
  X,
} from 'lucide-react';
import { fetchBookDetail, submitBookReview } from '../lib/api';
import type { Book, Review } from '../types';

interface BookDetailModalProps {
  book: Book | null;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (bookId: number) => void;
  onAddToCart: (
    bookId: number,
    format: 'Paperback' | 'Hardcover + E-Workbook'
  ) => Promise<void>;
  onBuyNow: (
    bookId: number,
    format: 'Paperback' | 'Hardcover + E-Workbook'
  ) => Promise<void>;
  onBookUpdated: (updatedBook: Book) => void;
}

export function BookDetailModal({
  book,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onBookUpdated,
}: BookDetailModalProps) {
  const [detailBook, setDetailBook] = useState<Book | null>(book);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [format, setFormat] = useState<'Paperback' | 'Hardcover + E-Workbook'>('Paperback');
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Review form
  const [reviewerName, setReviewerName] = useState('');
  const [examTarget, setExamTarget] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!book) {
      setDetailBook(null);
      setReviews([]);
      return;
    }
    setDetailBook(book);
    setFormat('Paperback');
    setImgError(false);
    setReviewMessage(null);
    setLoadingDetail(true);

    fetchBookDetail(book.slug)
      .then((res) => {
        setDetailBook(res.book);
        setReviews(res.reviews);
      })
      .catch(() => {})
      .finally(() => setLoadingDetail(false));
  }, [book]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (book) {
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }
  }, [book, onClose]);

  if (!book || !detailBook) return null;

  const activePrice =
    format === 'Hardcover + E-Workbook' ? detailBook.price + 180 : detailBook.price;
  const activeMrp =
    format === 'Hardcover + E-Workbook' ? detailBook.mrp + 250 : detailBook.mrp;
  const savings = activeMrp - activePrice;

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!detailBook) return;
    setSubmittingReview(true);
    setReviewMessage(null);
    try {
      const res = await submitBookReview(detailBook.slug, {
        reviewer_name: reviewerName,
        exam_target: examTarget,
        rating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setDetailBook(res.book);
      setReviews(res.reviews);
      onBookUpdated(res.book);
      setReviewerName('');
      setExamTarget('');
      setRating(5);
      setReviewTitle('');
      setReviewComment('');
      setReviewMessage('Review published and verified.');
    } catch (err: any) {
      setReviewMessage(err?.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex items-start justify-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={detailBook.title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-4"
      >
        {/* Top Modal Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-[#F8F9FB]">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 truncate">
            <span>{detailBook.exam_category}</span>
            <span aria-hidden="true">/</span>
            <span>{detailBook.subject_stream}</span>
            <span aria-hidden="true">/</span>
            <span className="font-mono text-slate-500">ISBN {detailBook.isbn}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close book details"
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sticky Studio Image & Tech Specs */}
          <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-5">
            <div className="aspect-[3/3.6] bg-[#F1F4F8] rounded-xl border border-slate-200 p-6 flex items-center justify-center">
              {!imgError ? (
                <img
                  src={detailBook.image_url}
                  alt={detailBook.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-contain rounded"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-[#1E3A8A] text-white p-6 flex flex-col justify-between">
                  <BookOpen className="w-10 h-10 text-amber-400" />
                  <p className="font-display text-lg font-semibold">{detailBook.title}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border border-slate-200 rounded-xl p-4 bg-[#F8F9FB]">
              <div>
                <p className="text-slate-500">Publisher</p>
                <p className="font-semibold text-slate-900 mt-0.5">{detailBook.publisher}</p>
              </div>
              <div>
                <p className="text-slate-500">Edition &amp; Year</p>
                <p className="font-semibold text-slate-900 mt-0.5 tabular-nums">
                  {detailBook.edition} ({detailBook.year})
                </p>
              </div>
              <div>
                <p className="text-slate-500">Page Count</p>
                <p className="font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
                  {detailBook.pages} pages
                </p>
              </div>
              <div>
                <p className="text-slate-500">Language</p>
                <p className="font-semibold text-slate-900 mt-0.5">{detailBook.language}</p>
              </div>
            </div>
          </div>

          {/* Right Contiguous Purchase Module & Syllabus Preview */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
                <span>{detailBook.exam_category}</span>
                <span aria-hidden="true">·</span>
                <span>{detailBook.subject_stream}</span>
              </div>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {detailBook.title}
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">{detailBook.subtitle}</p>
              <p className="mt-2 text-xs text-slate-500">
                By <span className="font-semibold text-slate-800">{detailBook.author}</span>
              </p>

              <div className="mt-3 flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1 font-mono font-semibold text-slate-900 tabular-nums">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {detailBook.rating.toFixed(1)}
                </span>
                <span className="text-slate-500 text-xs tabular-nums">
                  {detailBook.review_count} verified student reviews
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-xs font-medium text-emerald-700 tabular-nums">
                  {detailBook.stock > 0
                    ? `In Stock (${detailBook.stock} copies ready)`
                    : 'Currently Out of Stock'}
                </span>
              </div>
            </div>

            {/* Pricing & Format Selector */}
            <div className="p-5 rounded-xl border border-slate-200 bg-[#F8F9FB] space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                  ₹{activePrice}
                </span>
                <span className="font-mono text-sm text-slate-400 line-through tabular-nums">
                  ₹{activeMrp}
                </span>
                <span className="text-xs font-semibold text-emerald-700 tabular-nums">
                  Save ₹{savings}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Select Format</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(['Paperback', 'Hardcover + E-Workbook'] as const).map((opt) => {
                    const selected = format === opt;
                    const priceForOpt =
                      opt === 'Hardcover + E-Workbook'
                        ? detailBook.price + 180
                        : detailBook.price;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFormat(opt)}
                        className={`p-3 text-left rounded-lg border transition-colors cursor-pointer ${
                          selected
                            ? 'bg-white border-[#1E3A8A] ring-1 ring-[#1E3A8A]'
                            : 'bg-white/70 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-semibold text-slate-900">{opt}</div>
                        <div className="font-mono text-xs text-slate-600 mt-0.5 tabular-nums">
                          ₹{priceForOpt}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={adding || detailBook.stock <= 0}
                  onClick={async () => {
                    setAdding(true);
                    try {
                      await onAddToCart(detailBook.id, format);
                    } finally {
                      setAdding(false);
                    }
                  }}
                  className="flex-1 min-w-[160px] py-3 px-5 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {adding ? 'Adding to Bag...' : 'Add to Bag'}
                </button>
                <button
                  type="button"
                  disabled={adding || detailBook.stock <= 0}
                  onClick={async () => {
                    setAdding(true);
                    try {
                      await onBuyNow(detailBook.id, format);
                    } finally {
                      setAdding(false);
                    }
                  }}
                  className="flex-1 min-w-[160px] py-3 px-5 text-sm font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Buy Now (COD / UPI)
                </button>
                <button
                  type="button"
                  onClick={() => onToggleWishlist(detailBook.id)}
                  aria-label="Toggle saved book"
                  className="h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-[#1E3A8A] flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      isWishlisted ? 'fill-[#1E3A8A] text-[#1E3A8A]' : ''
                    }`}
                  />
                  <span>{isWishlisted ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-slate-200/80 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-500" />
                  Free delivery on ₹999+
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  Cash on Delivery &amp; 7-day print replacement
                </span>
              </div>
            </div>

            {/* Synopsis & Key Highlights */}
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                About This Edition
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {detailBook.description}
              </p>
              <ul className="mt-3 space-y-1.5">
                {detailBook.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Look Inside: Table of Contents */}
            <div className="border-t border-slate-200 pt-5">
              <h3 className="font-display text-base font-semibold text-slate-900">
                Table of Contents Preview
              </h3>
              <div className="mt-3 divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {detailBook.toc.map((chap) => (
                  <div
                    key={chap.chapter}
                    className="px-4 py-2.5 bg-white flex items-center justify-between gap-4 text-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-semibold text-[#1E3A8A] tabular-nums">
                        {chap.chapter}
                      </span>
                      <span className="text-slate-800 truncate">{chap.title}</span>
                    </div>
                    <span className="font-mono text-xs text-slate-500 tabular-nums shrink-0">
                      pp. {chap.pages}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Student Reviews & Write Review */}
            <div className="border-t border-slate-200 pt-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Verified Student Reviews
                </h3>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {reviews.length} total
                </span>
              </div>

              {loadingDetail ? (
                <p className="text-xs text-slate-500">Loading reviews...</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl border border-slate-200 bg-[#F8F9FB]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-900">
                            {rev.reviewer_name}
                          </span>
                          <span aria-hidden="true" className="mx-1.5">·</span>
                          <span>{rev.exam_target}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-800 tabular-nums">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {rev.rating}.0
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-slate-900">
                        {rev.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={handleReviewSubmit}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Add Your Review
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    required
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Your full name"
                    className="h-10 px-3 text-xs bg-[#F8F9FB] border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                  <input
                    required
                    type="text"
                    value={examTarget}
                    onChange={(e) => setExamTarget(e.target.value)}
                    placeholder="Exam target (e.g. GATE CS 2027)"
                    className="h-10 px-3 text-xs bg-[#F8F9FB] border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                  <select
                    aria-label="Rating"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="h-10 px-3 text-xs bg-[#F8F9FB] border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    <option value={5}>5 Stars — Excellent</option>
                    <option value={4}>4 Stars — Very Good</option>
                    <option value={3}>3 Stars — Good</option>
                    <option value={2}>2 Stars — Fair</option>
                    <option value={1}>1 Star — Needs Improvement</option>
                  </select>
                </div>
                <input
                  required
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Headline summary of your review"
                  className="w-full h-10 px-3 text-xs bg-[#F8F9FB] border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
                <textarea
                  required
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share how this edition helped your syllabus prep or practice accuracy..."
                  className="w-full p-3 text-xs bg-[#F8F9FB] border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-600">{reviewMessage || ''}</span>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Publish Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
