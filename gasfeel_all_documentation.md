# GasFeel

## Project Description
A branded public leaderboard displaying contestan ID and points for a Content Challenge, with near‑real‑time updates and a simple, safe two‑lane backdoor for operations where the CSR and the Admins can add to the points of each contestants.

## Product Requirements Document
Product Requirements Document (PRD)

1. Introduction
Project Name: GasFeel Leaderboard
Document Version: 1.0
Date: October 26, 2023
Purpose: This document details the product requirements for the "GasFeel" public leaderboard and its associated "backdoor" operational interfaces. It outlines the goals, features, specifications, and technical considerations necessary for the project's successful delivery.

Goals and Objectives:
*   To provide a branded, mobile-first public leaderboard for GasFeel"s FUNAAB Content Challenge.
*   To display contestant scores and rankings with near-real-time updates.
*   To offer a simple, safe, two-lane "backdoor" interface for GasFeel CSRs and Admins to manage contestant points.
*   To ensure the system feels "live" and fair to contestants.
*   To deliver a reliable platform capable of handling target viewer traffic.

Target Audience:
*   Primary: FUNAAB University students/contestants (mobile-first viewers).
*   Secondary: GasFeel Customer Service Representatives (CSRs) for quick, error-resistant point additions.
*   Tertiary: GasFeel Administrators for approving AI-generated submissions and finalizing results.

Timeline: The Content Challenge runs from Sunday, October 5, 2025, 10:00 AM to Monday, October 20, 2025, 10:00 AM (Africa/Lagos). A test launch is required before these dates.

2. Product Overview
Description: The GasFeel Leaderboard project encompasses a public-facing web application displaying contest standings and two internal administrative interfaces ("backdoor") for managing contestant points. The public leaderboard offers real-time updates, search functionality, and a branded user experience. The backdoor consists of a CSR-specific page for adding fixed points and an Admin-specific page for reviewing and approving AI-submitted points.

Key Features:
*   Public-facing, near-real-time leaderboard displaying contestant ranks, IDs, and points.
*   "Top-3" podium display and "Top-100" list.
*   Search functionality and deep-linking for individual contestant IDs.
*   Dynamic display of "Your Rank" for contestants outside the Top-100.
*   Two distinct administrative interfaces ("backdoors"):
    *   CSR Add Points: A simplified interface for CSRs to add 10 points to a single contestant ID.
    *   Admin Approvals: An interface for Admins to review, approve, or reject AI-generated point submissions, with bulk action capabilities.
*   Contest state management: Live, Verification, and Final modes.
*   Branded, mobile-first user interface with accessibility considerations.

High-Level Technical Stack:
*   Hosting & UI: Vercel (for both public and backdoor interfaces).
*   Database & Authentication: Supabase (Postgres) with Google OAuth (for CSR and Admin roles).
*   Real-time Transport: Server-Sent Events (SSE) with a 2-second cadence.
*   Analytics: Vercel Analytics (for essential metrics like views, uniques, searches).
*   Branding: Inter + Phosphor (light) fonts, glassmorphic UI elements, specific GasFeel color palette.

Why This Stack: The chosen stack is designed for fast shipping, minimal moving parts, strong consistency for ranks and tie-breaks, and reliable performance at the target viewer numbers (5k–15k concurrent viewers).

3. Functional Requirements

3.1 Public Leaderboard

3.1.1 Display Data:
*   Only "Contestant ID" (formatted as `GF-XXXXXX`) and "points" are explicitly displayed in the main list.
*   Rank (with medallion icon for Top-100) is displayed alongside.
*   Top-3 podium includes crown icons.

3.1.2 UI Components:
*   Header: Displays GasFeel logo (charcoal), the title "GasFeel Content Challenge", and a search input field. No footer rules link.
*   Top-3 Podium: A hero section featuring the top three contestants with crown icons. The #1 contestant"s display is taller. On mobile devices, the podium is stacked vertically.
*   Top-100 List: A scrolling list displaying contestants from rank 1 to 100 with their rank medallion, `GF-XXXXXX` ID, and plain number points.
*   Search: An input field with placeholder text "Enter your ID (e.g., GF‑AB12CD)". Upon entering an ID, the list automatically scrolls to and briefly highlights the corresponding contestant.
*   Deep-Linking: Supports `?id=GF-XXXXXX` URL parameter to automatically highlight a specific contestant on page load.
*   "Your Rank" Mini-Card: If a searched contestant ID is not within the Top-100, a mini-card will appear above the Top-100 list, showing their rank and +/-10 neighboring contestants.
*   "Last updated" Indicator: A relative timestamp indicating when the leaderboard data was last refreshed.
*   Countdown Timer: A segment-chip display indicating "Ends in" for the duration of the challenge.

3.1.3 Real-time Updates:
*   Data transport: Server-Sent Events (SSE).
*   Cadence: Updates are pushed every 2 seconds, sending diffs/ticks.
*   Degradation: If necessary due to high traffic, the cadence can degrade to 5-10 seconds.

3.1.4 Contest States & Transitions:
*   Live Mode: Active display of ranks, points, and a countdown timer.
*   Verification Mode: Activated automatically at the `end_at` deadline. The countdown is replaced by a slim info bar displaying "Contest ended — results pending verification.". CSR Add Points functionality is disabled.
*   Final Mode: Activated by an Admin manually selecting "Publish Final Results". This replaces the "Verification mode" banner and signifies the official end of results processing.

3.1.5 Tie-break Rules:
*   Rule 1: Higher `current_points` always wins.
*   Rule 2: If `current_points` are tied, the winner is determined by who first reached that total.
    *   For points from AI approvals: The `AiSubmission.server_received_at` of the decisive submission is used.
    *   For points from CSR adds: The server time of the CSR submission that caused the total is used.
*   Maintenance: The `first_reached_current_points_at` timestamp in the `Contestant` data model is maintained by replaying relevant ledger entries upon any score change.

3.1.6 Branding & UI Principles:
*   Theme: Brand-light with a very subtle top-left to bottom-right gradient background and a faint GasFeel watermark.
*   Cards/Rows: Light glassmorphic effect (6–8px blur, 1px inner border), with gentle shadows. Normal row density.
*   Buttons: Pill-shaped. "Approve," "Add," and "Publish" buttons are Golden Sun filled. "Reject" buttons are charcoal with a Deep Tangerine border.
*   Countdown: Segment chips for visual display.
*   Microcopy: Header title "GasFeel Content Challenge"; countdown "Ends in"; banners as specified; no footer rules link.
*   Color Palette: Bright cobalt blue (60%), Snow White (30%), Deep Tangerine (10%), Golden Sun (10%), Pastel Lavender (10%).
*   Typography: Inter and Phosphor (light) fonts.

3.1.7 Accessibility:
*   Strong contrast ratios.
*   Legible font sizes.
*   Keyboard navigable interfaces.
*   Respects user "reduce motion" preferences.

3.2 Backdoor Operations

3.2.1 Authentication & Authorization:
*   All backdoor access requires Google Sign-In.
*   Roles (CSR, Admin) are managed and enforced via Supabase (Postgres).

3.2.2 CSR Add Points Page (Role: CSR)
*   Access: Only authenticated users with the "CSR" role can access this page.
*   Functionality: Presents a form requiring a "Contestant ID" input. The action available is to "Add 10 points" (this amount is fixed). Points are applied immediately upon submission.
*   Guardrails:
    *   Validation: The system must validate that the entered `Contestant ID` exists.
    *   Preview: A "Current → Next" points preview is shown before submission.
    *   Confirmation: A confirmation dialog appears before points are applied.
    *   Feedback: A success toast notification is displayed upon successful point addition.
*   Restrictions:
    *   No bulk additions. Points must be added one contestant at a time.
    *   No edits or voids. Once points are added, the transaction is final and cannot be reversed or modified via this interface.
    *   Auto-Disabled: The "Add Points" functionality and/or page will be automatically disabled at the `end_at` deadline of the contest.

3.2.3 Admin Approvals Page (Role: Admin)
*   Access: Only authenticated users with the "Admin" role can access this page.
*   Functionality: Displays a table of AI-agent submissions with columns for "ID", "Points", "Received", and "Status".
*   Filters: The table includes filters for submission status (Pending / Approved / Rejected / Ineligible).
*   Approval Actions: Admins can "Approve" or "Reject" submissions. These actions can be performed on single items or in bulk.
*   Post-deadline Rule: AI submissions are approvable only if their `server_received_at` timestamp is less than or equal to the contest `end_at` deadline. Submissions received after the deadline are automatically marked as "ineligible".
*   Admin Controls:
    *   Freeze/Unfreeze Public Display: Allows Admins to temporarily pause or resume updates to the public leaderboard.
    *   Publish Final Results: A control to transition the public leaderboard"s state from "Verification mode" to "Final mode", indicating that results are officially published.

