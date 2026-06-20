// ============================================================
// AUTO-CATEGORIZATION ENGINE — IIT Ropar Query & FAQ Portal
// ============================================================
// Maps query text to one of the 5 designated campus life
// categories using keyword-score matching. If no category
// scores above the threshold, defaults to 'Admin & Finance'.
// ============================================================

export type QueryCategory =
  | 'Academics'
  | 'Hostel & Mess'
  | 'Internships & Placements'
  | 'Admin & Finance'
  | 'Clubs & Events';

export const ALL_CATEGORIES: QueryCategory[] = [
  'Academics',
  'Hostel & Mess',
  'Internships & Placements',
  'Admin & Finance',
  'Clubs & Events',
];

// ---------------------------------------------------------------------------
// Keyword maps — each keyword contributes a weight to its category score.
// Longer / more specific keywords are given higher weights.
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: Record<QueryCategory, Array<{ word: string; weight: number }>> = {
  'Academics': [
    { word: 'course', weight: 3 },
    { word: 'registration', weight: 4 },
    { word: 'register', weight: 3 },
    { word: 'credit', weight: 3 },
    { word: 'elective', weight: 4 },
    { word: 'spi', weight: 5 },
    { word: 'cpi', weight: 5 },
    { word: 'cgpa', weight: 4 },
    { word: 'sgpa', weight: 4 },
    { word: 'grade', weight: 3 },
    { word: 'grading', weight: 3 },
    { word: 'exam', weight: 3 },
    { word: 'examination', weight: 3 },
    { word: 'mid-sem', weight: 4 },
    { word: 'midsem', weight: 4 },
    { word: 'end-sem', weight: 4 },
    { word: 'endsem', weight: 4 },
    { word: 'semester', weight: 2 },
    { word: 'syllabus', weight: 4 },
    { word: 'lecture', weight: 2 },
    { word: 'attendance', weight: 3 },
    { word: 'branch change', weight: 6 },
    { word: 'branch transfer', weight: 6 },
    { word: 'backlog', weight: 4 },
    { word: 'probation', weight: 5 },
    { word: 'academic probation', weight: 6 },
    { word: 'thesis', weight: 3 },
    { word: 'project', weight: 2 },
    { word: 'minor', weight: 3 },
    { word: 'major', weight: 2 },
    { word: 'timetable', weight: 3 },
    { word: 'time table', weight: 3 },
    { word: 'schedule', weight: 2 },
    { word: 'professor', weight: 2 },
    { word: 'faculty', weight: 2 },
    { word: 'department', weight: 2 },
    { word: 'assignment', weight: 2 },
    { word: 'lab', weight: 2 },
    { word: 'laboratory', weight: 2 },
    { word: 'tutorial', weight: 2 },
    { word: 'marks', weight: 3 },
    { word: 'result', weight: 2 },
    { word: 'transcript', weight: 4 },
    { word: 'degree', weight: 2 },
    { word: 'withdrawal', weight: 3 },
    { word: 'drop course', weight: 5 },
    { word: 'add course', weight: 5 },
  ],

  'Hostel & Mess': [
    { word: 'hostel', weight: 5 },
    { word: 'mess', weight: 5 },
    { word: 'room', weight: 3 },
    { word: 'room allocation', weight: 6 },
    { word: 'room allotment', weight: 6 },
    { word: 'roommate', weight: 4 },
    { word: 'satluj', weight: 6 },
    { word: 'beas', weight: 6 },
    { word: 'chenab', weight: 6 },
    { word: 'ravi', weight: 4 },
    { word: 'dorm', weight: 4 },
    { word: 'dormitory', weight: 4 },
    { word: 'warden', weight: 5 },
    { word: 'caretaker', weight: 4 },
    { word: 'mess menu', weight: 6 },
    { word: 'mess rebate', weight: 6 },
    { word: 'rebate', weight: 5 },
    { word: 'mess bill', weight: 5 },
    { word: 'food', weight: 2 },
    { word: 'canteen', weight: 3 },
    { word: 'cafeteria', weight: 3 },
    { word: 'amenity', weight: 3 },
    { word: 'amenities', weight: 3 },
    { word: 'wifi', weight: 3 },
    { word: 'ldap', weight: 3 },
    { word: 'maintenance', weight: 3 },
    { word: 'repair', weight: 2 },
    { word: 'complaint', weight: 2 },
    { word: 'security', weight: 3 },
    { word: 'gate pass', weight: 5 },
    { word: 'out pass', weight: 5 },
    { word: 'night out', weight: 5 },
    { word: 'laundry', weight: 4 },
    { word: 'electricity', weight: 2 },
    { word: 'water', weight: 2 },
    { word: 'plumbing', weight: 3 },
    { word: 'gyms', weight: 3 },
    { word: 'gym', weight: 3 },
    { word: 'common room', weight: 4 },
    { word: 'campus security', weight: 5 },
    { word: 'cycle', weight: 2 },
  ],

  'Internships & Placements': [
    { word: 'cdpc', weight: 6 },
    { word: 'placement', weight: 5 },
    { word: 'internship', weight: 5 },
    { word: 'intern', weight: 4 },
    { word: 'job', weight: 3 },
    { word: 'company', weight: 3 },
    { word: 'recruit', weight: 3 },
    { word: 'recruitment', weight: 4 },
    { word: 'resume', weight: 5 },
    { word: 'cv', weight: 3 },
    { word: 'curriculum vitae', weight: 4 },
    { word: 'interview', weight: 4 },
    { word: 'offer letter', weight: 6 },
    { word: 'package', weight: 3 },
    { word: 'ctc', weight: 4 },
    { word: 'stipend', weight: 4 },
    { word: 'ppo', weight: 5 },
    { word: 'summer internship', weight: 6 },
    { word: 'winter internship', weight: 6 },
    { word: 'alumnus', weight: 3 },
    { word: 'alumni', weight: 4 },
    { word: 'campus drive', weight: 5 },
    { word: 'off campus', weight: 4 },
    { word: 'on campus', weight: 4 },
    { word: 'aptitude', weight: 3 },
    { word: 'coding test', weight: 4 },
    { word: 'placement cell', weight: 6 },
    { word: 'eligible', weight: 2 },
    { word: 'eligibility', weight: 3 },
    { word: 'criteria', weight: 2 },
    { word: 'noc', weight: 3 },
    { word: 'no objection', weight: 3 },
    { word: 'debarred', weight: 5 },
    { word: 'backlog criteria', weight: 5 },
  ],

  'Clubs & Events': [
    { word: 'club', weight: 4 },
    { word: 'society', weight: 3 },
    { word: 'fest', weight: 5 },
    { word: 'festival', weight: 4 },
    { word: 'zeitgeist', weight: 7 },
    { word: 'advitiya', weight: 7 },
    { word: 'aarohan', weight: 7 },
    { word: 'sports', weight: 3 },
    { word: 'cultural', weight: 3 },
    { word: 'technical club', weight: 5 },
    { word: 'tech club', weight: 5 },
    { word: 'student council', weight: 5 },
    { word: 'sac', weight: 4 },
    { word: 'student activity', weight: 4 },
    { word: 'event', weight: 2 },
    { word: 'competition', weight: 2 },
    { word: 'hackathon', weight: 4 },
    { word: 'coding contest', weight: 4 },
    { word: 'recruitment drive', weight: 3 },
    { word: 'audition', weight: 4 },
    { word: 'tryout', weight: 3 },
    { word: 'workshop', weight: 2 },
    { word: 'seminar', weight: 2 },
    { word: 'notice', weight: 2 },
    { word: 'announcement', weight: 2 },
    { word: 'council', weight: 3 },
    { word: 'music', weight: 3 },
    { word: 'dance', weight: 3 },
    { word: 'drama', weight: 3 },
    { word: 'photography', weight: 3 },
    { word: 'robotics', weight: 3 },
    { word: 'coding', weight: 2 },
    { word: 'debate', weight: 3 },
    { word: 'nss', weight: 4 },
    { word: 'ncc', weight: 4 },
    { word: 'volunteer', weight: 2 },
  ],

  'Admin & Finance': [
    { word: 'fee', weight: 4 },
    { word: 'fees', weight: 4 },
    { word: 'tuition', weight: 3 },
    { word: 'scholarship', weight: 5 },
    { word: 'mcm', weight: 6 },
    { word: 'stipend', weight: 3 },
    { word: 'insurance', weight: 5 },
    { word: 'medical insurance', weight: 6 },
    { word: 'bonafide', weight: 6 },
    { word: 'no objection certificate', weight: 6 },
    { word: 'character certificate', weight: 6 },
    { word: 'identity card', weight: 5 },
    { word: 'id card', weight: 5 },
    { word: 'transit campus', weight: 6 },
    { word: 'payment', weight: 3 },
    { word: 'challan', weight: 4 },
    { word: 'fine', weight: 3 },
    { word: 'due', weight: 2 },
    { word: 'deadline', weight: 2 },
    { word: 'administration', weight: 3 },
    { word: 'office', weight: 2 },
    { word: 'registrar', weight: 5 },
    { word: 'dean', weight: 3 },
    { word: 'migration', weight: 3 },
    { word: 'document', weight: 2 },
    { word: 'certificate', weight: 3 },
    { word: 'verification', weight: 2 },
    { word: 'refund', weight: 4 },
    { word: 'withdrawal', weight: 2 },
    { word: 'leave', weight: 2 },
    { word: 'medical leave', weight: 4 },
  ],
};

