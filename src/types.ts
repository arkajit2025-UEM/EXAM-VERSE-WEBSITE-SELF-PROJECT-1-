export type ExamCategory =
  | 'All'
  | 'GATE'
  | 'Govt Exams'
  | 'Engineering'
  | 'Interview Prep';

export interface TocChapter {
  chapter: string;
  title: string;
  pages: string;
}

export interface Book {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  publisher: string;
  exam_category: Exclude<ExamCategory, 'All'>;
  subject_stream: string;
  edition: string;
  year: number;
  pages: number;
  isbn: string;
  language: string;
  binding: string;
  price: number;
  mrp: number;
  stock: number;
  rating: number;
  review_count: number;
  image_url: string;
  description: string;
  toc: TocChapter[];
  highlights: string[];
  is_featured: boolean;
  bestseller_rank: number;
}

export interface Review {
  id: number;
  book_id: number;
  reviewer_name: string;
  exam_target: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
}

export interface CartItem {
  id: number;
  book_id: number;
  quantity: number;
  format: 'Paperback' | 'Hardcover + E-Workbook';
  title: string;
  slug: string;
  author: string;
  exam_category: string;
  subject_stream: string;
  price: number;
  mrp: number;
  stock: number;
  image_url: string;
}

export interface OrderItemSummary {
  book_id: number;
  title: string;
  author: string;
  format: string;
  quantity: number;
  unit_price: number;
  image_url: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: 'COD' | 'UPI' | 'Card';
  items: OrderItemSummary[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: string;
  created_at: string;
}

export interface RecommendedBookMatch {
  bookId: number;
  reason: string;
  priority: 'Core Foundation' | 'Practice & PYQ' | 'Revision & Interview';
  book?: Book;
}

export interface StudyPhase {
  phase: string;
  duration: string;
  focus: string;
  milestones: string[];
}

export interface StudyAdvisorPlan {
  strategySummary: string;
  dailyHoursRecommended: number;
  recommendedBooks: RecommendedBookMatch[];
  studyRoadmap: StudyPhase[];
}
