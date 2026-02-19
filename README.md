# Prompt Architect

![Build](https://github.com/canstralian/prompt-architect/actions/workflows/ci.yml/badge.svg)
[![Code Coverage](https://codecov.io/gh/canstralian/prompt-architect/branch/main/graph/badge.svg)](https://codecov.io/gh/canstralian/prompt-architect)
![License](https://img.shields.io/github/license/canstralian/prompt-architect)
[![Version](https://img.shields.io/github/v/release/canstralian/prompt-architect)](https://github.com/canstralian/prompt-architect/releases)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/canstralian/prompt-architect)](https://snyk.io)
[![Dependencies](https://img.shields.io/librariesio/release/npm/prompt-architect)](https://libraries.io/npm/prompt-architect)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue)](https://www.typescriptlang.org/)

---

A collaborative platform for designing, saving, and sharing structured AI prompts. Prompt Architect uses a 7-section template architecture to guide users through building high-quality, reusable prompts — complete with live preview, local drafts, a community template library, and built-in quality validation.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [The 7-Section Prompt Architecture](#the-7-section-prompt-architecture)
- [Built-in Presets](#built-in-presets)
- [Usage](#usage)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Contributing](#contributing)
- [License](#license)

## Features

### Prompt Builder
- **Structured 7-section editor** with inline validation, character/sentence counting, and visual feedback
- **Live preview** of prompts in XML format with one-click copy-to-clipboard and markdown download
- **Quality checklist** showing completion percentage across required sections
- **Preset templates** to jumpstart prompt creation (Research Assistant, Security Agent, Product Planner)

### Draft Management
- **Auto-save** every second using localStorage
- **Multiple drafts** — create, load, rename, and delete drafts locally
- **Persistent state** across browser sessions

### Community Template Library
- **Browse and discover** public templates with infinite-scroll pagination
- **Search** by name or description
- **Filter** by 8 categories: coding, research, writing, automation, analysis, planning, creative, and other
- **Sort** by popularity or recency
- **Like and bookmark** templates with real-time counters
- **Share templates** via deep-link URLs (`?template={id}`)
- **Publish, edit, and delete** your own templates

### User Profiles
- **Authentication** via email/password or Google OAuth
- **Profile management** with display name and avatar upload
- **Personal dashboard** showing your created and saved templates

### Security
- **Row Level Security (RLS)** on all Supabase tables
- **Rate limiting** on template creation (10/hour), likes (60/hour), and saves (60/hour)
- **Input validation** with length constraints enforced at the database level
- **Secure defaults** enforced via database triggers

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite](https://vitejs.dev/) with [SWC](https://swc.rs/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with light/dark theme support |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (50+ Radix-based components) |
| **Backend** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage) |
| **Data Fetching** | [TanStack React Query](https://tanstack.com/query) |
| **Routing** | [React Router v6](https://reactrouter.com/) |
| **Form Handling** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Linting** | [ESLint 9](https://eslint.org/) with flat config |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later (recommended install via [nvm](https://github.com/nvm-sh/nvm))
- npm or [Bun](https://bun.sh/)
- A [Supabase](https://supabase.com/) project (for backend features)

### Installation

```bash
# Clone the repository
git clone https://github.com/canstralian/prompt-architect.git
cd prompt-architect

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Running the Dev Server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`.

## Project Structure

```
prompt-architect/
├── public/                          # Static assets
├── src/
│   ├── components/
│   │   ├── ui/                      # shadcn/ui component library
│   │   ├── BuilderView.tsx          # Main prompt editing interface
│   │   ├── LibraryView.tsx          # Community template browser
│   │   ├── Header.tsx               # Navigation & theme toggle
│   │   ├── SectionEditor.tsx        # Individual section editor
│   │   ├── Preview.tsx              # Live prompt preview
│   │   ├── DraftManager.tsx         # Local draft management
│   │   ├── QualityChecklist.tsx     # Completion validation
│   │   ├── PresetSelector.tsx       # Built-in preset loader
│   │   ├── TemplateCard.tsx         # Template display card
│   │   ├── CreateTemplateDialog.tsx # Publish template modal
│   │   ├── EditTemplateDialog.tsx   # Edit template modal
│   │   ├── FeaturedTemplates.tsx    # Curated template carousel
│   │   └── OnboardingTip.tsx        # First-visit guidance
│   ├── hooks/
│   │   ├── useAuth.ts              # Authentication state
│   │   ├── useDraft.ts             # Draft persistence logic
│   │   ├── useTemplateLibrary.ts   # Template fetching & filtering
│   │   ├── useSavedTemplates.ts    # Bookmark management
│   │   ├── useLikedTemplates.ts    # Like management
│   │   ├── useInfiniteScroll.ts    # Pagination hook
│   │   └── useTheme.ts            # Dark/light mode toggle
│   ├── integrations/supabase/
│   │   ├── client.ts               # Supabase client setup
│   │   └── types.ts                # Auto-generated DB types
│   ├── lib/
│   │   ├── sectionData.ts          # 7-section config & presets
│   │   ├── storage.ts              # localStorage utilities
│   │   └── utils.ts                # Helpers (cn, etc.)
│   ├── pages/
│   │   ├── Index.tsx               # Main app page
│   │   ├── Auth.tsx                # Login/signup page
│   │   ├── Profile.tsx             # User profile page
│   │   └── NotFound.tsx            # 404 page
│   ├── App.tsx                      # Root component & routing
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles & CSS variables
├── supabase/
│   ├── config.toml                  # Supabase project config
│   └── migrations/                  # Database migration files
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## The 7-Section Prompt Architecture

Prompt Architect structures every prompt into seven well-defined sections. This framework ensures consistency, completeness, and quality across prompts.

| # | Section | Required | Purpose |
|---|---------|----------|---------|
| 1 | **Role** | Yes | Define the agent's persona, expertise, and perspective (1-3 sentences) |
| 2 | **Context** | No | Provide background information, domain knowledge, and environment details |
| 3 | **Constraints** | Yes | Set boundaries, rules, and ethical limitations |
| 4 | **Goals** | Yes | Define measurable objectives the agent should achieve |
| 5 | **Instructions** | Yes | Provide step-by-step guidance for task execution |
| 6 | **Output Format** | Yes | Specify the structure and format of expected responses |
| 7 | **Invocation** | No | Define trigger conditions and integration points |

Each section includes built-in guidelines, example content, and placeholder text to help users write effective prompts.

## Built-in Presets

Get started quickly with one of the included preset templates:

| Preset | Description |
|--------|-------------|
| **Blank Template** | Empty 7-section form for building from scratch |
| **Research Assistant** | Deep analysis and synthesis specialization |
| **Security Automation Agent** | Cloud security engineering focus |
| **Product Planner** | Product strategy and planning specialization |

## Usage

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server on port 8080 |
| `npm run build` | Build for production |
| `npm run build:dev` | Build with development mode |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

### Workflow

1. **Build a prompt** — Use the Builder view to fill in each section with guidance from the quality checklist
2. **Preview and export** — See the live XML preview, copy to clipboard, or download as markdown
3. **Save drafts** — Work is auto-saved locally; create named drafts for different projects
4. **Publish to the library** — Share your best prompts with the community
5. **Discover templates** — Browse, search, and filter the library to find prompts for your use case

## Database Schema

The application uses four Supabase (PostgreSQL) tables:

| Table | Purpose |
|-------|---------|
| `prompt_templates` | Core templates with name, description, category, sections (JSONB), tags, and engagement counters |
| `profiles` | User profiles with display name and avatar URL |
| `user_saved_templates` | Bookmark (save) relationships between users and templates |
| `user_template_likes` | Like relationships between users and templates |

An `avatars` storage bucket handles profile picture uploads with per-user folder isolation.

Database integrity is maintained through triggers for auto-updating timestamps, enforcing secure defaults on new templates, and maintaining like/save counters.

## Authentication

Prompt Architect supports two authentication methods via Supabase Auth:

- **Email/password** — Traditional signup and login with display name
- **Google OAuth** — One-click sign-in with Google

A profile is automatically created for each new user via a database trigger. Authentication is required to publish templates, manage bookmarks, and access the profile page. Browsing the template library is available to all users.

## Contributing

### Pull Requests

- Feature branches should be named using the format: `feature/<ticket_number>-description`
- Include a clear description of the changes and their motivation
- Ensure the build passes (`npm run build`) and linting is clean (`npm run lint`)

### Development Tips

- The `@` path alias maps to `./src/` for cleaner imports
- shadcn/ui components live in `src/components/ui/` — add new ones with the shadcn CLI
- Database changes should be created as Supabase migrations in `supabase/migrations/`

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.
