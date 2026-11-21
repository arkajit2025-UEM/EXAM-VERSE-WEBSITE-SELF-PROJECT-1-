import Database from 'better-sqlite3';
import path from 'path';
import type { Book, Order, Review, TocChapter } from '../src/types';

const DB_PATH = path.resolve(process.cwd(), 'examverse.db');

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      author TEXT NOT NULL,
      publisher TEXT NOT NULL,
      exam_category TEXT NOT NULL,
      subject_stream TEXT NOT NULL,
      edition TEXT NOT NULL,
      year INTEGER NOT NULL,
      pages INTEGER NOT NULL,
      isbn TEXT NOT NULL,
      language TEXT NOT NULL,
      binding TEXT NOT NULL,
      price INTEGER NOT NULL,
      mrp INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 25,
      rating REAL NOT NULL DEFAULT 4.7,
      review_count INTEGER NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      toc_json TEXT NOT NULL,
      highlights_json TEXT NOT NULL,
      is_featured INTEGER NOT NULL DEFAULT 0,
      bestseller_rank INTEGER NOT NULL DEFAULT 99
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      reviewer_name TEXT NOT NULL,
      exam_target TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      verified_purchase INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      book_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      format TEXT NOT NULL DEFAULT 'Paperback',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(session_id, book_id, format),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      book_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(session_id, book_id),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      session_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      items_json TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      shipping INTEGER NOT NULL,
      discount INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Confirmed',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const countRow = db.prepare('SELECT COUNT(*) as cnt FROM books').get() as { cnt: number };
  if (countRow.cnt === 0) {
    seedBooksAndReviews();
  }
}

interface RawBookRow {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  publisher: string;
  exam_category: Book['exam_category'];
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
  toc_json: string;
  highlights_json: string;
  is_featured: number;
  bestseller_rank: number;
}

export function hydrateBook(row: RawBookRow): Book {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    author: row.author,
    publisher: row.publisher,
    exam_category: row.exam_category,
    subject_stream: row.subject_stream,
    edition: row.edition,
    year: row.year,
    pages: row.pages,
    isbn: row.isbn,
    language: row.language,
    binding: row.binding,
    price: row.price,
    mrp: row.mrp,
    stock: row.stock,
    rating: row.rating,
    review_count: row.review_count,
    image_url: row.image_url,
    description: row.description,
    toc: JSON.parse(row.toc_json) as TocChapter[],
    highlights: JSON.parse(row.highlights_json) as string[],
    is_featured: Boolean(row.is_featured),
    bestseller_rank: row.bestseller_rank,
  };
}