// ---------------------------------------------------------------------------
// Core Categorizer Function
// ---------------------------------------------------------------------------

/**
 * Categorize a query/FAQ string into one of the 5 campus life categories.
 * Uses a keyword-score approach — the category with the highest score wins.
 * Defaults to 'Admin & Finance' if no keywords match.
 */
export function categorizeQuery(text: string): QueryCategory {
  if (!text || !text.trim()) return 'Admin & Finance';

  const lower = text.toLowerCase();
  const scores: Record<QueryCategory, number> = {
    'Academics': 0,
    'Hostel & Mess': 0,
    'Internships & Placements': 0,
    'Admin & Finance': 0,
    'Clubs & Events': 0,
  };

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const { word, weight } of keywords) {
      if (lower.includes(word)) {
        scores[category as QueryCategory] += weight;
      }
    }
  }

  const topCategory = (Object.entries(scores) as [QueryCategory, number][]).reduce(
    (best, [cat, score]) => (score > best.score ? { cat, score } : best),
    { cat: 'Admin & Finance' as QueryCategory, score: 0 }
  );

  return topCategory.cat;
}

// ---------------------------------------------------------------------------
// Timestamp Formatter
// ---------------------------------------------------------------------------

/**
 * Format a Date (or ISO string) to the canonical portal format:
 * "DD-MM-YYYY | HH:MM Hrs"
 * Uses 24-hour time to ensure unambiguous absolute timestamps.
 */
