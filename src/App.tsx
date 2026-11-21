import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookDetailModal } from './components/BookDetailModal';
import { BookGrid } from './components/BookGrid';
import { CartDrawer, type DrawerTab } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StudyAdvisorSection } from './components/StudyAdvisorSection';
import {
  addToCart,
  fetchBooks,
  fetchCart,
  fetchOrders,
  fetchWishlist,
  removeCartItem,
  toggleWishlist,
  updateCartQuantity,
} from './lib/api';
import type { Book, CartItem, ExamCategory, Order } from './types';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [allBooksIndex, setAllBooksIndex] = useState<Book[]>([]);
  const [streams, setStreams] = useState<string[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory>('All');
  const [selectedStream, setSelectedStream] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  // Persistent Commerce State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Overlays
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('bag');
  const [drawerStartCheckout, setDrawerStartCheckout] = useState(false);

  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    setCatalogError(null);
    try {
      const res = await fetchBooks({
        q: searchQuery,
        category: selectedCategory,
        stream: selectedStream,
        sort: sortBy,
      });
      setBooks(res.books);
      setStreams(res.streams);
      if (
        searchQuery === '' &&
        selectedCategory === 'All' &&
        selectedStream === 'All'
      ) {
        setAllBooksIndex(res.books);
      }
    } catch (err: any) {
      setCatalogError(err?.message || 'Could not load catalog.');
    } finally {
      setLoadingCatalog(false);
    }
  }, [searchQuery, selectedCategory, selectedStream, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCatalog();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadCatalog]);

  useEffect(() => {
    Promise.all([fetchCart(), fetchWishlist(), fetchOrders()])
      .then(([cartRes, wishRes, ordRes]) => {
        setCartItems(cartRes.items);
        setWishlistIds(wishRes.bookIds);
        setOrders(ordRes.orders);
      })
      .catch(() => {});
  }, []);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const wishlistBooks = useMemo(() => {
    const pool = allBooksIndex.length > 0 ? allBooksIndex : books;
    return pool.filter((b) => wishlistIds.includes(b.id));
  }, [allBooksIndex, books, wishlistIds]);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async function handleAddToCart(
    bookId: number,
    format: 'Paperback' | 'Hardcover + E-Workbook' = 'Paperback'
  ) {
    const res = await addToCart(bookId, 1, format);
    setCartItems(res.items);
  }

  async function handleBuyNow(
    bookId: number,
    format: 'Paperback' | 'Hardcover + E-Workbook' = 'Paperback'
  ) {
    const res = await addToCart(bookId, 1, format);
    setCartItems(res.items);
    setActiveBook(null);
    setDrawerTab('bag');
    setDrawerStartCheckout(true);
    setDrawerOpen(true);
  }

  async function handleAddMultipleToCart(bookIds: number[]) {
    let latestItems = cartItems;
    for (const id of bookIds) {
      const res = await addToCart(id, 1, 'Paperback');
      latestItems = res.items;
    }
    setCartItems(latestItems);
    setDrawerTab('bag');
    setDrawerStartCheckout(false);
    setDrawerOpen(true);
  }

  async function handleToggleWishlist(bookId: number) {
    const res = await toggleWishlist(bookId);
    setWishlistIds(res.bookIds);
  }

  async function handleUpdateQty(id: number, quantity: number) {
    const res = await updateCartQuantity(id, quantity);
    setCartItems(res.items);
  }

  async function handleRemoveCartItem(id: number) {
    const res = await removeCartItem(id);
    setCartItems(res.items);
  }

  function handleBookUpdated(updated: Book) {
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setAllBooksIndex((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  function handleResetFilters() {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStream('All');
    setSortBy('featured');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] text-slate-900">
      <Header
        cartCount={cartCount}
        onOpenCart={() => {
          setDrawerTab('bag');
          setDrawerStartCheckout(false);
          setDrawerOpen(true);
        }}
        onSelectCategory={setSelectedCategory}
        onScrollToSection={scrollToSection}
      />

      <main className="flex-1">
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
          }}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          wishlistCount={wishlistIds.length}
          ordersCount={orders.length}
          onOpenWishlist={() => {
            setDrawerTab('saved');
            setDrawerStartCheckout(false);
            setDrawerOpen(true);
          }}
          onOpenOrders={() => {
            setDrawerTab('orders');
            setDrawerStartCheckout(false);
            setDrawerOpen(true);
          }}
          onJumpToAdvisor={() => scrollToSection('study-advisor')}
          onJumpToCatalog={() => scrollToSection('catalog')}
        />

        <BookGrid
          books={books}
          loading={loadingCatalog}
          error={catalogError}
          selectedCategory={selectedCategory}
          selectedStream={selectedStream}
          streams={streams}
          sortBy={sortBy}
          searchQuery={searchQuery}
          wishlistIds={wishlistIds}
          onStreamChange={setSelectedStream}
          onSortChange={setSortBy}
          onResetFilters={handleResetFilters}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={(bookId) => handleAddToCart(bookId, 'Paperback')}
          onOpenDetail={setActiveBook}
        />

        <StudyAdvisorSection
          onAddMultipleToCart={handleAddMultipleToCart}
          onOpenDetail={setActiveBook}
        />
      </main>

      <Footer
        onSelectCategory={setSelectedCategory}
        onScrollToSection={scrollToSection}
      />

      <BookDetailModal
        book={activeBook}
        isWishlisted={activeBook ? wishlistIds.includes(activeBook.id) : false}
        onClose={() => setActiveBook(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onBookUpdated={handleBookUpdated}
      />

      <CartDrawer
        open={drawerOpen}
        initialTab={drawerTab}
        startInCheckout={drawerStartCheckout}
        cartItems={cartItems}
        wishlistBooks={wishlistBooks}
        orders={orders}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerStartCheckout(false);
        }}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveCartItem}
        onMoveWishlistToBag={async (bookId) => {
          await handleAddToCart(bookId, 'Paperback');
          setDrawerTab('bag');
        }}
        onRemoveWishlist={handleToggleWishlist}
        onOrderCreated={(_order, allOrders) => {
          setOrders(allOrders);
          setCartItems([]);
          loadCatalog();
        }}
      />
    </div>
  );
}