4. Non-Functional Requirements

4.1 Performance & Scalability
*   Traffic Target: The system is expected to operate smoothly for 5,000–20,000 concurrent viewers.
*   Read Performance: The top-100 ranked data is cached to ensure fast access. Server-Sent Events (SSE) push diffs/ticks every 2 seconds to keep the public display fresh. The system is designed to degrade gracefully to a 5–10 second cadence if under extreme load.
*   Write Performance: CSR additions and Admin approvals (AI submissions) are anticipated to be low volume, easily handled by the Postgres database. While backdoor modifications may be frequent in terms of individual transactions, their overall volume will not strain the system.
*   Database Indexes: Essential indexes will be created on `external_id`, `current_points`, and relevant timestamp fields to facilitate fast sorting and searching.

4.2 Security & Audit Trail
*   Authentication: All access to backdoor operations is secured using Google OAuth, integrated with Supabase.
*   Authorization: Role-based access control (CSR, Admin) is enforced via Supabase policies, linked to Google accounts.
*   Audit Trail: The `ScoreChange` table serves as an append-only ledger, recording every point modification. Each entry includes the `source` (csr/ai), `source_ref_id` (if from AiSubmission), `delta` (always positive), `created_at` (server time of application/approval), and `applied_by_user_id` (the Google email of the CSR or Admin). The `AiSubmission` table also tracks `decided_by_user_id` and `decided_at` for approval decisions.

4.3 Technical Integration & Stack
*   Hosting/UI: Vercel will host both the public-facing leaderboard and the private backdoor interfaces, leveraging its global CDN and serverless functions for performance and scalability.
*   Database & Auth: Supabase (Postgres) provides the relational database for contestant data, scores, and ledger, along with integrated Google OAuth for secure user authentication and role management.
*   Real-time Transport: Server-Sent Events (SSE) is chosen for its simplicity, efficiency, and broad browser support for pushing real-time updates to connected clients.
*   Analytics: Vercel Analytics will be integrated to track essential public page metrics such as views, unique visitors, and search usage patterns.
*   Branding: Custom CSS incorporating Inter and Phosphor (light) fonts and the specified GasFeel color palette will ensure consistent branding.

4.4 Deployment & Maintenance
*   Deployment: The chosen stack (Vercel, Supabase) facilitates efficient and streamlined deployments, enabling rapid iterations and updates.
*   Maintenance: The architecture with minimal moving parts is designed to require low ongoing maintenance and operational overhead.

5. Data Model

Conceptual data model:
Contest
- id (single row), name
- start_at, end_at
- status: live | verification | final
- last_published_at
- rules_url (optional)

Contestant
- id (UUID)
- external_id (text, "GF-XXXXXX") // unique, bot-generated
- phone_whatsapp (text, unique) // one-per-person key
- first_name (text)
- department (text)
- student_email (text, optional)
- current_points (int, default 0)
- first_reached_current_points_at (timestamptz) // maintained from ledger
- created_at, updated_at

AiSubmission // inbox for Admin approvals
- id (UUID)
- contestant_id (fk) OR external_id (text)
- delta (int > 0) // positive amounts from bot
- server_received_at (timestamptz) // definitive time for tie-break
- status: pending | approved | rejected | ineligible_late
- decided_by_user_id (text, nullable)
- decided_at (timestamptz, nullable)

ScoreChange // append-only ledger of live changes
- id (UUID)
- contestant_id (fk)
- source: csr | ai // internal only
- source_ref_id (UUID, nullable) // AiSubmission id when source=ai
- delta (int > 0) // always positive
- created_at (timestamptz) // csr: apply time; ai: approval time
- applied_by_user_id (text) // CSR/Admin email

## Technology Stack
TECHSTACK

1.  OVERVIEW AND CORE JUSTIFICATION
    The GasFeel Content Challenge Leaderboard leverages a modern, lean, and highly integrated technology stack designed for rapid development, strong data consistency, and reliable performance under high traffic. The core principles guiding this selection are:
    *   **Fast to ship:** Enabling quick deployment within the project's tight timeline.
    *   **Minimal moving parts:** Reducing operational complexity and maintenance overhead.
    *   **Strong consistency:** Ensuring accurate ranks and tie-break logic for a fair contest.
    *   **Reliability & Scalability:** Handling 5k-20k concurrent viewers smoothly with near-real-time updates.
    *   **Security:** Providing robust authentication and authorization for sensitive backdoor operations.

    The foundational stack consists of Next.js (React) for both frontend and API routes, Supabase (PostgreSQL) for database and authentication, and Vercel for hosting and deployment. Real-time updates are powered by Server-Sent Events (SSE).

2.  FRONTEND TECHNOLOGIES
    *   **Framework:** Next.js (React)
        *   **Justification:** Chosen for its versatility in building modern web applications. Next.js provides excellent developer experience, server-side rendering (SSR) for optimal initial load performance of the public leaderboard, static site generation (SSG) for potential content, and efficient client-side routing. Its mobile-first capabilities align with the primary audience's viewing habits. It also serves as the foundation for the "backdoor" UI.
    *   **Styling & UI Library:** Tailwind CSS, PostCSS
        *   **Justification:** Tailwind CSS enables rapid, utility-first styling, ensuring consistency with GasFeel's specific branding (glassmorphic cards, pill buttons, toned-down glows, specific color palette) and facilitating responsive design for a mobile-first audience. PostCSS is used for processing Tailwind and other CSS requirements.
    *   **Real-time Transport (Client):** Server-Sent Events (SSE)
        *   **Justification:** The client-side implementation of SSE provides an efficient, unidirectional stream for receiving near-real-time leaderboard updates (every 2 seconds). It's simpler to implement than WebSockets for server-to-client only communication and boasts excellent browser support.
    *   **Branding & Design System:**
        *   **Fonts:** Inter (primary typeface), Phosphor Icons (light variant)
        *   **Styling Principles:** Adherence to "brand-light, toned down" UI design, incorporating subtle brand gradients, glassmorphic cards with 6-8px blur and 1px inner border, pill-shaped buttons, and GasFeel's brand colors (Bright Cobalt Blue, Snow White, Deep Tangerine, Golden Sun, Pastel Lavender).
        *   **Justification:** Ensures a cohesive, branded, and accessible user experience across both the public leaderboard and the internal operations pages, meeting audience and branding expectations.

3.  BACKEND TECHNOLOGIES
    *   **API Framework:** Next.js API Routes
        *   **Justification:** By leveraging Next.js API routes, the backend logic for CSR adds, Admin approvals, and data retrieval is co-located with the frontend application. This aligns with the "minimal moving parts" goal, simplifying development, deployment, and maintenance. It's well-suited for handling the anticipated low volume of write operations while providing a robust interface for data interactions.
    *   **Real-time Transport (Server):** Server-Sent Events (SSE)
        *   **Justification:** The backend implements SSE to push leaderboard updates to connected clients at a 2-second cadence. This mechanism is ideal for broadcasting changes efficiently to a large number of viewers without the overhead of WebSockets, supporting the "near-real-time" requirement.
    *   **Authentication & Authorization:** Supabase Auth (with Google OAuth)
        *   **Justification:** Supabase Auth provides a comprehensive, out-of-the-box solution for user management. Google Sign-In is integrated for CSR and Admin roles, leveraging existing trusted identity providers for secure access. Role-Based Access Control (RBAC) via Supabase's Row Level Security (RLS) ensures that CSRs can only perform specific "add points" actions and Admins have appropriate permissions for approvals and finalization, enforcing strict security and audit trails.

