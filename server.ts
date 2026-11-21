import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  db,
  getBookBySlug,
  getReviewsByBookId,
  hydrateBook,
  initDatabase,
  listOrdersBySession,
} from './server/db';
import { generateStudyBookPlan } from './server/gemini';
import type { OrderItemSummary } from './src/types';

initDatabase();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  function getSessionId(req: express.Request): string {
    const headerId = req.header('x-session-id');
    if (headerId && /^[a-zA-Z0-9_-]{6,64}$/.test(headerId)) {
      return headerId;
    }
    return 'guest-default-session';
  }

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'exam-verse-api' });
  });

  // Catalog listing with search, category, stream, and sorting
  app.get('/api/books', (req, res) => {
    try {
      const q = String(req.query.q || '').trim().toLowerCase();
      const category = String(req.query.category || 'All').trim();
      const stream = String(req.query.stream || 'All').trim();
      const sort = String(req.query.sort || 'featured').trim();
      const maxPrice = Number(req.query.maxPrice || 0);

      const conditions: string[] = [];
      const params: Record<string, string | number> = {};

      if (category && category !== 'All') {
        conditions.push('exam_category = @category');
        params.category = category;
      }
      if (stream && stream !== 'All') {
        conditions.push('subject_stream = @stream');
        params.stream = stream;
      }
      if (maxPrice > 0) {
        conditions.push('price <= @maxPrice');
        params.maxPrice = maxPrice;
      }
      if (q) {
        conditions.push(
          '(LOWER(title) LIKE @q OR LOWER(subtitle) LIKE @q OR LOWER(author) LIKE @q OR LOWER(subject_stream) LIKE @q OR LOWER(exam_category) LIKE @q OR LOWER(description) LIKE @q)'
        );
        params.q = `%${q}%`;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      let orderBy = 'bestseller_rank ASC';
      if (sort === 'price_asc') orderBy = 'price ASC';
      else if (sort === 'price_desc') orderBy = 'price DESC';
      else if (sort === 'rating') orderBy = 'rating DESC, review_count DESC';

      const rows = db.prepare(`SELECT * FROM books ${whereClause} ORDER BY ${orderBy}`).all(params) as any[];
      const books = rows.map(hydrateBook);

      const streamsRows = db
        .prepare('SELECT DISTINCT subject_stream FROM books ORDER BY subject_stream ASC')
        .all() as Array<{ subject_stream: string }>;

      res.json({
        books,
        streams: streamsRows.map((s) => s.subject_stream),
      });
    } catch (err) {
      console.error('Error fetching books:', err);
      res.status(500).json({ error: 'Failed to load books catalog.' });
    }
  });

  // Single book detail + reviews
  app.get('/api/books/:slug', (req, res) => {
    try {
      const book = getBookBySlug(req.params.slug);
      if (!book) {
        return res.status(404).json({ error: 'Book not found.' });
      }
      const reviews = getReviewsByBookId(book.id);
      res.json({ book, reviews });
    } catch (err) {
      console.error('Error fetching book detail:', err);
      res.status(500).json({ error: 'Failed to fetch book details.' });
    }
  });

  // Submit verified review persisted to SQLite
  app.post('/api/books/:slug/reviews', (req, res) => {
    try {
      const book = getBookBySlug(req.params.slug);
      if (!book) {
        return res.status(404).json({ error: 'Book not found.' });
      }
      const { reviewer_name, exam_target, rating, title, comment } = req.body || {};
      const parsedRating = Number(rating);
      if (
        !reviewer_name ||
        !exam_target ||
        !title ||
        !comment ||
        Number.isNaN(parsedRating) ||
        parsedRating < 1 ||
        parsedRating > 5
      ) {
        return res.status(400).json({ error: 'Please complete all review fields with a 1-5 rating.' });
      }

      const tx = db.transaction(() => {
        db.prepare(
          `INSERT INTO reviews (book_id, reviewer_name, exam_target, rating, title, comment, verified_purchase)
           VALUES (?, ?, ?, ?, ?, ?, 1)`
        ).run(
          book.id,
          String(reviewer_name).trim().slice(0, 80),
          String(exam_target).trim().slice(0, 80),
          parsedRating,
          String(title).trim().slice(0, 140),
          String(comment).trim().slice(0, 800)
        );

        const stats = db
          .prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM reviews WHERE book_id = ?')
          .get(book.id) as { avg_rating: number; cnt: number };

        const rounded = Math.round((stats.avg_rating || 4.8) * 10) / 10;
        db.prepare('UPDATE books SET rating = ?, review_count = ? WHERE id = ?').run(
          rounded,
          stats.cnt,
          book.id
        );
      });

      tx();
      const updatedBook = getBookBySlug(req.params.slug);
      const reviews = getReviewsByBookId(book.id);
      res.status(201).json({ book: updatedBook, reviews });
    } catch (err) {
      console.error('Error submitting review:', err);
      res.status(500).json({ error: 'Could not save your review.' });
    }
  });

  // Cart endpoints
  function fetchCartForSession(sessionId: string) {
    return db
      .prepare(
        `SELECT c.id, c.book_id, c.quantity, c.format,
                b.title, b.slug, b.author, b.exam_category, b.subject_stream,
                CASE WHEN c.format = 'Hardcover + E-Workbook' THEN b.price + 180 ELSE b.price END as price,
                CASE WHEN c.format = 'Hardcover + E-Workbook' THEN b.mrp + 250 ELSE b.mrp END as mrp,
                b.stock, b.image_url
         FROM cart_items c
         JOIN books b ON b.id = c.book_id
         WHERE c.session_id = ?
         ORDER BY c.id DESC`
      )
      .all(sessionId);
  }

  app.get('/api/cart', (req, res) => {
    try {
      const sessionId = getSessionId(req);
      res.json({ items: fetchCartForSession(sessionId) });
    } catch (err) {
      console.error('Error loading cart:', err);
      res.status(500).json({ error: 'Failed to load cart.' });
    }
  });

  app.post('/api/cart', (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const bookId = Number(req.body?.book_id);
      const quantity = Math.max(1, Math.min(10, Number(req.body?.quantity || 1)));
      const format =
        req.body?.format === 'Hardcover + E-Workbook'
          ? 'Hardcover + E-Workbook'
          : 'Paperback';

      const book = db.prepare('SELECT id, stock FROM books WHERE id = ?').get(bookId) as
        | { id: number; stock: number }
        | undefined;
      if (!book) {
        return res.status(404).json({ error: 'Book not found.' });
      }
      if (book.stock <= 0) {
        return res.status(400).json({ error: 'This edition is currently out of stock.' });
      }

      db.prepare(
        `INSERT INTO cart_items (session_id, book_id, quantity, format)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(session_id, book_id, format)
         DO UPDATE SET quantity = MIN(10, cart_items.quantity + excluded.quantity)`
      ).run(sessionId, bookId, quantity, format);

      res.json({ items: fetchCartForSession(sessionId) });
    } catch (err) {
      console.error('Error adding to cart:', err);
      res.status(500).json({ error: 'Could not add item to bag.' });
    }
  });

  app.patch('/api/cart/:id', (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const itemId = Number(req.params.id);
      const quantity = Number(req.body?.quantity);
      if (Number.isNaN(quantity)) {
        return res.status(400).json({ error: 'Invalid quantity.' });
      }
      if (quantity <= 0) {
        db.prepare('DELETE FROM cart_items WHERE id = ? AND session_id = ?').run(itemId, sessionId);
      } else {
        db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND session_id = ?').run(
          Math.min(10, quantity),
          itemId,
          sessionId
        );
      }
      res.json({ items: fetchCartForSession(sessionId) });
    } catch (err) {
      console.error('Error updating cart:', err);
      res.status(500).json({ error: 'Could not update bag item.' });
    }
  });

  app.delete('/api/cart/:id', (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const itemId = Number(req.params.id);
      db.prepare('DELETE FROM cart_items WHERE id = ? AND session_id = ?').run(itemId, sessionId);
      res.json({ items: fetchCartForSession(sessionId) });
    } catch (err) {
      console.error('Error removing cart item:', err);
      res.status(500).json({ error: 'Could not remove bag item.' });
    }
  });

  // Wishlist endpoints
  app.get('/api/wishlist', (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const rows = db
        .prepare('SELECT book_id FROM wishlist_items WHERE session_id = ?')
        .all(sessionId) as Array<{ book_id: number }>;
      res.json({ bookIds: rows.map((r) => r.book_id) });
    } catch (err) {
      console.error('Error loading wishlist:', err);
      res.status(500).json({ error: 'Failed to load saved books.' });
    }
  });

  app.post('/api/wishlist/toggle', (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const bookId = Number(req.body?.book_id);
      const existing = db
        .prepare('SELECT id FROM wishlist_items WHERE session_id = ? AND book_id = ?')
        .get(sessionId, bookId);
      if (existing) {
        db.prepare('DELETE FROM wishlist_items WHERE session_id = ? AND book_id = ?').run(
          sessionId,
          bookId
        );
      } else {
        db.prepare('INSERT OR IGNORE INTO wishlist_items (session_id, book_id) VALUES (?, ?)').run(
          sessionId,
          bookId
        );
      }
      const rows = db
        .prepare('SELECT book_id FROM wishlist_items WHERE session_id = ?')
        .all(sessionId) as Array<{ book_id: number }>;
      res.json({ bookIds: rows.map((r) => r.book_id) });
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      res.status(500).json({ error: 'Failed to update saved books.' });
    }
  });

  // Orders & Checkout
  app.get('/api/orders', (req, res) => {
    try {
      const sessionId = getSessionId(req);
      res.json({ orders: listOrdersBySession(sessionId) });
    } catch (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: 'Failed to load orders.' });
    }
  });

  app.post('/api/orders', (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const { customer_name, email, phone, address, city, state, pincode, payment_method } =
        req.body || {};

      if (
        !customer_name ||
        !email ||
        !phone ||
        !address ||
        !city ||
        !state ||
        !pincode ||
        !['COD', 'UPI', 'Card'].includes(payment_method)
      ) {
        return res.status(400).json({ error: 'Please complete all delivery and payment fields.' });
      }

      const cartItems = fetchCartForSession(sessionId) as Array<{
        id: number;
        book_id: number;
        quantity: number;
        format: string;
        title: string;
        author: string;
        price: number;
        mrp: number;
        stock: number;
        image_url: string;
      }>;

      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Your bag is empty.' });
      }

      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shipping = subtotal >= 999 ? 0 : 60;
      const discount = subtotal >= 1800 ? 150 : 0;
      const total = subtotal + shipping - discount;
      const orderNumber = `EV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderItems: OrderItemSummary[] = cartItems.map((i) => ({
        book_id: i.book_id,
        title: i.title,
        author: i.author,
        format: i.format,
        quantity: i.quantity,
        unit_price: i.price,
        image_url: i.image_url,
      }));

      const tx = db.transaction(() => {
        for (const item of cartItems) {
          db.prepare('UPDATE books SET stock = MAX(0, stock - ?) WHERE id = ?').run(
            item.quantity,
            item.book_id
          );
        }

        db.prepare(
          `INSERT INTO orders (
            order_number, session_id, customer_name, email, phone, address,
            city, state, pincode, payment_method, items_json,
            subtotal, shipping, discount, total, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')`
        ).run(
          orderNumber,
          sessionId,
          String(customer_name).trim(),
          String(email).trim(),
          String(phone).trim(),
          String(address).trim(),
          String(city).trim(),
          String(state).trim(),
          String(pincode).trim(),
          payment_method,
          JSON.stringify(orderItems),
          subtotal,
          shipping,
          discount,
          total
        );

        db.prepare('DELETE FROM cart_items WHERE session_id = ?').run(sessionId);
      });

      tx();
      const orders = listOrdersBySession(sessionId);
      res.status(201).json({ order: orders[0], orders });
    } catch (err) {
      console.error('Error placing order:', err);
      res.status(500).json({ error: 'Could not place your order.' });
    }
  });

  // Server-side Gemini AI Study & Book Advisor
  app.post('/api/ai/study-advisor', async (req, res) => {
    try {
      const { examTarget, stream, timelineMonths, weakAreas } = req.body || {};
      if (!examTarget || !stream) {
        return res.status(400).json({ error: 'Please specify your target exam and stream.' });
      }
      const rows = db.prepare('SELECT * FROM books ORDER BY bestseller_rank ASC').all() as any[];
      const books = rows.map(hydrateBook);

      const plan = await generateStudyBookPlan({
        examTarget: String(examTarget),
        stream: String(stream),
        timelineMonths: Math.max(1, Math.min(24, Number(timelineMonths) || 6)),
        weakAreas: String(weakAreas || ''),
        books,
      });

      res.json({ plan });
    } catch (err: any) {
      console.error('Gemini study advisor error:', err);
      const message = err?.message || 'Study advisor failed to generate recommendations.';
      const status =
        message.includes('GEMINI_API_KEY') || message.includes('API_KEY') ? 503 : 500;
      res.status(status).json({ error: message });
    }
  });

  // Vite middleware in development, static serve in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EXAM VERSE full-stack server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start EXAM VERSE server:', err);
  process.exit(1);
});
