# IIT Ropar FAQ — Crowdsource Knowledge Platform

A crowd-sourced FAQ platform for IIT Ropar where students can browse FAQs, raise queries, and help peers by solving queries. Built with **Next.js 16**, **TypeScript**, and **MongoDB**.

## ✨ Features

- **📚 Browse FAQs** — Search and browse frequently asked questions with real-time search
- **✋ Raise a Query** — Submit questions and receive a unique ticket ID for tracking
- **💡 Solve a Query** — Answer peer queries; 3 peer approvals mark a query as resolved
- **🔒 Admin Panel** — Password-protected dashboard to add and manage FAQs
- **🎨 Premium Dark UI** — Glassmorphism cards, smooth animations, and responsive design

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | MongoDB |
| Styling | Vanilla CSS (custom design system) |
| Fonts | Inter + Outfit (Google Fonts) |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ 
- **MongoDB** running locally on port `27017`, or a MongoDB Atlas URI

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd iitropar-faq

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your MongoDB URI and admin password
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/iitropar-faq
ADMIN_PASSWORD=your_secure_password
NEXT_PUBLIC_APP_NAME=IIT Ropar FAQ
```

### Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Pages

| Page | Route | Description |
|------|-------|-------------|
| Browse FAQs | `/` | Home page with search bar and expandable FAQ cards |
| Raise a Query | `/raise-query` | Submit a query (get ticket ID) and track query status |
| Solve a Query | `/solve-query` | Answer active queries or approve proposed solutions |
| Admin Login | `/admin` | Password-only admin authentication |
| Admin Dashboard | `/admin/dashboard` | Add new FAQs and manage (delete) existing ones |

## 🔄 Query Lifecycle

```
1. Student raises a query → Ticket ID generated (e.g. abc45-df43-88io-123a)
2. Query status: 🟡 Active
3. A peer submits an answer → Status: 🔵 In Review (1/3 approvals)
4. Two more peers approve → Status: 🟢 Resolved (3/3 approvals)
5. Student can track status and view the resolved answer using their ticket ID
```

## 🗂️ Project Structure

```
src/
├── app/
│   ├── globals.css                # Design system & global styles
│   ├── layout.tsx                 # Root layout with Navbar
│   ├── page.tsx                   # Browse FAQs (home)
│   ├── raise-query/page.tsx       # Raise & track queries
│   ├── solve-query/page.tsx       # Solve peer queries
│   ├── admin/
│   │   ├── page.tsx               # Admin login
│   │   └── dashboard/page.tsx     # Admin FAQ management
│   └── api/
│       ├── faqs/route.ts          # GET (search/list), POST (add), DELETE (remove)
│       ├── queries/route.ts       # GET (by ticket/status), POST (create)
│       ├── queries/solve/route.ts # POST (answer/approve)
│       └── admin/
│           ├── login/route.ts     # POST (authenticate)
│           └── verify/route.ts    # GET (session check)
├── components/
│   ├── Navbar.tsx                 # Navigation with active tab states
│   ├── FAQCard.tsx                # Expandable FAQ card
│   ├── SearchBar.tsx              # Debounced search input (300ms)
│   ├── StatusTracker.tsx          # Visual step indicator
│   ├── TicketDisplay.tsx          # Ticket ID with copy-to-clipboard
│   └── ConfirmModal.tsx           # Delete confirmation dialog
└── lib/
    ├── mongodb.ts                 # Singleton MongoDB connection
    └── ticketId.ts                # Ticket ID generator
```

## 🔌 API Reference

### FAQs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/faqs?q=term` | No | Search FAQs (or list all if no query) |
| `POST` | `/api/faqs` | Admin | Add a new FAQ |
| `DELETE` | `/api/faqs` | Admin | Delete a FAQ by ID |

### Queries

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/queries?ticketId=xxx` | No | Get query by ticket ID |
| `GET` | `/api/queries?status=active` | No | Get a random active/in-review query |
| `POST` | `/api/queries` | No | Create a new query |
| `POST` | `/api/queries/solve` | No | Submit answer (`action=answer`) or approve (`action=approve`) |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/login` | Authenticate with password |
| `GET` | `/api/admin/verify` | Check admin session |

## 📝 License

MIT


# team-6a2fd93aa5361d4e855a3c50
FAQ Crowdsourcing project — Vanshika Agrawal
