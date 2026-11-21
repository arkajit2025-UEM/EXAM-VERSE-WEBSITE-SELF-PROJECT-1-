import React, { useState } from 'react';
import { ArrowRight, BookOpen, Calendar, ShoppingBag, Sparkles } from 'lucide-react';
import { requestStudyAdvisorPlan } from '../lib/api';
import type { Book, StudyAdvisorPlan } from '../types';

interface StudyAdvisorSectionProps {
  onAddMultipleToCart: (bookIds: number[]) => Promise<void>;
  onOpenDetail: (book: Book) => void;
}

const PRESET_GOALS = [
  {
    label: 'GATE CS 2027 Top-100',
    examTarget: 'GATE Computer Science & IT 2027',
    stream: 'Computer Science',
    timelineMonths: 8,
    weakAreas: 'Dynamic Programming, Operating Systems concurrency, Engineering Maths',
  },
  {
    label: 'UPSC CSE Prelims + Mains',
    examTarget: 'UPSC Civil Services Examination (Prelims & Mains)',
    stream: 'UPSC & State PSC',
    timelineMonths: 10,
    weakAreas: 'Constitutional Bench rulings, Budget fiscal tables, GS-II & GS-III linkage',
  },
  {
    label: 'FAANG SDE-2 Interview',
    examTarget: 'Senior Software Engineer (SDE-2) Product Company Interviews',
    stream: 'Software & System Design',
    timelineMonths: 3,
    weakAreas: 'Distributed payment ledger design, Kafka partitioning, Graph & DP patterns',
  },
  {
    label: 'SSC CGL + PSU Core',
    examTarget: 'SSC CGL Tier I & II / Core Engineering PSU Selection',
    stream: 'SSC & Banking / Mechanical',
    timelineMonths: 5,
    weakAreas: 'Quantitative calculation speed, Tier-II probability, PSU technical panel Q&A',
  },
];