4.  DATABASE & DATA MANAGEMENT
    *   **Database:** Supabase (PostgreSQL)
        *   **Justification:** PostgreSQL, hosted by Supabase, is chosen for its strong transactional consistency, reliability, and robust feature set. This is critical for accurately maintaining contestant scores, implementing complex tie-break rules (e.g., `first_reached_current_points_at`), and ensuring data integrity. Supabase's managed service simplifies database operations and provides real-time capabilities that can be leveraged if future needs arise. It easily handles the low volume of write operations for score modifications and AI submission approvals.
    *   **Caching Strategy:** Application-level caching for Top-100 reads
        *   **Justification:** To manage anticipated high read traffic (5k-20k viewers), the top 100 leaderboard entries will be aggressively cached at the application level (e.g., in-memory or a lightweight caching layer within the Next.js application). This significantly reduces database load for the most frequently requested data, while SSE pushes diffs/ticks every 2 seconds to keep cached clients updated.
    *   **Indexing:**
        *   `Contestant.external_id`: For fast search and deep-linking by contestant ID, and for backdoor operations.
        *   `Contestant.current_points`: For efficient sorting to determine leaderboard ranks.
        *   `Contestant.first_reached_current_points_at`: Essential for the tie-break rule.
        *   `AiSubmission.server_received_at`: Critical for identifying eligible AI submissions and for AI-based tie-break scenarios.
        *   `ScoreChange.created_at`: For efficient replay of ledger entries to maintain `first_reached_current_points_at`.
        *   **Justification:** Strategic indexing is crucial for optimizing query performance, especially for real-time sorting, searching, and complex tie-break logic over a potentially large dataset of contestants.

5.  HOSTING & INFRASTRUCTURE
    *   **Platform:** Vercel
        *   **Justification:** Vercel provides a seamless, high-performance hosting environment for Next.js applications, encompassing both the public-facing leaderboard and the private backdoor interfaces. Its global CDN ensures fast content delivery to a dispersed audience, while its automatic scaling capabilities reliably handle traffic spikes up to 20k concurrent viewers. Vercel's integrated CI/CD pipeline streamlines deployment, aligning with the "fast to ship" and "minimal moving parts" goals.

6.  MONITORING & ANALYTICS
    *   **Analytics:** Vercel Analytics
        *   **Justification:** Provides essential website metrics such as views, unique visitors, and search queries, directly integrated with the Vercel hosting platform for easy setup and monitoring of public leaderboard engagement.
    *   **Monitoring:** Supabase Dashboard, Vercel Logs
        *   **Justification:** These tools offer comprehensive insights into database performance, API request logs, and application health, enabling proactive identification and resolution of any operational issues.

7.  DEVELOPMENT WORKFLOW & TOOLS
    *   **Version Control:** Git
        *   **Justification:** Standard for collaborative software development, providing robust version tracking and team collaboration.
    *   **Repository Hosting:** (e.g., GitHub, GitLab)
        *   **Justification:** Secure hosting for the project's codebase, integrating with Vercel's CI/CD for automated deployments.
    *   **CI/CD:** Vercel's Integrated CI/CD
        *   **Justification:** Automates the build, test, and deployment process upon code changes, ensuring consistent deployments and supporting rapid iterative development for the tight project timeline.

## Project Structure
.
/
├── .env.local
│   └── # Environment variables for Supabase (URL, ANON_KEY), Google OAuth (Client ID, Secret), etc.
├── .gitignore
│   └── # Specifies intentionally untracked files to ignore from Git.
├── next.config.mjs
│   └── # Next.js configuration, e.g., for custom headers, environment variables, image optimization.
├── package.json
│   └── # Defines project metadata, scripts (dev, build, start), and lists project dependencies.
├── pnpm-lock.yaml
│   └── # pnpm lock file to ensure consistent dependency installations.
├── postcss.config.js
│   └── # PostCSS configuration, primarily for Tailwind CSS.
├── public/
│   ├── favicon.ico
│   │   └── # Website favicon.
│   ├── gasfeel-logo.svg
│   │   └── # GasFeel brand logo for display.
│   └── gasfeel-watermark.svg
│       └── # Faint GasFeel watermark for background branding.
├── README.md
│   └── # Project overview, setup instructions, and deployment details.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   │   └── # NextAuth.js API route for Google OAuth authentication if used, otherwise direct Supabase client handles it.
│   │   │   ├── leaderboard/route.ts
│   │   │   │   └── # API endpoint to fetch the initial or cached public leaderboard data.
│   │   │   ├── sse/route.ts
│   │   │   │   └── # Dedicated Server-Sent Events (SSE) endpoint to stream real-time leaderboard updates (diffs/ticks every 2s).
│   │   │   ├── admin/
│   │   │   │   ├── submissions/route.ts
│   │   │   │   │   └── # Handles GET requests for AI submissions to review and POST requests for bulk approve/reject actions.
│   │   │   │   └── controls/route.ts
│   │   │   │       └── # Handles POST requests for "Freeze/Unfreeze" public display and "Publish Final Results" actions.
│   │   │   └── csr/
│   │   │       └── add-points/route.ts
│   │   │           └── # Handles POST requests from CSRs to add 10 points to a contestant.
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   │   └── # Layout for public-facing pages (header, general styling).
│   │   │   ├── page.tsx
│   │   │   │   └── # The main public leaderboard page, displaying top-3, top-100, search, and countdown.
│   │   │   └── [id]/page.tsx
│   │   │       └── # Dynamic page for deep-linking to a specific contestant ID, auto-highlighting their entry.
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   │   └── # Layout for authentication-related pages.
│   │   │   └── sign-in/page.tsx
│   │   │       └── # Page for user sign-in, primarily via Google Sign-In.
│   │   ├── (admin)/
│   │   │   ├── layout.tsx
│   │   │   │   └── # Layout for admin pages, including authentication and role-based access control (Admin role check).
│   │   │   └── page.tsx
│   │   │       └── # Admin dashboard page for reviewing AI submissions and managing contest status.
│   │   ├── (csr)/
│   │   │   ├── layout.tsx
│   │   │   │   └── # Layout for CSR pages, including authentication and role-based access control (CSR role check).
│   │   │   └── page.tsx
│   │   │       └── # CSR "Add Points" page for manual point additions.
│   │   ├── globals.css
│   │   │   └── # Global CSS file, including Tailwind directives and custom global styles for branding.
│   │   └── layout.tsx
│   │       └── # The root layout of the application, defining the <html> and <body> tags.
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Toast.tsx
│   │   │       └── # Reusable, generic UI components adhering to the GasFeel brand design principles.
│   │   ├── common/
│   │   │   ├── AuthGuard.tsx
│   │   │   │   └── # Component/hook to protect routes and content based on user authentication and role.
│   │   │   ├── CountdownTimer.tsx
│   │   │   │   └── # Displays the contest countdown, switching to "Verification mode" at deadline.
│   │   │   ├── Header.tsx
│   │   │   │   └── # Global header component for the public leaderboard (logo, title, search).
│   │   │   ├── Spinner.tsx
│   │   │   │   └── # Generic loading indicator.
│   │   │   └── StatusBanner.tsx
│   │   │       └── # Displays informational banners (e.g., "Verification mode", "Contest ended").
│   │   ├── leaderboard/
│   │   │   ├── Podium.tsx
│   │   │   │   └── # Renders the Top-3 podium with crown icons, stacked on mobile.
│   │   │   ├── LeaderboardList.tsx
│   │   │   │   └── # Renders the Top-100 list with contestant IDs and points.
│   │   │   ├── ContestantSearch.tsx
│   │   │   │   └── # Search input field for contestants, with auto-scroll and highlight.
│   │   │   └── YourRankCard.tsx
│   │   │       └── # Mini-card displaying a contestant's rank and neighbors if not in the Top-100.
│   │   ├── admin/
│   │   │   ├── AdminSubmissionsTable.tsx
│   │   │   │   └── # Table for displaying and managing AI submissions (pending, approved, rejected, ineligible), with filters.
│   │   │   └── AdminControls.tsx
│   │   │       └── # Contains the "Freeze/Unfreeze" public display and "Publish Final Results" buttons.
│   │   └── csr/
│   │       └── AddPointsForm.tsx
│   │           └── # Form for CSRs to add 10 points to a single contestant ID, with validation and preview.
│   ├── lib/
│   │   ├── auth.ts
│   │   │   └── # Supabase Auth helper functions (signInWithGoogle, signOut, getSession, getUserRole).
│   │   ├── constants.ts
│   │   │   └── # Application-wide constants: contest dates, fixed point values, user roles, branding colors.
│   │   ├── database.types.ts
│   │   │   └── # TypeScript types automatically generated from the Supabase database schema for type safety.
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   │   └── # Custom React hook for accessing current user authentication state and roles.
│   │   │   └── useSSE.ts
│   │   │       └── # Custom React hook for establishing and consuming Server-Sent Events updates.
│   │   ├── queries/
│   │   │   ├── admin.ts
│   │   │   │   └── # Client-side data fetching functions for admin operations (e.g., fetching submissions, status controls).
│   │   │   ├── leaderboard.ts
│   │   │   │   └── # Client-side data fetching functions for public leaderboard data.
│   │   │   └── csr.ts
│   │   │       └── # Client-side data fetching functions for CSR operations (e.g., adding points).
│   │   ├── supabase/
│   │   │   └── client.ts
│   │   │       └── # Initializes and exports the Supabase client instance for client-side interactions.
│   │   └── utils.ts
│   │       └── # General utility functions (date formatting, ID validation, string manipulation, etc.).
│   ├── server/
│   │   ├── services/
│   │   │   ├── contestantService.ts
│   │   │   │   └── # Business logic for managing contestants, their points, and `first_reached_current_points_at`.
│   │   │   ├── leaderboardService.ts
│   │   │   │   └── # Business logic for fetching, caching (Top-100), and preparing leaderboard data for display and SSE.
│   │   │   └── submissionService.ts
│   │   │       └── # Business logic for processing AI submissions (approval, rejection, eligibility checks).
│   │   └── sse-emitter.ts
│   │       └── # Manages SSE connections and the logic for broadcasting leaderboard updates (diffs/ticks).
│   └── styles/
│       ├── tailwind.css
│       │   └── # Imports Tailwind CSS base, components, and utilities layers.
│       └── base.css
│           └── # Custom base styles, CSS variables for branding colors, and global overrides.
├── supabase/
│   ├── config.toml
│   │   └── # Configuration file for the Supabase CLI.
│   ├── migrations/
│   │   ├── YYYYMMDDHHMMSS_initial_schema.sql
│   │   │   └── # Defines the initial database schema for Contest, Contestant, AiSubmission, ScoreChange tables.
│   │   └── YYYYMMDDHHMMSS_add_rls_policies.sql
│   │       └── # SQL migration for applying Row Level Security (RLS) policies.
│   ├── seed.sql
│   │   └── # SQL script to populate the database with initial data for development/testing.
│   ├── rls_policies.sql
│   │   └── # Explicit SQL definitions for Row Level Security policies to enforce access control.
│   ├── triggers.sql
│   │   └── # SQL scripts for database triggers, essential for maintaining `first_reached_current_points_at` based on `ScoreChange` entries.
│   └── views.sql
│       └── # SQL scripts for creating database views, e.g., an optimized view for leaderboard queries, including tie-break logic.
├── tailwind.config.ts
│   └── # Tailwind CSS configuration, including custom theme, colors (GasFeel palette), and content paths.
└── tsconfig.json
    └── # TypeScript configuration file, defining compiler options and project files.