export function formatPostedAt(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();

  const rawHour = d.getHours();
  const period = rawHour < 12 ? 'am' : 'pm';
  const hour12 = rawHour % 12 === 0 ? 12 : rawHour % 12;
  const hh = String(hour12).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');

  return `${dd}-${mm}-${yyyy} | ${hh}:${min} ${period}`;
}

// ---------------------------------------------------------------------------
// Schema Formatter — Queries
// ---------------------------------------------------------------------------

/**
 * Map a raw MongoDB query document to the standardised JSON schema payload.
 * Supplementary fields (proposedAnswer, approvals, requiredApprovals, _id)
 * are passed through for internal use by solve/tracking features.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatQueryPayload(doc: Record<string, any>) {
  return {
    // ── Core schema fields ──────────────────────────────────────────────
    query_id: doc.ticketId ?? String(doc._id),
    category: (doc.category as QueryCategory) ?? 'Admin & Finance',
    title: doc.title ?? doc.question ?? '',
    description: doc.description ?? doc.question ?? '',
    posted_at: formatPostedAt(doc.createdAt ?? new Date()),
    status: doc.status === 'resolved' ? 'Resolved' : 'Open',
    collection_type: 'Raised Query' as const,
    // ── Supplementary fields (for solve / tracking UIs) ─────────────────
    _id: String(doc._id),
    ticketId: doc.ticketId,
    proposedAnswer: doc.proposedAnswer ?? null,
    approvals: doc.approvals ?? [],
    requiredApprovals: doc.requiredApprovals ?? 3,
    username: doc.username ?? '',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Schema Formatter — FAQs
// ---------------------------------------------------------------------------

/**
 * Map a raw MongoDB FAQ document to the standardised JSON schema payload.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatFaqPayload(doc: Record<string, any>) {
  return {
    // ── Core schema fields ──────────────────────────────────────────────
    query_id: String(doc._id),
    category: (doc.category as QueryCategory) ?? 'Admin & Finance',
    title: doc.question ?? '',
    description: doc.answer ?? '',
    posted_at: formatPostedAt(doc.updatedAt ?? doc.createdAt ?? new Date()),
    status: 'Resolved' as const,
    collection_type: 'Permanent FAQ' as const,
    // ── Supplementary fields (for admin / FAQCard UIs) ───────────────────
    _id: String(doc._id),
    question: doc.question,
    answer: doc.answer,
    updatedAt: doc.updatedAt,
  };
}
