import type {
  Book,
  CartItem,
  Order,
  Review,
  StudyAdvisorPlan,
} from '../types';

function getSessionId(): string {
  const key = 'examverse_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `ev_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': getSessionId(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export async function fetchBooks(params: {
  q?: string;
  category?: string;
  stream?: string;
  sort?: string;
}): Promise<{ books: Book[]; streams: string[] }> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.category && params.category !== 'All') qs.set('category', params.category);
  if (params.stream && params.stream !== 'All') qs.set('stream', params.stream);
  if (params.sort) qs.set('sort', params.sort);
  const query = qs.toString();
  return apiFetch<{ books: Book[]; streams: string[] }>(`/api/books${query ? `?${query}` : ''}`);
}

export async function fetchBookDetail(slug: string): Promise<{ book: Book; reviews: Review[] }> {
  return apiFetch<{ book: Book; reviews: Review[] }>(`/api/books/${encodeURIComponent(slug)}`);
}

export async function submitBookReview(
  slug: string,
  payload: {
    reviewer_name: string;
    exam_target: string;
    rating: number;
    title: string;
    comment: string;
  }
): Promise<{ book: Book; reviews: Review[] }> {
  return apiFetch<{ book: Book; reviews: Review[] }>(
    `/api/books/${encodeURIComponent(slug)}/reviews`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchCart(): Promise<{ items: CartItem[] }> {
  return apiFetch<{ items: CartItem[] }>('/api/cart');
}

export async function addToCart(
  book_id: number,
  quantity = 1,
  format: 'Paperback' | 'Hardcover + E-Workbook' = 'Paperback'
): Promise<{ items: CartItem[] }> {
  return apiFetch<{ items: CartItem[] }>('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ book_id, quantity, format }),
  });
}

export async function updateCartQuantity(
  id: number,
  quantity: number
): Promise<{ items: CartItem[] }> {
  return apiFetch<{ items: CartItem[] }>(`/api/cart/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(id: number): Promise<{ items: CartItem[] }> {
  return apiFetch<{ items: CartItem[] }>(`/api/cart/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchWishlist(): Promise<{ bookIds: number[] }> {
  return apiFetch<{ bookIds: number[] }>('/api/wishlist');
}

export async function toggleWishlist(book_id: number): Promise<{ bookIds: number[] }> {
  return apiFetch<{ bookIds: number[] }>('/api/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ book_id }),
  });
}

export async function fetchOrders(): Promise<{ orders: Order[] }> {
  return apiFetch<{ orders: Order[] }>('/api/orders');
}

export async function createOrder(payload: {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: 'COD' | 'UPI' | 'Card';
}): Promise<{ order: Order; orders: Order[] }> {
  return apiFetch<{ order: Order; orders: Order[] }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function requestStudyAdvisorPlan(payload: {
  examTarget: string;
  stream: string;
  timelineMonths: number;
  weakAreas: string;
}): Promise<{ plan: StudyAdvisorPlan }> {
  return apiFetch<{ plan: StudyAdvisorPlan }>('/api/ai/study-advisor', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