## Database Schema Design
SCHEMADESIGN

This section details the database schema design for the "GasFeel" project, supporting the public leaderboard, near real-time updates, and the two-lane operational backdoor for CSRs and Admins. The database system is PostgreSQL, hosted via Supabase, leveraging its robust features for consistency, scalability, and security.

### 1. Database System

*   **Provider:** Supabase
*   **Core Database:** PostgreSQL
*   **Authentication:** Google OAuth integrated with Supabase Auth for CSR and Admin roles.

### 2. Schema Overview

The database schema is designed around four core entities: `Contest`, `Contestant`, `AiSubmission`, and `ScoreChange`. This structure ensures a clear separation of concerns, maintains data integrity, provides an immutable audit trail, and facilitates efficient retrieval for the leaderboard.

### 3. Table Designs

#### 3.1. `contest` Table

*   **Purpose:** Stores global parameters and state for the content challenge. Designed as a single-row table to hold configuration.
*   **Columns:**
    *   `id` UUID
        *   **Constraints:** PRIMARY KEY, NOT NULL, DEFAULT `gen_random_uuid()`
        *   **Description:** Unique identifier for the contest. In practice, this table will likely contain only one row for the "GasFeel FUNAAB Content Challenge".
    *   `name` TEXT
        *   **Constraints:** NOT NULL
        *   **Description:** The official name of the contest (e.g., "GasFeel Content Challenge").
    *   `start_at` TIMESTAMPTZ
        *   **Constraints:** NOT NULL
        *   **Description:** The official start date and time of the contest (e.g., "Sun, Oct 5, 2025, 10:00 AM Africa/Lagos").
    *   `end_at` TIMESTAMPTZ
        *   **Constraints:** NOT NULL
        *   **Description:** The official end date and time of the contest (e.g., "Mon, Oct 20, 2025, 10:00 AM Africa/Lagos"). CSR point adds are disabled after this time.
    *   `status` TEXT
        *   **Constraints:** NOT NULL, CHECK (`status` IN ('live', 'verification', 'final')), DEFAULT 'live'
        *   **Description:** Current state of the contest for public display and backend logic.
            *   `live`: Contest is active, points are being added, leaderboard is live.
            *   `verification`: Contest ended, results are pending Admin approval.
            *   `final`: Results are published, no more changes allowed.
    *   `last_published_at` TIMESTAMPTZ
        *   **Constraints:** NULLABLE
        *   **Description:** Timestamp when the 'final' results were published by an Admin.
    *   `freeze_public_display` BOOLEAN
        *   **Constraints:** NOT NULL, DEFAULT FALSE
        *   **Description:** A flag controlled by Admins to temporarily pause public leaderboard updates.
    *   `rules_url` TEXT
        *   **Constraints:** NULLABLE
        *   **Description:** URL to the contest rules (optional, not displayed on public page as per requirements).
    *   `created_at` TIMESTAMPTZ
        *   **Constraints:** NOT NULL, DEFAULT `now()`
        *   **Description:** Timestamp of record creation.
    *   `updated_at` TIMESTAMPTZ
        *   **Constraints:** NOT NULL, DEFAULT `now()`
        *   **Description:** Last update timestamp for the record.

#### 3.2. `contestants` Table

*   **Purpose:** Stores contestant profiles and their current score state. This is the primary table for leaderboard display.
*   **Columns:**
    *   `id` UUID
        *   **Constraints:** PRIMARY KEY, NOT NULL, DEFAULT `gen_random_uuid()`
        *   **Description:** Unique identifier for the contestant.
    *   `external_id` TEXT
        *   **Constraints:** UNIQUE, NOT NULL, CHECK (`external_id` ~ '^GF-[A-Z0-9]{6}$')
        *   **Description:** Publicly displayed ID (e.g., "GF-XXXXXX"). Used for search, deep-linking, and CSR/Admin operations.
    *   `phone_whatsapp` TEXT
        *   **Constraints:** UNIQUE, NOT NULL, CHECK (`phone_whatsapp` ~ '^\+[1-9]\d{1,14}$')
        *   **Description:** WhatsApp phone number, used as a unique identifier for a person. (e.g., "+2348012345678").
    *   `first_name` TEXT
        *   **Constraints:** NOT NULL
        *   **Description:** Contestant's first name.
    *   `department` TEXT
        *   **Constraints:** NULLABLE
        *   **Description:** Contestant's academic department (optional).
    *   `student_email` TEXT
        *   **Constraints:** NULLABLE, UNIQUE
        *   **Description:** Contestant's student email address (optional, for future communication).
    *   `current_points` INT
        *   **Constraints:** NOT NULL, DEFAULT 0, CHECK (`current_points` >= 0)
        *   **Description:** The contestant's current total points. This value is derived from `score_changes`.
    *   `first_reached_current_points_at` TIMESTAMPTZ
        *   **Constraints:** NOT NULL
        *   **Description:** The timestamp when the contestant first achieved their `current_points` total. Crucial for tie-breaking: earlier timestamp wins for identical `current_points`. This field is updated whenever `current_points` increases.
    *   `created_at` TIMESTAMPTZ
        *   **Constraints:** NOT NULL, DEFAULT `now()`
        *   **Description:** Timestamp of record creation.
    *   `updated_at` TIMESTAMPTZ
        *   **Constraints:** NOT NULL, DEFAULT `now()`
        *   **Description:** Last update timestamp for the record, automatically updated on row modification.
*   **Indexes:**
    *   `idx_contestants_external_id` ON `contestants` (`external_id`) - For fast lookup by public ID.
    *   `idx_contestants_phone_whatsapp` ON `contestants` (`phone_whatsapp`) - For ensuring uniqueness and potential future lookups.
    *   `idx_leaderboard_order` ON `contestants` (`current_points` DESC, `first_reached_current_points_at` ASC) - **Composite index** for efficient leaderboard sorting (highest points first, then earliest time for ties).
*   **Triggers/Functions:**
    *   `update_contestant_updated_at`: An automatic trigger to update the `updated_at` column on row changes.

#### 3.3. `ai_submissions` Table