function seedBooksAndReviews() {
  const GATE_IMG = '/src/assets/images/book_gate_master_guide_1795251492566.jpg';
  const GOVT_IMG = '/src/assets/images/book_govt_civil_compendium_1795251491917.jpg';
  const ENG_IMG = '/src/assets/images/book_core_engineering_handbook_1795251492338.jpg';
  const INT_IMG = '/src/assets/images/book_interview_system_design_1795251491145.jpg';

  const books = [
    {
      slug: 'gate-cs-it-35-years-solved-compendium',
      title: 'GATE Computer Science & IT: 35 Years Topic-Wise Solved Compendium',
      subtitle: 'Complete PYQ Analysis, Weightage Matrix & Conceptual Solutions (1991–2026)',
      author: 'Dr. Arvind Krishnan & Prof. Meera Nair',
      publisher: 'Exam Verse Academic Press',
      exam_category: 'GATE',
      subject_stream: 'Computer Science',
      edition: '14th Revised Edition',
      year: 2026,
      pages: 1120,
      isbn: '978-93-89412-01-4',
      language: 'English',
      binding: 'Paperback',
      price: 749,
      mrp: 1095,
      stock: 48,
      rating: 4.9,
      review_count: 2,
      image_url: GATE_IMG,
      description:
        'Engineered for top-100 GATE CS/IT and DA aspirants. Every previous year question from 1991 to 2026 is mapped to official IIT syllabus micro-topics with step-by-step derivations, time-complexity breakdowns, and common trap alerts.',
      toc: [
        { chapter: '01', title: 'Discrete Mathematics & Combinatorics', pages: '1–164' },
        { chapter: '02', title: 'Algorithms & Data Structures', pages: '165–342' },
        { chapter: '03', title: 'Operating Systems & Concurrency', pages: '343–510' },
        { chapter: '04', title: 'Database Management & Normalization', pages: '511–654' },
        { chapter: '05', title: 'Computer Networks & Protocol Design', pages: '655–830' },
        { chapter: '06', title: 'Theory of Computation & Compiler Design', pages: '831–1120' },
      ],
      highlights: [
        '3,450+ fully solved GATE CS & IT questions with alternate approaches',
        'Topic-wise weightage heatmap across IIT Roorkee, IISc, and IIT Bombay papers',
        'Includes MSQ & NAT numerical precision drill sets',
      ],
      is_featured: 1,
      bestseller_rank: 1,
    },
    {
      slug: 'gate-engineering-mathematics-general-aptitude',
      title: 'GATE Engineering Mathematics & General Aptitude Handbook',
      subtitle: 'Common Core Mastery for CS, EC, EE, ME & Civil Engineering',
      author: 'Prof. Siddharth Verma',
      publisher: 'Takshila Technical Publications',
      exam_category: 'GATE',
      subject_stream: 'All Branches',
      edition: '9th Edition',
      year: 2026,
      pages: 780,
      isbn: '978-93-89412-04-5',
      language: 'English',
      binding: 'Paperback',
      price: 549,
      mrp: 799,
      stock: 64,
      rating: 4.8,
      review_count: 2,
      image_url: GATE_IMG,
      description:
        'Securing 28 out of 28 marks in Engineering Mathematics and General Aptitude is the highest-ROI strategy in GATE. This handbook unifies Linear Algebra, Calculus, Probability, Differential Equations, and Quantitative Reasoning with 1,800 graded drills.',
      toc: [
        { chapter: '01', title: 'Linear Algebra, Eigenvalues & Matrix Decompositions', pages: '1–138' },
        { chapter: '02', title: 'Multivariable Calculus & Vector Identities', pages: '139–290' },
        { chapter: '03', title: 'Probability Distributions & Stochastic Basics', pages: '291–436' },
        { chapter: '04', title: 'ODEs, PDEs, Laplace & Numerical Methods', pages: '437–602' },
        { chapter: '05', title: 'Spatial & Analytical Aptitude Lab', pages: '603–780' },
      ],
      highlights: [
        'Covers the entire 28-mark common scoring block across all GATE streams',
        'Formula reference pull-out sheet for final 30-day revision',
        '500+ NAT practice questions calibrated to virtual calculator precision',
      ],
      is_featured: 1,
      bestseller_rank: 2,
    },
    {
      slug: 'gate-ese-ece-signals-networks-vlsi',
      title: 'GATE & ESE Electronics: Signals, Networks & VLSI Systems',
      subtitle: 'Subject-Wise Concept Builder & Numerical Workbook for EC / EE',
      author: 'Dr. R. Subramanian',
      publisher: 'Exam Verse Academic Press',
      exam_category: 'GATE',
      subject_stream: 'Electronics & Comm',
      edition: '7th Edition',
      year: 2026,
      pages: 940,
      isbn: '978-93-89412-09-0',
      language: 'English',
      binding: 'Hardcover',
      price: 699,
      mrp: 980,
      stock: 31,
      rating: 4.7,
      review_count: 1,
      image_url: ENG_IMG,
      description:
        'Built for Electronics & Communication (EC) and Electrical (EE) candidates targeting PSUs and IIT M.Tech admissions. Bridges circuit theory intuition with rigorous Laplace/Fourier transform problem solving.',
      toc: [
        { chapter: '01', title: 'Network Theorems & Transient Synthesis', pages: '1–195' },
        { chapter: '02', title: 'Continuous & Discrete Signals and Systems', pages: '196–412' },
        { chapter: '03', title: 'Analog CMOS & Operational Amplifiers', pages: '413–640' },
        { chapter: '04', title: 'Control Systems, Bode & Nyquist Stability', pages: '641–940' },
      ],
      highlights: [
        'Includes 15-year ESE Conventional & Objective solved problems',
        'High-clarity schematic diagrams with nodal shortcut methods',
        'Dedicated chapter on MOSFET scaling and CMOS timing analysis',
      ],
      is_featured: 0,
      bestseller_rank: 5,
    },
    {
      slug: 'upsc-cse-indian-polity-governance-compendium',
      title: 'Indian Polity, Constitution & Governance Compendium',
      subtitle: 'Complete Civil Services Prelims & Mains GS-II Reference Manual',
      author: 'Justice (Retd.) K. Raghavan & Ananya Rao',
      publisher: 'Sankalp Civil Services Press',
      exam_category: 'Govt Exams',
      subject_stream: 'UPSC & State PSC',
      edition: '11th Updated Edition',
      year: 2026,
      pages: 980,
      isbn: '978-93-89412-12-0',
      language: 'English',
      binding: 'Hardcover',
      price: 685,
      mrp: 950,
      stock: 52,
      rating: 4.9,
      review_count: 2,
      image_url: GOVT_IMG,
      description:
        'An authoritative, clause-by-clause analytical guide to the Constitution of India, Supreme Court landmark judgments up to 2026, parliamentary procedures, and federalism—crafted specifically for UPSC CSE, State PCS, and CAPF examinations.',
      toc: [
        { chapter: '01', title: 'Constitutional Framework & Fundamental Rights', pages: '1–215' },
        { chapter: '02', title: 'Union Executive, Parliament & Legislative Process', pages: '216–478' },
        { chapter: '03', title: 'Judiciary, Judicial Review & Tribunal Reforms', pages: '479–660' },
        { chapter: '04', title: 'Centre-State Relations, Panchayati Raj & Commissions', pages: '661–845' },
        { chapter: '05', title: '2015–2026 Prelims & Mains Solved Case Compendium', pages: '846–980' },
      ],
      highlights: [
        'Incorporates all Constitutional Amendments & 2025–2026 SC Constitutional Bench rulings',
        'Side-by-side Prelims factual tables and Mains analytical frameworks',
        'Includes 450+ UPSC-standard MCQ elimination drills',
      ],
      is_featured: 1,
      bestseller_rank: 3,
    },
    {
      slug: 'ssc-cgl-tier-1-2-quantitative-aptitude-atlas',
      title: 'SSC CGL Tier I & II Quantitative & Reasoning Speed Atlas',
      subtitle: '6,500+ TCS-Pattern Solved Questions with 30-Second Calculation Tricks',
      author: 'Vikramaditya Singh',
      publisher: 'Janata Exam Publishers',
      exam_category: 'Govt Exams',
      subject_stream: 'SSC & Banking',
      edition: '2026 Exam Edition',
      year: 2026,
      pages: 860,
      isbn: '978-93-89412-18-2',
      language: 'English',
      binding: 'Paperback',
      price: 495,
      mrp: 725,
      stock: 80,
      rating: 4.8,
      review_count: 1,
      image_url: GOVT_IMG,
      description:
        'Designed for SSC CGL, CHSL, CPO, and RRB NTPC aspirants aiming for 95%+ accuracy under strict clock pressure. Every arithmetic and advance math chapter teaches both conceptual rigor and mental approximation shortcuts.',
      toc: [
        { chapter: '01', title: 'Number System, Surds & Modular Arithmetic', pages: '1–172' },
        { chapter: '02', title: 'Percentage, Ratio, Profit-Loss & Installments', pages: '173–390' },
        { chapter: '03', title: 'Geometry, Mensuration 3D & Trigonometry', pages: '391–648' },
        { chapter: '04', title: 'Data Interpretation & Tier-II Statistics/Probability', pages: '649–860' },
      ],
      highlights: [
        'Updated for latest SSC CGL Tier-II Statistics & Probability modules',
        'Tiered difficulty levels: Foundation → Tier-I Speed → Tier-II Ranker',
        'Includes 20 full-length timed sectional mock sheets',
      ],
      is_featured: 0,
      bestseller_rank: 6,
    },
    {
      slug: 'banking-ibps-sbi-po-mains-reasoning-di',
      title: 'IBPS & SBI PO Mains: High-Level Puzzles, DI & Banking Awareness',
      subtitle: 'Master Machine Input-Output, Critical Reasoning & Financial Regulation',
      author: 'Neha Kulkarni & Rajeshwar Iyer',
      publisher: 'FinPrep Academic House',
      exam_category: 'Govt Exams',
      subject_stream: 'SSC & Banking',
      edition: '6th Edition',
      year: 2026,
      pages: 710,
      isbn: '978-93-89412-23-6',
      language: 'English',
      binding: 'Paperback',
      price: 465,
      mrp: 680,
      stock: 42,
      rating: 4.6,
      review_count: 1,
      image_url: GOVT_IMG,
      description:
        'Built specifically for IBPS PO, SBI PO, and RBI Grade B Phase-I/II aspirants. Tackles multi-variable seating puzzles, caselet data interpretation, RBI monetary policy circulars, and descriptive essay frameworks.',
      toc: [
        { chapter: '01', title: 'Multi-Parameter Seating & Floor Puzzles', pages: '1–210' },
        { chapter: '02', title: 'Critical Reasoning, Syllogisms & Machine Input', pages: '211–388' },
        { chapter: '03', title: 'Arithmetic Data Sufficiency & Caselet DI', pages: '389–560' },
        { chapter: '04', title: 'RBI Circulars, Basel Norms & Descriptive English', pages: '561–710' },
      ],
      highlights: [
        '180+ Mains-level multi-variable puzzles with visual elimination grids',
        'Covers RBI monetary tools, NPAs, UPI infrastructure & Basel-III updates',
        'Includes descriptive letter & essay scoring rubrics',
      ],
      is_featured: 0,
      bestseller_rank: 9,
    },
    {
      slug: 'system-design-distributed-architecture-interview',
      title: 'Designing Scalable Distributed Systems: Staff & SDE Interview Guide',
      subtitle: 'Sharding, Consensus, Rate Limiters, Kafka Pipelines & 24 Real Case Studies',
      author: 'Alexander Chen & Rohan Deshmukh',
      publisher: 'Code & Career Press',
      exam_category: 'Interview Prep',
      subject_stream: 'Software & System Design',
      edition: '3rd Expanded Edition',
      year: 2026,
      pages: 640,
      isbn: '978-93-89412-31-1',
      language: 'English',
      binding: 'Hardcover',
      price: 899,
      mrp: 1299,
      stock: 36,
      rating: 4.9,
      review_count: 2,
      image_url: INT_IMG,
      description:
        'A battle-tested blueprint for SDE-2, Senior, and Staff Engineer interviews at top product companies. Moves past hand-wavy boxes to back-of-the-envelope QPS math, Raft consensus, LSM trees, consistent hashing, and multi-region failover.',
      toc: [
        { chapter: '01', title: 'Latency Numbers, Capacity Estimation & Storage Engines', pages: '1–134' },
        { chapter: '02', title: 'Consistent Hashing, Partitioning & Replication Lag', pages: '135–276' },
        { chapter: '03', title: 'Design Case Studies: Payment Ledger, Ride Dispatch & Search', pages: '277–490' },
        { chapter: '04', title: 'Low-Level Design (LLD) & Concurrency Patterns', pages: '491–640' },
      ],
      highlights: [
        '24 end-to-end HLD + LLD blueprints with trade-off matrices',
        'Covers Redis clustering, Kafka partitioning, and distributed locks',
        'Includes interviewer follow-up rubric and bottleneck checklist',
      ],
      is_featured: 1,
      bestseller_rank: 4,
    },
    {
      slug: 'algorithms-coding-interviews-patterns-manual',
      title: 'Data Structures & Coding Interview Patterns: 300 Curated Problems',
      subtitle: 'Sliding Window, Dynamic Programming, Graphs & Trees in C++ / Java / Python',
      author: 'Prof. Karthik Subramanian',
      publisher: 'Code & Career Press',
      exam_category: 'Interview Prep',
      subject_stream: 'Software & System Design',
      edition: '5th Edition',
      year: 2026,
      pages: 740,
      isbn: '978-93-89412-37-3',
      language: 'English',
      binding: 'Paperback',
      price: 675,
      mrp: 950,
      stock: 54,
      rating: 4.8,
      review_count: 1,
      image_url: INT_IMG,
      description:
        'Stop memorizing random problems—master the 18 underlying algorithmic invariants used in 90% of technical interviews. Includes clean dry-run trace tables, bit-manipulation tricks, and space-optimization transitions for DP.',
      toc: [
        { chapter: '01', title: 'Two Pointers, Sliding Window & Monotonic Stack', pages: '1–168' },
        { chapter: '02', title: 'Trees, Tries, Segment Trees & Union-Find', pages: '169–362' },
        { chapter: '03', title: 'Graph Traversals, Topological Sort & Shortest Paths', pages: '363–520' },
        { chapter: '04', title: 'State-Machine Dynamic Programming & Bitmasking', pages: '521–740' },
      ],
      highlights: [
        'Side-by-side idiomatic C++20, Java 21, and Python 3 implementations',
        'Complexity proof & edge-case checklist for every problem pattern',
        'Dedicated campus placement & off-campus OA sprint plan',
      ],
      is_featured: 0,
      bestseller_rank: 7,
    },
    {
      slug: 'core-mechanical-thermodynamics-psu-handbook',
      title: 'Core Mechanical Engineering: Thermodynamics, Fluid & Machine Design',
      subtitle: 'Comprehensive Text & PSU / ISRO / BARC Technical Interview Reference',
      author: 'Dr. Harishankar Menon',
      publisher: 'Architect Technical Press',
      exam_category: 'Engineering',
      subject_stream: 'Mechanical',
      edition: '8th Edition',
      year: 2026,
      pages: 890,
      isbn: '978-93-89412-42-7',
      language: 'English',
      binding: 'Hardcover',
      price: 629,
      mrp: 890,
      stock: 27,
      rating: 4.7,
      review_count: 1,
      image_url: ENG_IMG,
      description:
        'A rigorous core mechanical reference built for B.Tech honors, GATE ME, ISRO Scientist, BARC OCES, and PSU technical panel interviews (ONGC, IOCL, NTPC, BHEL). Connects First Principles equations directly to industrial equipment.',
      toc: [
        { chapter: '01', title: 'Laws of Thermodynamics, Entropy & Power Cycles', pages: '1–230' },
        { chapter: '02', title: 'Incompressible Fluid Dynamics & Boundary Layers', pages: '231–445' },
        { chapter: '03', title: 'Strength of Materials & Fatigue Failure Theories', pages: '446–670' },
        { chapter: '04', title: 'ISRO / BARC Technical Panel Interview Q&A Bank', pages: '671–890' },
      ],
      highlights: [
        '250+ real PSU, ISRO & BARC technical interview panel transcripts',
        'Includes Mollier charts, steam table excerpts & dimensional analysis',
        'Crystal-clear free-body & Mohr circle geometric derivations',
      ],
      is_featured: 0,
      bestseller_rank: 8,
    },
    {
      slug: 'civil-structural-geotechnical-ese-gate-guide',
      title: 'Structural Analysis, RCC & Geotechnical Engineering Master Manual',
      subtitle: 'IS-456:2000 Limit State Design, Soil Mechanics & GATE/ESE Solved Archive',
      author: 'Er. Devendra Kulkarni',
      publisher: 'Architect Technical Press',
      exam_category: 'Engineering',
      subject_stream: 'Civil',
      edition: '10th Edition',
      year: 2026,
      pages: 910,
      isbn: '978-93-89412-49-6',
      language: 'English',
      binding: 'Paperback',
      price: 649,
      mrp: 920,
      stock: 33,
      rating: 4.8,
      review_count: 1,
      image_url: GATE_IMG,
      description:
        'Covers the complete structural, geotechnical, and environmental core for Civil Engineering undergraduates, GATE CE rankers, and State AE/JE recruitment exams with full IS-code clause alignment.',
      toc: [
        { chapter: '01', title: 'Indeterminate Structures, Matrix Method & Influence Lines', pages: '1–240' },
        { chapter: '02', title: 'Reinforced Concrete & Prestressed Design (IS 456)', pages: '241–490' },
        { chapter: '03', title: 'Soil Consolidation, Shear Strength & Pile Foundations', pages: '491–715' },
        { chapter: '04', title: 'Environmental Water Treatment & Highway Geometrics', pages: '716–910' },
      ],
      highlights: [
        'Strictly aligned with latest IS 456, IS 800 & IRC codal provisions',
        'Includes 1,400+ GATE CE & State PSC AE/JE numerical problems',
        'Visual shear-force and bending-moment envelope summary charts',
      ],
      is_featured: 0,
      bestseller_rank: 10,
    },
    {
      slug: 'embedded-c-operating-systems-hardware-interviews',
      title: 'Embedded Systems, Firmware & Core ECE Technical Interview Guide',
      subtitle: 'RTOS, C Pointers, Memory-Mapped I/O, SPI/I2C & Digital Logic Synthesis',
      author: 'Sanjay Natarajan',
      publisher: 'Architect Technical Press',
      exam_category: 'Interview Prep',
      subject_stream: 'Electronics & Comm',
      edition: '4th Edition',
      year: 2026,
      pages: 560,
      isbn: '978-93-89412-55-7',
      language: 'English',
      binding: 'Paperback',
      price: 589,
      mrp: 840,
      stock: 29,
      rating: 4.8,
      review_count: 1,
      image_url: ENG_IMG,
      description:
        'Tailored for semiconductor, automotive, and embedded firmware interviews (Qualcomm, TI, NVIDIA, Intel, Bosch). Demystifies volatile keywords, ISR latency, FreeRTOS task scheduling, setup/hold timing violations, and static timing analysis.',
      toc: [
        { chapter: '01', title: 'Bare-Metal C, Bitwise Registers & Memory Alignment', pages: '1–145' },
        { chapter: '02', title: 'ARM Cortex Architecture, Interrupts & DMA Pipelines', pages: '146–295' },
        { chapter: '03', title: 'SPI, I2C, UART, CAN Protocols & Logic Analyzer Traces', pages: '296–430' },
        { chapter: '04', title: 'Verilog FSMs, Setup/Hold Timing & Clock Domain Crossing', pages: '431–560' },
      ],
      highlights: [
        '160+ real semiconductor & embedded firmware coding questions',
        'Includes STA timing diagram derivations and CDC synchronizers',
        'Covers FreeRTOS priority inversion & mutex deadlock mitigation',
      ],
      is_featured: 0,
      bestseller_rank: 11,
    },
    {
      slug: 'indian-economy-current-affairs-yearbook-2026',
      title: 'Indian Economy, Union Budget & Science-Tech Yearbook 2026',
      subtitle: 'Data-Backed Macro Analysis for UPSC, RBI Grade B, State PSC & NABARD',
      author: 'Dr. Aparna Sen & Editorial Board',
      publisher: 'Sankalp Civil Services Press',
      exam_category: 'Govt Exams',
      subject_stream: 'UPSC & State PSC',
      edition: '2026 Annual Edition',
      year: 2026,
      pages: 620,
      isbn: '978-93-89412-61-8',
      language: 'English',
      binding: 'Paperback',
      price: 439,
      mrp: 620,
      stock: 74,
      rating: 4.7,
      review_count: 1,
      image_url: GOVT_IMG,
      description:
        'Synthesizes Economic Survey trends, Union Budget fiscal numbers, RBI monetary frameworks, semiconductor/AI missions, and environmental treaties into crisp exam-ready charts and Mains answer templates.',
      toc: [
        { chapter: '01', title: 'Fiscal Policy, GST Architecture & Union Budget Breakdown', pages: '1–175' },
        { chapter: '02', title: 'Monetary Transmission, Inflation & External Sector', pages: '176–330' },
        { chapter: '03', title: 'Infrastructure Corridors, Energy Transition & PLI Schemes', pages: '331–485' },
        { chapter: '04', title: 'Space, Quantum, Biotech & Climate Diplomacy Digest', pages: '486–620' },
      ],
      highlights: [
        'Verified RBI, MoSPI, and Economic Survey statistical tables',
        '200+ UPSC Prelims statement-elimination practice questions',
        'Mains GS-III model answers with flowcharts and data citations',
      ],
      is_featured: 0,
      bestseller_rank: 12,
    },
  ];

  const insertBook = db.prepare(`
    INSERT INTO books (
      slug, title, subtitle, author, publisher, exam_category, subject_stream,
      edition, year, pages, isbn, language, binding, price, mrp, stock,
      rating, review_count, image_url, description, toc_json, highlights_json,
      is_featured, bestseller_rank
    ) VALUES (
      @slug, @title, @subtitle, @author, @publisher, @exam_category, @subject_stream,
      @edition, @year, @pages, @isbn, @language, @binding, @price, @mrp, @stock,
      @rating, @review_count, @image_url, @description, @toc_json, @highlights_json,
      @is_featured, @bestseller_rank
    )
  `);

  const insertReview = db.prepare(`
    INSERT INTO reviews (book_id, reviewer_name, exam_target, rating, title, comment, verified_purchase)
    VALUES (@book_id, @reviewer_name, @exam_target, @rating, @title, @comment, 1)
  `);

  const seedReviewsData: Record<string, Array<{ reviewer_name: string; exam_target: string; rating: number; title: string; comment: string }>> = {
    'gate-cs-it-35-years-solved-compendium': [
      {
        reviewer_name: 'Pranav Kulkarni',
        exam_target: 'GATE CS AIR 68',
        rating: 5,
        title: 'Best alternate approaches for OS and Algorithms PYQs',
        comment: 'The MSQ breakdown and complexity analysis saved me hours during my final 60-day revision sprint. Zero printing errors in recurrence equations.',
      },
      {
        reviewer_name: 'Shreya Banerjee',
        exam_target: 'M.Tech Aspirant, NIT Trichy',
        rating: 5,
        title: 'Micro-topic weightage charts are spot on',
        comment: 'Grouping 35 years of papers by exact sub-topic makes spotting recurring patterns in Normalization and TCP congestion control effortless.',
      },
    ],
    'gate-engineering-mathematics-general-aptitude': [
      {
        reviewer_name: 'Aditya Sharma',
        exam_target: 'GATE ME 2026',
        rating: 5,
        title: 'Secured 26/28 in Maths + Aptitude using this single book',
        comment: 'Linear algebra rank-nullity proofs and Eigenvalue shortcuts are explained cleanly without skipping steps.',
      },
      {
        reviewer_name: 'Rituja Deshpande',
        exam_target: 'GATE EC',
        rating: 5,
        title: 'Virtual calculator precision drills helped immensely',
        comment: 'NAT questions at the end of every chapter match real GATE exam difficulty.',
      },
    ],
    'upsc-cse-indian-polity-governance-compendium': [
      {
        reviewer_name: 'Tanmay Joshi',
        exam_target: 'UPSC CSE Mains Candidate',
        rating: 5,
        title: 'Bridge between Prelims facts and Mains GS-II analysis',
        comment: 'Having Supreme Court Constitutional Bench verdicts right beside the Articles saves jumping across three notebooks.',
      },
      {
        reviewer_name: 'Meenakshi Iyer',
        exam_target: 'State PCS Ranker',
        rating: 5,
        title: 'Crystal clear parliamentary committees & federalism tables',
        comment: 'Hardcover binding holds up through multiple highlight revisions.',
      },
    ],
    'system-design-distributed-architecture-interview': [
      {
        reviewer_name: 'Kunal Mehta',
        exam_target: 'SDE-2 Backend Engineer',
        rating: 5,
        title: 'Cleared two senior backend system design rounds',
        comment: 'The payment ledger and ride-dispatch case studies actually walk through database isolation levels and backpressure instead of surface buzzwords.',
      },
      {
        reviewer_name: 'Divya Menon',
        exam_target: 'Staff Engineer Candidate',
        rating: 5,
        title: 'Capacity math and storage engine trade-offs are gold',
        comment: 'Chapter 1 on LSM vs B-Tree tradeoffs gave me crisp answers to interviewer deep-dives.',
      },
    ],
  };

  const tx = db.transaction(() => {
    for (const b of books) {
      const info = insertBook.run({
        slug: b.slug,
        title: b.title,
        subtitle: b.subtitle,
        author: b.author,
        publisher: b.publisher,
        exam_category: b.exam_category,
        subject_stream: b.subject_stream,
        edition: b.edition,
        year: b.year,
        pages: b.pages,
        isbn: b.isbn,
        language: b.language,
        binding: b.binding,
        price: b.price,
        mrp: b.mrp,
        stock: b.stock,
        rating: b.rating,
        review_count: b.review_count,
        image_url: b.image_url,
        description: b.description,
        toc_json: JSON.stringify(b.toc),
        highlights_json: JSON.stringify(b.highlights),
        is_featured: b.is_featured,
        bestseller_rank: b.bestseller_rank,
      });

      const bookId = Number(info.lastInsertRowid);
      const reviewsForBook = seedReviewsData[b.slug] || [
        {
          reviewer_name: 'Arjun Nair',
          exam_target: `${b.exam_category} Aspirant`,
          rating: 5,
          title: 'Well-structured syllabus coverage and crisp print quality',
          comment: 'Clear derivations, authentic practice sets, and zero filler pages. Highly practical for serious exam prep.',
        },
      ];

      for (const r of reviewsForBook) {
        insertReview.run({
          book_id: bookId,
          reviewer_name: r.reviewer_name,
          exam_target: r.exam_target,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
        });
      }

      db.prepare('UPDATE books SET review_count = ? WHERE id = ?').run(reviewsForBook.length, bookId);
    }
  });

  tx();
}