export function StudyAdvisorSection({
  onAddMultipleToCart,
  onOpenDetail,
}: StudyAdvisorSectionProps) {
  const [examTarget, setExamTarget] = useState('GATE Computer Science & IT 2027');
  const [stream, setStream] = useState('Computer Science');
  const [timelineMonths, setTimelineMonths] = useState(6);
  const [weakAreas, setWeakAreas] = useState(
    'Algorithms time complexity, Engineering Mathematics, and PYQ speed'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<StudyAdvisorPlan | null>(null);
  const [addingBundle, setAddingBundle] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await requestStudyAdvisorPlan({
        examTarget,
        stream,
        timelineMonths,
        weakAreas,
      });
      setPlan(res.plan);
    } catch (err: any) {
      setError(
        err?.message || 'Unable to generate your study plan. Please verify server configuration.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBundle() {
    if (!plan) return;
    const ids = plan.recommendedBooks
      .map((r) => r.book?.id)
      .filter((id): id is number => typeof id === 'number');
    if (ids.length === 0) return;
    setAddingBundle(true);
    try {
      await onAddMultipleToCart(ids);
    } finally {
      setAddingBundle(false);
    }
  }

  return (
    <section id="study-advisor" className="py-12 lg:py-16 bg-white border-t border-slate-200">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Advisor Form */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#1E3A8A]">
                Powered by Gemini Academic Engine
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Syllabus-to-Book Study Advisor
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Enter your target exam, remaining months, and weak topics. Our advisor
                matches exact editions from the EXAM VERSE catalog and builds a phased
                preparation schedule.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_GOALS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setExamTarget(preset.examTarget);
                    setStream(preset.stream);
                    setTimelineMonths(preset.timelineMonths);
                    setWeakAreas(preset.weakAreas);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-[#F1F5F9] hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleGenerate}
              className="p-5 rounded-xl border border-slate-200 bg-[#F8F9FB] space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Examination or Job Role
                </label>
                <input
                  required
                  type="text"
                  value={examTarget}
                  onChange={(e) => setExamTarget(e.target.value)}
                  placeholder="e.g. GATE CS 2027, UPSC Prelims, SDE-2 Backend"
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Engineering / Exam Stream
                  </label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    <option value="Computer Science">Computer Science &amp; IT</option>
                    <option value="Electronics & Comm">Electronics &amp; ECE</option>
                    <option value="Mechanical">Mechanical Engineering</option>
                    <option value="Civil">Civil Engineering</option>
                    <option value="UPSC & State PSC">UPSC &amp; State PSC</option>
                    <option value="SSC & Banking">SSC CGL / IBPS / SBI</option>
                    <option value="Software & System Design">Software &amp; System Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Months Remaining
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={24}
                    value={timelineMonths}
                    onChange={(e) => setTimelineMonths(Number(e.target.value))}
                    className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weak Topics or Priority Goals
                </label>
                <textarea
                  rows={2}
                  value={weakAreas}
                  onChange={(e) => setWeakAreas(e.target.value)}
                  placeholder="Describe subjects or interview rounds you want to strengthen..."
                  className="w-full p-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Matching Catalog & Building Study Plan...'
                    : 'Generate Book Stack & Roadmap'}
                </span>
              </button>
            </form>
          </div>

          {/* Right Advisor Results */}
          <div className="lg:col-span-7">
            {error && (
              <div className="p-5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800">
                <p className="font-semibold">Advisor Request Failed</p>
                <p className="mt-1 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {!plan && !loading && !error && (
              <div className="p-8 rounded-xl border border-slate-200 bg-[#F8F9FB] space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-900">
                      Personalized Syllabus Stack
                    </h3>
                    <p className="text-xs text-slate-500">
                      Choose a preset or enter your exam timeline to generate live recommendations.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200/80 text-xs text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-900">01. Exact Book Match</p>
                    <p className="mt-1 leading-relaxed">
                      Selects only verified editions currently in stock in our catalog.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">02. Priority Tagging</p>
                    <p className="mt-1 leading-relaxed">
                      Separates Foundation texts from PYQ drill books and Revision guides.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">03. Phased Schedule</p>
                    <p className="mt-1 leading-relaxed">
                      Breaks your remaining months into concrete chapter milestones.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="p-8 rounded-xl border border-slate-200 bg-[#F8F9FB] space-y-4 animate-pulse">
                <div className="h-5 w-2/3 bg-slate-200 rounded" />
                <div className="h-4 w-full bg-slate-200 rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="h-32 bg-slate-200 rounded-lg" />
                  <div className="h-32 bg-slate-200 rounded-lg" />
                </div>
              </div>
            )}

            {plan && !loading && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl border border-slate-200 bg-[#F8F9FB]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      Recommended Strategy &amp; Book Bundle
                    </h3>
                    <span className="font-mono text-xs font-semibold text-[#1E3A8A] tabular-nums">
                      {plan.dailyHoursRecommended} hrs / day recommended
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {plan.strategySummary}
                  </p>

                  {plan.recommendedBooks.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {plan.recommendedBooks.map((rec) => {
                        if (!rec.book) return null;
                        const book = rec.book;
                        return (
                          <div
                            key={book.id}
                            className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-3.5 min-w-0">
                              <img
                                src={book.image_url}
                                alt={book.title}
                                referrerPolicy="no-referrer"
                                className="w-12 h-16 object-cover rounded border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1E3A8A]">
                                  {rec.priority} · {book.exam_category}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => onOpenDetail(book)}
                                  className="text-left font-display text-sm font-semibold text-slate-900 hover:text-[#1E3A8A] transition-colors cursor-pointer"
                                >
                                  {book.title}
                                </button>
                                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                  {rec.reason}
                                </p>
                              </div>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                              <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                                ₹{book.price}
                              </span>
                              <button
                                type="button"
                                onClick={() => onOpenDetail(book)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A] hover:underline whitespace-nowrap cursor-pointer"
                              >
                                <span>Inspect</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-slate-600 tabular-nums">
                          Bundle Total:{' '}
                          <strong className="font-mono text-slate-900">
                            ₹
                            {plan.recommendedBooks.reduce(
                              (sum, r) => sum + (r.book?.price || 0),
                              0
                            )}
                          </strong>
                        </span>
                        <button
                          type="button"
                          disabled={addingBundle}
                          onClick={handleAddBundle}
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172554] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>
                            {addingBundle
                              ? 'Adding Bundle...'
                              : 'Add Recommended Stack to Bag'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3-Phase Roadmap */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plan.studyRoadmap.map((phase, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-2"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-[#1E3A8A]" />
                        <span>{phase.duration}</span>
                      </div>
                      <h4 className="font-display text-sm font-semibold text-slate-900">
                        {phase.phase}
                      </h4>
                      <p className="text-xs text-slate-600">{phase.focus}</p>
                      <ul className="pt-1 space-y-1 text-xs text-slate-700">
                        {phase.milestones.map((m, mIdx) => (
                          <li key={mIdx} className="leading-snug">
                            • {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