*   **Purpose:** Acts as an inbox for point submissions originating from the AI agent (WhatsApp bot), awaiting Admin approval.
*   **Columns:**
    *   `id` UUID
        *   **Constraints:** PRIMARY KEY, NOT NULL, DEFAULT `gen_random_uuid()`
        *   **Description:** Unique identifier for the AI submission.
    *   `contestant_id` UUID
        *   **Constraints:** NOT NULL, FOREIGN KEY REFERENCES `contestants(id)` ON DELETE RESTRICT
        *   **Description:** Foreign key linking to the `contestants` table.
    *   `delta` INT
        *   **Constraints:** NOT NULL, CHECK (`delta` > 0)
        *   **Description:** The number of points to add if approved (always positive).
    *   `server_received_at` TIMESTAMPTZ
        *   **Constraints:** NOT NULL
        *   **Description:** The exact server timestamp when the AI submission was received. This is the definitive time used for tie-breaking if approved.
    *   `status` TEXT
        *   **Constraints:** NOT NULL, CHECK (`status` IN ('pending', 'approved', 'rejected', 'ineligible_late')), DEFAULT 'pending'
        *   **Description:** Current status of the submission.
            *   `pending`: Awaiting Admin review.
            *   `approved`: Approved by Admin, points added to contestant.
            *   `rejected`: Rejected by Admin, points not added.
            *   `ineligible_late`: Automatically marked as ineligible if `server_received_at` is after `contest.end_at`.
    *   `decided_by_user_id` TEXT
        *   **Constraints:** NULLABLE
        *   **Description:** Google ID (email) of the Admin who approved or rejected the submission. Null if `pending` or `ineligible_late`.
    *   `decided_at` TIMESTAMPTZ
        *   **Constraints:** NULLABLE
        *   **Description:** Timestamp when the Admin made a decision. Null if `pending` or `ineligible_late`.
    *   `created_at` TIMESTAMPTZ
        *   **Constraints:** NOT NULL, DEFAULT `now()`
        *   **Description:** Timestamp of record creation.
    *   `updated_at` TIMESTAMPTZ
        *   **Constraints:** NOT NULL, DEFAULT `now()`
        *   **Description:** Last update timestamp for the record.
*   **Indexes:**
    *   `idx_ai_submissions_contestant_id` ON `ai_submissions` (`contestant_id`) - For quickly finding all submissions for a contestant.
    *   `idx_ai_submissions_status` ON `ai_submissions` (`status`) - For filtering pending/approved/rejected submissions in the Admin UI.
    *   `idx_ai_submissions_server_received_at` ON `ai_submissions` (`server_received_at`) - For efficiently checking late submissions.

#### 3.4. `score_changes` Table

*   **Purpose:** An immutable, append-only ledger that records every successful point modification to a contestant's score. This provides a full audit trail and is used to derive `current_points` and `first_reached_current_points_at` for contestants.
*   **Columns:**
    *   `id` UUID
        *   **Constraints:** PRIMARY KEY, NOT NULL, DEFAULT `gen_random_uuid()`
        *   **Description:** Unique identifier for the score change event.
    *   `contestant_id` UUID
        *   **Constraints:** NOT NULL, FOREIGN KEY REFERENCES `contestants(id)` ON DELETE RESTRICT
        *   **Description:** Foreign key linking to the `contestants` table.
    *   `source` TEXT
        *   **Constraints:** NOT NULL, CHECK (`source` IN ('csr', 'ai'))
        *   **Description:** Indicates the origin of the point change.
            *   `csr`: Points added directly by a CSR.
            *   `ai`: Points approved from an `ai_submission`.
    *   `source_ref_id` UUID
        *   **Constraints:** NULLABLE, FOREIGN KEY REFERENCES `ai_submissions(id)` ON DELETE SET NULL (conditional FK)
        *   **Description:** If `source` is 'ai', this references the `id` of the `ai_submission` that was approved. Null for 'csr' source.
    *   `delta` INT
        *   **Constraints:** NOT NULL, CHECK (`delta` > 0)
        *   **Description:** The number of points added (always positive).
    *   `created_at` TIMESTAMPTZ
        *   **Constraints:** NOT NULL, DEFAULT `now()`
        *   **Description:** The server timestamp when the score change was applied. For CSR adds, this is the application time. For AI approvals, this is the approval time (not `server_received_at` of `AiSubmission`). This timestamp is used to update `Contestant.first_reached_current_points_at`.
    *   `applied_by_user_id` TEXT
        *   **Constraints:** NOT NULL
        *   **Description:** Google ID (email) of the CSR or Admin who initiated or approved the point change.
*   **Indexes:**
    *   `idx_score_changes_contestant_id` ON `score_changes` (`contestant_id`) - For efficiently replaying ledger for a specific contestant.
    *   `idx_score_changes_created_at` ON `score_changes` (`created_at` DESC) - For chronological access and audit.

### 4. Relationships

*   `contestants` (N) <- (1) `contest`: Implicitly, all contestants belong to the single active contest.
*   `ai_submissions` (N) -> (1) `contestants`: Each AI submission is for a specific contestant.
*   `score_changes` (N) -> (1) `contestants`: Each score change applies to a specific contestant.
*   `score_changes` (N) -> (0 or 1) `ai_submissions`: A `score_change` with `source='ai'` refers to an `ai_submission`.

### 5. Data Flow & Update Mechanisms

1.  **CSR Add Points:**
    *   CSR submits form -> Backend validates `external_id` and contest `end_at` -> Creates a `score_changes` entry with `source='csr'` and `applied_by_user_id` -> Updates `contestants.current_points` and `contestants.first_reached_current_points_at` (to `score_changes.created_at`).
2.  **Admin Approvals (AI Submissions):**
    *   AI bot sends submission -> Creates `ai_submissions` entry with `status='pending'` and `server_received_at`.
    *   Admin reviews `ai_submissions` in backend -> Changes `status` to `approved` or `rejected`, sets `decided_by_user_id` and `decided_at`.
    *   If `approved`: Creates a `score_changes` entry with `source='ai'`, `source_ref_id` (to `ai_submissions.id`), `applied_by_user_id` -> Updates `contestants.current_points` and `contestants.first_reached_current_points_at` (to `score_changes.created_at`).
    *   If `server_received_at` > `contest.end_at` (and `contest.status` is no longer 'live'): `ai_submissions.status` is automatically set to `ineligible_late`.
3.  **Leaderboard Display:**
    *   Queries `contestants` table, ordered by `current_points` DESC, `first_reached_current_points_at` ASC.
    *   Cached for Top-100.
    *   SSE pushes diffs/ticks based on changes to `contestants.current_points` and `contestants.first_reached_current_points_at`.
4.  **Tie-break Logic:**
    *   The `contestants.first_reached_current_points_at` column is crucial. Since points can only increase (`delta > 0`), this column will store the timestamp of the *latest* `score_change` event that resulted in the contestant's current `current_points` total. If two contestants have the same `current_points`, the one with the *earlier* `first_reached_current_points_at` timestamp will rank higher. This directly implements the "first reached that total" rule for a strictly increasing point system.

### 6. Security & Auditability

*   **Role-Based Access Control (RBAC):** Supabase Row-Level Security (RLS) will be configured, tied to Google OAuth roles (`admin`, `csr`, `public`).
    *   Public users: Read-only access to `contest` and `contestants` (specific columns).
    *   CSRs: Insert-only access to `score_changes` (for `source='csr'`) and update access to `contestants` (via a stored procedure) for their own operations, restricted by `contest.end_at`.
    *   Admins: Full R/W/U access to `ai_submissions` and `contest` (for status changes and freezing display), and indirect update access to `contestants` via approved `ai_submissions`.
*   **Audit Trail:** The `score_changes` table provides an immutable ledger of all point modifications, including the `applied_by_user_id`, `source`, and `created_at` timestamp, ensuring transparency and accountability. `decided_by_user_id` in `ai_submissions` similarly tracks Admin actions.
*   **No Bulk Adds (CSR):** Enforced by backend logic, aligned with the `score_changes` table design (one entry per add).

### 7. Scalability & Performance

*   **Indexing:** Critical indexes are defined for `external_id` (search), `status` (Admin UI filtering), and a composite index on `(current_points DESC, first_reached_current_points_at ASC)` for the leaderboard, optimizing read performance.
*   **Read-Heavy Optimization:** The Top-100 leaderboard will be cached. SSE will efficiently push small `diffs/ticks` rather than full data, reducing bandwidth.
*   **Write-Light Operations:** CSR adds and AI approvals are low volume, easily handled by PostgreSQL.
*   **Append-Only Ledger:** `score_changes` as an append-only table is highly efficient for writes and maintains historical data without complex updates.