export function getBookBySlug(slug: string): Book | null {
  const row = db.prepare('SELECT * FROM books WHERE slug = ?').get(slug) as RawBookRow | undefined;
  return row ? hydrateBook(row) : null;
}

export function getReviewsByBookId(bookId: number): Review[] {
  const rows = db
    .prepare('SELECT * FROM reviews WHERE book_id = ? ORDER BY id DESC')
    .all(bookId) as Array<Omit<Review, 'verified_purchase'> & { verified_purchase: number }>;
  return rows.map((r) => ({
    ...r,
    verified_purchase: Boolean(r.verified_purchase),
  }));
}

export function listOrdersBySession(sessionId: string): Order[] {
  const rows = db
    .prepare('SELECT * FROM orders WHERE session_id = ? ORDER BY id DESC')
    .all(sessionId) as Array<Omit<Order, 'items'> & { items_json: string }>;

  return rows.map((r) => ({
    id: r.id,
    order_number: r.order_number,
    customer_name: r.customer_name,
    email: r.email,
    phone: r.phone,
    address: r.address,
    city: r.city,
    state: r.state,
    pincode: r.pincode,
    payment_method: r.payment_method,
    items: JSON.parse(r.items_json),
    subtotal: r.subtotal,
    shipping: r.shipping,
    discount: r.discount,
    total: r.total,
    status: r.status,
    created_at: r.created_at,
  }));
}
