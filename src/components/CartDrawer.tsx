import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { createOrder } from '../lib/api';
import type { Book, CartItem, Order } from '../types';

export type DrawerTab = 'bag' | 'saved' | 'orders';

interface CartDrawerProps {
  open: boolean;
  initialTab: DrawerTab;
  startInCheckout?: boolean;
  cartItems: CartItem[];
  wishlistBooks: Book[];
  orders: Order[];
  onClose: () => void;
  onUpdateQty: (id: number, quantity: number) => Promise<void>;
  onRemoveItem: (id: number) => Promise<void>;
  onMoveWishlistToBag: (bookId: number) => Promise<void>;
  onRemoveWishlist: (bookId: number) => void;
  onOrderCreated: (order: Order, allOrders: Order[]) => void;
}

export function CartDrawer({
  open,
  initialTab,
  startInCheckout = false,
  cartItems,
  wishlistBooks,
  orders,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onMoveWishlistToBag,
  onRemoveWishlist,
  onOrderCreated,
}: CartDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>(initialTab);
  const [checkoutMode, setCheckoutMode] = useState(startInCheckout);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Checkout Form Fields
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'Card'>('COD');

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      setCheckoutMode(Boolean(startInCheckout));
      setConfirmedOrder(null);
      setCheckoutError(null);
    }
  }, [open, initialTab, startInCheckout]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [open, onClose]);

  if (!open) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 60;
  const bundleDiscount = subtotal >= 1800 ? 150 : 0;
  const total = subtotal + shipping - bundleDiscount;
  const freeShippingRemaining = Math.max(0, 999 - subtotal);

  async function handleCheckoutSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setCheckoutError(null);
    try {
      const res = await createOrder({
        customer_name: customerName,
        email,
        phone,
        address,
        city,
        state: stateName,
        pincode,
        payment_method: paymentMethod,
      });
      setConfirmedOrder(res.order);
      setCheckoutMode(false);
      onOrderCreated(res.order, res.orders);
    } catch (err: any) {
      setCheckoutError(err?.message || 'Unable to confirm order.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag, saved books and orders"
        className="relative z-10 w-full max-w-md bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-[#F8F9FB]">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            {(
              [
                { key: 'bag', label: `Bag (${cartItems.reduce((s, i) => s + i.quantity, 0)})` },
                { key: 'saved', label: `Saved (${wishlistBooks.length})` },
                { key: 'orders', label: `Orders (${orders.length})` },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setActiveTab(t.key);
                  setCheckoutMode(false);
                  setConfirmedOrder(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === t.key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Confirmed Order Receipt */}
          {activeTab === 'bag' && confirmedOrder ? (
            <div className="space-y-5">
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Order #{confirmedOrder.order_number} Confirmed</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Preparing shipment for {confirmedOrder.customer_name}. Dispatched within 24
                  hours to {confirmedOrder.city}, {confirmedOrder.state} ({confirmedOrder.pincode}).
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                <p className="font-semibold text-slate-900 uppercase tracking-wider">
                  Order Receipt Summary
                </p>
                <div className="divide-y divide-slate-100">
                  {confirmedOrder.items.map((item, i) => (
                    <div key={i} className="py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{item.title}</p>
                        <p className="text-slate-500">
                          {item.format} · Qty {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums shrink-0">
                        ₹{item.unit_price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-semibold text-sm text-slate-900">
                  <span>Total ({confirmedOrder.payment_method})</span>
                  <span className="font-mono tabular-nums">₹{confirmedOrder.total}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  setActiveTab('orders');
                }}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172554] cursor-pointer"
              >
                View All Orders
              </button>
            </div>
          ) : activeTab === 'bag' && checkoutMode ? (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setCheckoutMode(false)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Bag</span>
              </button>

              <h3 className="font-display text-lg font-bold text-slate-900">
                Delivery &amp; Payment Details
              </h3>

              {checkoutError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {checkoutError}
                </div>
              )}

              <div className="space-y-3">
                <input
                  required
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full h-10 px-3 text-sm bg-[#F8F9FB] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full h-10 px-3 text-sm bg-[#F8F9FB] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit Mobile"
                    className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-[#F8F9FB] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Hostel / Street Address & Landmark"
                  className="w-full p-3 text-sm bg-[#F8F9FB] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
                />
                <div className="grid grid-cols-3 gap-2.5">
                  <input
                    required
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full h-10 px-3 text-sm bg-[#F8F9FB] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                  <input
                    required
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="State"
                    className="w-full h-10 px-3 text-sm bg-[#F8F9FB] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                  <input
                    required
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="PIN Code"
                    className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-[#F8F9FB] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'COD', label: 'Cash on Delivery' },
                      { id: 'UPI', label: 'UPI / QR' },
                      { id: 'Card', label: 'Debit / Credit' },
                    ] as const
                  ).map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`py-2.5 px-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        paymentMethod === pm.id
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                          : 'bg-[#F8F9FB] text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FB] border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className="font-mono tabular-nums">
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {bundleDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Student Pack Bonus</span>
                    <span className="font-mono tabular-nums">-₹{bundleDiscount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>Amount Payable</span>
                  <span className="font-mono tabular-nums">₹{total}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Confirming Order...' : `Place Order — ₹${total}`}
              </button>
            </form>
          ) : activeTab === 'bag' ? (
            cartItems.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Your study bag is empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Add GATE guides, government exam compendiums, or interview manuals from
                  the catalog to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[#F8F9FB] border border-slate-200 text-xs text-slate-700">
                  {freeShippingRemaining > 0 ? (
                    <span>
                      Add <strong className="font-mono tabular-nums">₹{freeShippingRemaining}</strong>{' '}
                      more for Free Pan-India Delivery.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">
                      Free Pan-India Delivery unlocked on this order.
                    </span>
                  )}
                </div>

                <div className="divide-y divide-slate-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-4 flex gap-3.5">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-20 object-cover rounded border border-slate-200 shrink-0 bg-[#F1F4F8]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.format}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                            ₹{item.price * item.quantity}
                          </span>
                          <div className="inline-flex items-center gap-1 border border-slate-200 rounded-lg bg-white">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-mono text-xs font-semibold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            type="button"
                            aria-label="Remove item"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : activeTab === 'saved' ? (
            wishlistBooks.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-display text-base font-semibold text-slate-900">
                  No saved books yet
                </h3>
                <p className="text-xs text-slate-500">
                  Bookmark textbooks while comparing syllabus coverage to revisit them here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {wishlistBooks.map((book) => (
                  <div key={book.id} className="py-4 flex gap-3.5 items-start">
                    <img
                      src={book.image_url}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-18 object-cover rounded border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">
                        {book.exam_category}
                      </p>
                      <p className="font-display text-sm font-semibold text-slate-900 line-clamp-2">
                        {book.title}
                      </p>
                      <p className="font-mono text-sm font-bold text-slate-900 mt-1 tabular-nums">
                        ₹{book.price}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onMoveWishlistToBag(book.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded-md hover:bg-[#172554] cursor-pointer"
                        >
                          Move to Bag
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveWishlist(book.id)}
                          className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-rose-600 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : orders.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-display text-base font-semibold text-slate-900">
                No past orders
              </h3>
              <p className="text-xs text-slate-500">
                Confirmed orders and COD/UPI receipts will appear here for tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-slate-200 bg-[#F8F9FB] space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      #{order.order_number}
                    </span>
                    <span className="font-semibold text-emerald-700">{order.status}</span>
                  </div>
                  <p className="text-slate-600">
                    {order.customer_name} · {order.city}, {order.state} ({order.payment_method})
                  </p>
                  <div className="border-t border-slate-200 pt-2 space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between gap-2 text-slate-700">
                        <span className="truncate">
                          {item.quantity}× {item.title}
                        </span>
                        <span className="font-mono tabular-nums shrink-0">
                          ₹{item.unit_price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                    <span>Total Paid</span>
                    <span className="font-mono tabular-nums">₹{order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Bag Footer */}
        {activeTab === 'bag' && !checkoutMode && !confirmedOrder && cartItems.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-[#F8F9FB] space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="font-mono tabular-nums">
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {bundleDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>₹1,800+ Student Pack Discount</span>
                  <span className="font-mono tabular-nums">-₹{bundleDiscount}</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Total</span>
                <span className="font-mono tabular-nums">₹{total}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCheckoutMode(true)}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