## User Flow
USERFLOW

1. Introduction
This document details the user flows for "GasFeel", a branded public leaderboard for the FUNAAB Content Challenge. It covers the journeys of public viewers (contestants), Customer Service Representatives (CSRs) adding points, and Administrators (Admins) managing AI submissions and final results. Each flow outlines goals, steps, system responses, wireframe elements, and interaction patterns.

2. Public Leaderboard User Flow

2.1. Goal
To enable contestants and other interested parties to view real-time contest standings, search for specific participants, and track the challenge's progress and final outcome.

2.2. User Journey: Viewing the Live Leaderboard

2.2.1. Step 1: Accessing the Leaderboard
*   **Action:** User navigates to the public leaderboard URL.
*   **System Response:** The page loads, displaying the current standings and contest information.
*   **Wireframe Description:**
    *   **Header:** Branded section at the top, featuring the GasFeel logo (charcoal) and the title "GasFeel Content Challenge".
    *   **Search Input:** A pill-shaped input field with the placeholder text "Enter your ID (e.g., GF-AB12CD)".
    *   **Countdown:** A segmented chip display showing "Ends in [X days, Y hours, Z minutes]" until the `end_at` time.
    *   **Top-3 Podium Section (Hero):** Three glassmorphic cards for the top-ranking contestants. #1 is taller, all feature crown icons. Each card displays the contestant's `GF-XXXXXX` ID and their `current_points`. On mobile, these cards are stacked vertically.
    *   **Top-100 List:** A scrollable, glassmorphic table-like section displaying ranks 4-100. Each row includes a rank medallion, the contestant's `GF-XXXXXX` ID, and their `current_points` (plain number).
    *   **Real-time Indicator:** A small, subtle text indicator, e.g., "Last updated [X seconds ago]", reflecting the SSE cadence.
    *   **Background:** A subtle brand gradient (top-left to bottom-right) with a faint GasFeel watermark.
*   **Interaction Patterns:**
    *   Initial page load renders static content (layout, initial data) quickly for a fast FCP.
    *   Subsequent data updates (rank, points) are pushed via Server-Sent Events (SSE) every 2 seconds, ensuring near real-time display.

2.2.2. Step 2: Searching for a Specific Contestant
*   **Action:** User enters a `GF-XXXXXX` ID into the search input field.
*   **System Response:**
    *   **If ID is in Top-100:** The leaderboard automatically scrolls to the contestant's row within the Top-100 list, and that row is briefly highlighted with a subtle effect.
    *   **If ID is NOT in Top-100:** A distinct "Your Rank" mini-card appears directly above the Top-100 list. This mini-card displays the searched ID's `GF-XXXXXX`, their current `rank`, `current_points`, and a list of approximately ±10 neighboring contestants (ID, Rank, Points) to provide context.
*   **Wireframe Description:**
    *   Search input field: Responsive to user input, potentially showing a magnifying glass icon.
    *   Highlighted row: A temporary background color change or border for the located contestant's row.
    *   "Your Rank" mini-card: A glassmorphic card, distinct from the Top-100 rows, containing the user's details and neighboring ranks. This card adheres to brand-light, toned-down UI principles.
*   **Interaction Patterns:**
    *   Live search: Results (scrolling/mini-card display) update as the user types, with a debounce to prevent excessive lookups.
    *   Deep-linking: Appending `?id=GF-XXXXXX` to the URL on initial load will trigger the same auto-scroll/highlight or mini-card display functionality.

2.2.3. Step 3: Experiencing Challenge Status Changes
*   **Action:** The contest `end_at` time is reached, or an Admin triggers "Publish Final Results".
*   **System Response:**
    *   **At `end_at`:** The countdown segment chips disappear. A slim, branded info bar (e.g., a distinct glassmorphic banner) appears at the top of the content area, stating "Contest ended — results pending verification." The public leaderboard display automatically "freezes" (i.e., further SSE updates regarding points/ranks are paused, though the connection remains active for status changes).
    *   **After Admin "Publish Final Results":** The info bar text updates to "Final Results Published." The public display is now stable and reflects the final, immutable contest standings. All point-adding backdoors are effectively disabled or locked for further changes to the final results.
*   **Wireframe Description:**
    *   Info bar: A responsive, unobtrusive banner that replaces the countdown. Uses GasFeel branding colors and text as specified.
*   **Interaction Patterns:**
    *   Automatic transition based on server-side time and `Contest.status` changes, communicated via SSE.

3. CSR Backdoor User Flow: Add Points

3.1. Goal
To allow authorized Customer Service Representatives (CSRs) to quickly and safely add a fixed number of points to a specific contestant's score before the contest deadline.

3.2. User Journey: Adding Points to a Contestant

3.2.1. Step 1: Accessing the CSR Portal & Authentication
*   **Action:** CSR navigates to the dedicated CSR backdoor URL.
*   **System Response:**
    *   **Not Authenticated:** User is redirected to a Google Sign-In page.
    *   **Authenticated with Wrong Role:** An "Unauthorized Access" error message is displayed.
    *   **Authenticated with CSR Role:** The "CSR Add Points" form is displayed.
*   **Wireframe Description:**
    *   Google Sign-In page: Standard Google OAuth interface.
    *   CSR Add Points Form: A clean, functional form within a branded layout. Header: "CSR Add Points - GasFeel Content Challenge".
        *   Input Field Label: "Contestant ID".
        *   Input Field: A text input styled with glassmorphic cards, designed for `GF-XXXXXX` format.
        *   Read-only Text: "Add 10 points (fixed)" - clearly indicating the fixed amount.
        *   Preview Area: A section displaying "Current Points: [X] → Next Points: [X+10]" (initially "---" if no ID entered or invalid).
        *   Button: "Add Points" - a pill-shaped button, filled with GasFeel's Golden Sun color.
*   **Interaction Patterns:**
    *   Standard Google OAuth flow for authentication and authorization. Role-based access control is enforced at the backend.

3.2.2. Step 2: Entering Contestant ID & Previewing
*   **Action:** CSR types a `GF-XXXXXX` ID into the input field.
*   **System Response:**
    *   **Valid ID:** The system performs a real-time lookup (debounced) to validate the ID's existence and fetches the `current_points` for that `Contestant`. The "Current → Next" preview area is dynamically updated to show "Current Points: [Fetched Points] → Next Points: [Fetched Points + 10]".
    *   **Invalid ID:** An inline error message appears, e.g., "Contestant ID not found. Please check and try again."
*   **Wireframe Description:**
    *   Input field: Provides visual feedback on validation (e.g., a green checkmark/red cross icon, or error text directly below the field).
    *   Preview area: Updates dynamically as valid IDs are entered.
*   **Interaction Patterns:**
    *   Debounced API call for ID validation and point fetching, minimizing unnecessary backend load.
    *   Immediate UI feedback on validation and preview.

3.2.3. Step 3: Confirming and Applying Points
*   **Action:** CSR clicks the "Add Points" button.
*   **System Response:**
    *   **Confirmation Dialog:** A modal dialog appears, stating: "Are you sure you want to add 10 points to [Contestant ID]? This action cannot be undone." It includes "Cancel" and "Confirm" (Golden Sun) buttons.
    *   **Upon Confirmation:**
        *   A `ScoreChange` ledger entry is created in the database (source: `csr`, `delta`: 10, `created_at`: server time of submission). `Contestant.current_points` and `first_reached_current_points_at` are updated.
        *   The public leaderboard immediately updates via SSE to reflect the new points and potential rank change.
        *   A success toast notification appears (e.g., top-right), stating: "10 points added to [Contestant ID] successfully!"
        *   The form input is cleared, and the preview area resets, ready for the next entry.
*   **Wireframe Description:**
    *   Confirmation modal: A standard modal dialog with clear action buttons.
    *   Success toast: A non-blocking, transient message box.
*   **Interaction Patterns:**
    *   Modal confirmation for critical, irreversible actions.
    *   Asynchronous API call for point addition. The UI should indicate processing (e.g., button loading state) until completion.
    *   Real-time system updates cascaded to the public display.
*   **Guardrails:**
    *   **Pre-deadline Only:** If the current time is past `end_at`, the Contestant ID input field and the "Add Points" button are automatically disabled. A message states: "Challenge deadline passed. Point additions are disabled."
    *   **No Bulk Adds:** The interface only supports single point additions per submission.
    *   **No Edits/Voids:** Points, once added, are final and cannot be reversed or modified through this interface.

4. Admin Backdoor User Flow: Approvals & Controls

4.1. Goal
To enable authorized Administrators to review, approve, or reject AI-agent submissions, and to control the public leaderboard's display status (freeze/unfreeze, publish final results).

4.2. User Journey: Managing AI Submissions

4.2.1. Step 1: Accessing the Admin Portal & Authentication
*   **Action:** Admin navigates to the dedicated Admin backdoor URL.
*   **System Response:**
    *   **Not Authenticated:** User is redirected to a Google Sign-In page.
    *   **Authenticated with Wrong Role:** An "Unauthorized Access" error message is displayed.
    *   **Authenticated with Admin Role:** The "Admin Approvals" page is displayed.
*   **Wireframe Description:**
    *   Google Sign-In page: Standard Google OAuth interface.
    *   Admin Approvals Page: A comprehensive dashboard-like interface within a branded layout. Header: "Admin Approvals - GasFeel Content Challenge".
        *   **Control Buttons:** Top-level buttons for "Freeze Public Display" / "Unfreeze Public Display" (toggle or distinct buttons), and a prominent "Publish Final Results" button (Golden Sun filled, pill shape).
        *   **Filter Chips:** A set of pill-shaped buttons to filter the submission table: "All | Pending | Approved | Rejected | Ineligible". Active filter is highlighted.
        *   **Submissions Table:** A data table displaying AI submissions. Columns include: Checkbox (for bulk selection) | ID (`GF-XXXXXX`) | Points (the `delta` from `AiSubmission`) | Received (`AiSubmission.server_received_at`) | Status (`pending`, `approved`, `rejected`, `ineligible_late`).
        *   **Action Buttons (below table):** "Approve Selected" (Golden Sun filled, pill shape) and "Reject Selected" (charcoal with Deep Tangerine border, pill shape). These buttons are enabled when one or more checkboxes are selected.
*   **Interaction Patterns:**
    *   Standard Google OAuth flow. Backend enforces Admin role access.

4.2.2. Step 2: Reviewing and Filtering Submissions
*   **Action:** Admin clicks on a filter chip (e.g., "Pending") to view specific types of submissions.
*   **System Response:** The submissions table dynamically updates to display only entries matching the selected filter criteria.
*   **Wireframe Description:**
    *   Filter chips: Visually indicate the currently active filter. Clicking a chip reloads/refreshes the table data.
    *   Table: Rows are filtered client-side or server-side based on the chosen status.
*   **Interaction Patterns:**
    *   Quick client-side filtering or efficient server-side data fetching for larger datasets.

4.2.3. Step 3: Approving/Rejecting Submissions (Single or Bulk)
*   **Action:** Admin selects one or more submissions using the checkboxes, then clicks either "Approve Selected" or "Reject Selected".
*   **System Response:**
    *   **Confirmation Dialog:** A modal dialog appears, stating: "Are you sure you want to [Approve/Reject] [X] submission(s)?" It includes "Cancel" and "Confirm" buttons.
    *   **Upon Confirmation:**
        *   **For "Approve":** The `AiSubmission.status` for selected items updates to `approved`. A new `ScoreChange` ledger entry is created for each approved item (source: `ai`, `source_ref_id`: `AiSubmission.id`, `delta`: from `AiSubmission.delta`, `created_at`: Admin approval time, `applied_by_user_id`: Admin's email). The `Contestant.current_points` and `first_reached_current_points_at` are updated. The public leaderboard updates via SSE for these changes.
        *   **For "Reject":** The `AiSubmission.status` for selected items updates to `rejected`. No points are added.
        *   A success toast notification appears: "[X] submissions [approved/rejected] successfully!"
        *   The table refreshes to reflect the updated statuses.
    *   **Post-deadline Rule Enforcement:** If an `AiSubmission.server_received_at` is *after* the `Contest.end_at` deadline, the system automatically marks that submission as `ineligible_late` regardless of Admin action, and it cannot be approved. The Admin sees this status in the table.
*   **Wireframe Description:**
    *   Checkboxes: Standard multi-select mechanism in the first column of the table.
    *   Action buttons: Enabled/disabled states based on selection. Highlighted for "Approve", distinct for "Reject" as per branding.
    *   Confirmation modal: Clear and concise, with an emphasis on the number of selected items.
    *   Success toast: Non-blocking feedback.
    *   Table status column: Visually indicates the new status (e.g., color coding for approved/rejected/ineligible).
*   **Interaction Patterns:**
    *   Standard multi-select table behavior for bulk operations.
    *   Asynchronous API calls for batch processing of approvals/rejections.
    *   Backend logic automatically handles post-deadline `ineligible_late` status updates.

4.2.4. Step 4: Controlling Public Display (Freeze/Unfreeze)
*   **Action:** Admin clicks "Freeze Public Display" or "Unfreeze Public Display".
*   **System Response:**
    *   **Freeze:** The server temporarily pauses pushing real-time updates (SSE) to the public leaderboard. The "Last updated" indicator on the public page might show a stale timestamp or a message like "Updates paused by Admin." This allows for a stable view during verification or maintenance without changing the `Contest.status` banner.
    *   **Unfreeze:** The server resumes pushing real-time updates via SSE to the public leaderboard.
*   **Wireframe Description:**
    *   Toggle button or two distinct pill-shaped buttons at the top of the Admin page. The active state (e.g., "Public Display: FROZEN") is clearly indicated.
*   **Interaction Patterns:**
    *   Instantaneous effect on the public page's real-time updates.

4.2.5. Step 5: Publishing Final Results
*   **Action:** Admin clicks the "Publish Final Results" button.
*   **System Response:**
    *   **Confirmation Dialog:** A critical warning modal appears: "Are you sure you want to publish the final results? This action is irreversible and will mark the contest as complete." It offers "Cancel" and "Confirm" (Golden Sun) buttons.
    *   **Upon Confirmation:**
        *   The `Contest.status` in the database is updated to `final`.
        *   The public leaderboard's info bar (currently "Contest ended — results pending verification.") updates to "Final Results Published."
        *   The `Contest.last_published_at` timestamp is recorded.
        *   All point modification backdoors (CSR Add Points, Admin Approvals for `pending` items) are permanently locked from affecting the final results (though `ineligible_late` items might still be processable for audit if needed).
        *   A success toast notification appears: "Final results published successfully!"
*   **Wireframe Description:**
    *   "Publish Final Results" button: Prominent, Golden Sun filled, pill-shaped. Potentially enabled only after the `end_at` deadline or when no `pending` submissions remain.
    *   Confirmation modal: Emphasizes the irreversible nature of the action.
    *   Success toast: Non-blocking feedback.
*   **Interaction Patterns:**
    *   Highly guarded action due to its irreversible nature. Requires explicit confirmation.
    *   Changes propagate immediately to the public display via SSE, marking the definitive end of the challenge's active phase.

5. Error Handling & Accessibility

5.1. General Error Handling
*   **User Interface:** Clear, concise error messages are displayed inline for input validation issues (e.g., invalid Contestant ID, missing fields). For system errors (e.g., network issues, server errors), a persistent but dismissible banner or toast notification will inform the user. Critical errors will halt the process and provide actionable advice.
*   **Backend:** Robust logging and monitoring are implemented for all backend operations, especially point modifications and approvals, to ensure an audit trail and facilitate debugging.
*   **Authentication/Authorization:** Clear messages for unauthorized access attempts, guiding users to the correct login or informing them of insufficient privileges.

5.2. Accessibility Considerations
*   **Contrast & Legibility:** All text, interactive elements, and UI components adhere to WCAG 2.1 AA guidelines for color contrast. Font sizes are legible, and scaling (e.g., browser zoom) is supported without breaking layout.
*   **Keyboard Navigability:** All interactive elements (buttons, input fields, filter chips, table selections) are fully navigable and operable using only a keyboard. Focus states are clearly visible.
*   **Screen Reader Support:** Semantic HTML is used, and ARIA attributes are applied where necessary to ensure screen readers can accurately interpret and convey the content and interactive elements to users with visual impairments.
*   **Reduced Motion:** The system respects the user's "prefers-reduced-motion" setting. Animations and transitions (e.g., highlights, toasts, modal entrances) will be toned down or removed for users who prefer reduced motion.
*   **Responsive Design:** The public leaderboard is mobile-first, ensuring optimal usability and display across various screen sizes and orientations. Backdoor interfaces will also be responsive but optimized for desktop usage given their operational nature.

## Styling Guidelines
STYLING

1.  OVERVIEW
This document outlines the styling guidelines for GasFeel's FUNAAB Content Challenge leaderboard and its associated backend operations. The aim is to create a branded, mobile-first experience that is visually appealing, highly legible, and consistent across all interfaces, while maintaining a "brand-light" and "toned down" aesthetic with subtle glassmorphic effects.

2.  DESIGN PHILOSOPHY
    *   **Brand-Light & Toned Down:** The overall aesthetic leans towards subtlety, avoiding overly aggressive branding or overly bright elements. While incorporating GasFeel's core colors, their application is refined and measured.
    *   **Glassmorphism:** Key UI elements like cards and rows will feature a light glassmorphic effect (6-8px blur), complemented by a 1px inner border and gentle shadows, giving a sense of depth without being distracting.
    *   **Mobile-First:** All designs prioritize the mobile viewing experience, ensuring optimal readability and interaction on smaller screens.
    *   **Clarity & Legibility:** Strong contrast, legible font sizes, and clear hierarchy are paramount to ensure information is easily digestible for all users.
    *   **Consistency:** A consistent visual language will be applied across the public leaderboard and the administrative "backdoor" operations to foster familiarity and reduce cognitive load.

3.  COLOR PALETTE
GasFeel's brand colors are integral to the UI, applied thoughtfully to maintain the "toned down" aesthetic.
    *   **Bright Cobalt Blue:** #0070FF (Approx. 60% of overall palette usage)
    *   **Snow White:** #FFFFFF (Approx. 30% of overall palette usage)
    *   **Deep Tangerine:** #FF7F50 (Approx. 10% of overall palette usage - primarily for accents, warnings, or 'Reject' actions)
    *   **Golden Sun:** #FFD700 (Approx. 10% of overall palette usage - primarily for calls-to-action like 'Approve', 'Add', 'Publish')
    *   **Pastel Lavender:** #B0E0E6 (Approx. 10% of overall palette usage - for subtle backgrounds or secondary accents)
    *   **Charcoal:** #36454F (Used for text, logo, and certain button states, providing strong contrast against lighter backgrounds).

4.  TYPOGRAPHY
    *   **Primary Font (Content & UI Text):** Inter
        *   Usage: All body text, leaderboard entries, form labels, general UI elements.
        *   Characteristics: Highly legible, modern, and versatile.
    *   **Icon Font (Icons):** Phosphor (Light variant)
        *   Usage: Crowns on podium, search icons, status indicators, admin controls.
        *   Characteristics: Provides a consistent set of light-weight, clean icons.

5.  UI ELEMENTS & COMPONENTS
    *   **General Layout & Background:**
        *   **Background:** A very subtle brand gradient from top-left to bottom-right, complemented by a faint, transparent GasFeel watermark, creates a branded yet understated base.
        *   **Overall Theme:** Brand-light with toned-down glass effects and strong contrast for readability.

    *   **Cards & Containers:**
        *   **Style:** Light glassmorphic effect (6-8px blur) with a 1px inner border (e.g., a very light grey or translucent white) and a gentle shadow (e.g., `0px 4px 10px rgba(0, 0, 0, 0.05)`).
        *   **Density:** Normal row density for leaderboard lists and data tables.
        *   **"Your Rank" Mini-Card:** When a user's ID is searched and not in the Top-100, a distinct mini-card will display their rank and ±10 neighbors, utilizing the same glassmorphic styling.

    *   **Buttons:**
        *   **Shape:** All buttons will feature a "pill" shape (high border-radius).
        *   **Call-to-Action Buttons (Public/Admin):**
            *   **Actions:** 'Approve', 'Add Points', 'Publish Final Results'
            *   **Style:** Filled with **Golden Sun** background, with dark text (Charcoal) for strong contrast.
        *   **Destructive/Negative Action Buttons (Admin):**
            *   **Actions:** 'Reject'
            *   **Style:** Charcoal background with a **Deep Tangerine** border and white text.
        *   **Secondary/Tertiary Buttons (Admin):**
            *   **Actions:** 'Freeze/Unfreeze'
            *   **Style:** Outline buttons (Charcoal border with light background) or a muted fill consistent with the "toned down" theme.
        *   **Disabled State:** Clearly distinguishable disabled states (e.g., reduced opacity, muted colors) for buttons that are inactive (e.g., 'Add Points' after deadline).

    *   **Leaderboard Specifics:**
        *   **Top-3 Podium:**
            *   Features crown icons above each contestant. The #1 rank's element will be visually taller or more prominent.
            *   On mobile, the Top-3 podium will stack vertically.
        *   **Top-100 List:**
            *   Each row will display: Rank (with a small medallion icon if desired) • `GF-XXXXXX` (Contestant ID) • plain number for Points.
            *   Search highlight: A brief, subtle highlight animation or distinct background for the searched ID row.
        *   **Realtime Updates:** Transitions for SSE-pushed diffs/ticks should be smooth and subtle, avoiding jarring full-page refreshes.

    *   **Forms & Inputs (Backdoor Operations):**
        *   **Input Fields:** Consistent with the glassmorphic theme, inputs will have a subtle, light background, a 1px inner border, and a gentle focus state (e.g., a subtle glow or border color change).
        *   **Labels:** Clear, concise labels (Inter font) positioned above input fields.
        *   **Guardrails/Previews:** The 'Current → Next' points preview will be clearly styled to show the change (e.g., `Current: X points → Next: X+10 points`).
        *   **Confirmation Dialogs:** Simple, clean modal dialogs for critical actions, using clear microcopy and distinct 'Confirm' (Golden Sun) and 'Cancel' (Charcoal/outline) buttons.
        *   **Success Toasts:** Non-intrusive, temporary notifications for successful operations, styled subtly with a green hue or similar positive indicator.

    *   **Informational Elements:**
        *   **Countdown:** Utilizes "segment chips" (e.g., `DD:HH:MM:SS` within distinct, pill-shaped segments).
        *   **Banners:** Slim information bars for status updates (e.g., "Verification mode," "Contest ended — results pending verification.") styled with appropriate background colors (e.g., Pastel Lavender for info, Deep Tangerine for warnings).
        *   **Header:** Features the GasFeel logo (in Charcoal or full brand color on a muted background), the title "GasFeel Content Challenge," and a search input field (with placeholder "Enter your ID (e.g., GF-AB12CD)").
        *   **No Footer:** The public page will explicitly not include a footer rules link.

6.  ACCESSIBILITY
Adherence to accessibility best practices is a core principle:
    *   **Strong Contrast:** Ensures all text and interactive elements have sufficient contrast against their backgrounds (WCAG 2.1 AA compliant).
    *   **Legible Sizes:** Font sizes are chosen to be easily readable on all devices, with responsive adjustments where necessary.
    *   **Keyboard Navigable:** All interactive elements (buttons, links, form fields) are fully accessible and operable via keyboard navigation.
    *   **Respects "Reduce Motion":** UI animations and transitions will gracefully degrade or be disabled for users who have 'reduce motion' preferences enabled in their operating system settings.
    *   **Semantic HTML:** Proper use of HTML5 semantic elements to aid screen readers and assistive technologies.

7.  RESPONSIVENESS
    *   **Mobile-First Approach:** The design begins with the smallest screen sizes and scales up, ensuring a seamless experience across smartphones, tablets, and desktops.
    *   **Fluid Layouts:** Use of flexible grids and responsive units (e.g., `rem`, `em`, percentages, `vw/vh`) to adapt to varying screen dimensions.
    *   **Component Stacking:** Elements like the Top-3 podium will stack vertically on mobile, and data tables on admin pages will consider responsive layouts (e.g., horizontal scrolling, collapsing columns, or card views).

8.  MICROCOPY GUIDELINES
    *   **Header Title:** "GasFeel Content Challenge"
    *   **Countdown:** "Ends in" followed by the segment chips (e.g., "Ends in 01D 05H 30M 15S").
    *   **Search Input Placeholder:** "Enter your ID (e.g., GF-AB12CD)"
    *   **Status Banners:** "Contest ended — results pending verification.", "Verification mode."
    *   **Admin Backdoor Notifications:** Clear, concise messages for success, error, and confirmation dialogues (e.g., "Contestant ID updated successfully.", "Are you sure you want to add 10 points to GF-XXXXXX?").
    *   **Consistency:** All microcopy should be clear, concise, and consistent in tone, aligning with GasFeel's brand voice.

This styling guide ensures a cohesive, user-friendly, and branded experience for the GasFeel Content Challenge leaderboard across all touchpoints.
