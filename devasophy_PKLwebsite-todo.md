# Devanomy/Devasophy PKM Website - TODO

## Core Features

### Phase 1: Project Setup
- [x] Database schema for notes, categories, and relationships
- [x] tRPC procedures for CRUD operations
- [x] Authentication and user context setup

### Phase 2: Homepage & Navigation
- [x] Interactive homepage with four-layer PKM introduction
- [x] Color-coded navigation (Blue, Yellow, Teal, Light Green)
- [x] Responsive layout with smooth transitions
- [x] Design tokens and theming system

### Phase 3: Johnny Decimal Documentation
- [x] Documentation pages for Areas 00-99
- [x] Expandable category sections
- [x] Category descriptions and examples
- [x] Navigation between areas

### Phase 4: Zettelkasten Note-Taking
- [x] Note creation form with metadata fields
- [x] Unique ID generation (AC.ID-YYYYMMDD-Seq)
- [x] Bidirectional linking interface
- [x] Note list and search within notes

### Phase 5: Visual Knowledge Graph
- [x] Knowledge graph visualization component
- [x] Link symbols display (→ ← ↔)
- [x] Relationship type indicators (Supports, Contradicts, Develops, Questions, Synthesizes)
- [x] Interactive node selection and filtering

### Phase 6: Metadata Schema & Workflow
- [x] Metadata schema editor for notes
- [x] Required fields form (ID, Category, Title, Date, Source)
- [x] Optional fields form (Keywords, People, Works Cited, Related Notes, Content Type, Status)
- [x] Workflow guide sections (Initial Digitization, Deep Processing, Ongoing Capture)
- [x] Step-by-step instructions for each workflow phase

### Phase 7: Search & Filtering
- [x] Global search across all notes
- [x] Filter by area (00-99)
- [x] Filter by category
- [x] Filter by status, content type, keywords
- [x] Quick reference sidebar
- [x] Most common categories display
- [x] ID format reminder
- [x] Link symbols legend

### Phase 8: Testing & Optimization
- [x] Unit tests for note operations
- [x] Integration tests for linking
- [x] Performance optimization
- [x] Cross-browser testing
- [x] Mobile responsiveness verification

### Phase 9: Deployment
- [x] Final checkpoint
- [x] Deploy to production
- [x] Provide public URL

## Completed Items

## New Features (Phase 2)

### Feature 1: Bulk Import Tool
- [x] Database tables for quotations, vocabulary, books, authors
- [x] CSV/Excel file upload endpoint
- [x] Auto-categorization logic for imported data
- [x] Import progress UI with preview and confirmation
- [x] Import history tracking

### Feature 2: Quote Browser
- [x] Quote listing page with search
- [x] Filter by author, theme, collection, favorite status
- [x] Quote detail view with metadata
- [x] Favorite toggle functionality

### Feature 3: Vocabulary Flashcard Module
- [x] Vocabulary table with spaced repetition fields
- [x] Flashcard study mode UI
- [x] Spaced repetition algorithm (SM-2)
- [x] Progress tracking and statistics

### Feature 4: Goodreads Integration
- [x] Book import from CSV/PDF
- [x] Book listing with metadata
- [x] Reading progress tracking
- [x] Author profile pages

### Feature 5: Synthesis Note Generator
- [x] Connection suggestion algorithm
- [x] Cross-collection linking (quotes ↔ words ↔ books)
- [x] Synthesis note creation UI

### Feature 6: Essay/Writing Assistant
- [x] Writing workspace with editor
- [x] Search and cite quotes inline
- [x] Reference panel for related concepts
- [x] Export functionality

### Feature 7: Theme Explorer
- [x] Theme extraction from collections
- [x] Visual theme map/graph
- [x] Theme filtering and drill-down
- [x] Cross-collection theme connections

## SEO Fixes

- [x] Add meta description (50-160 characters) to homepage
- [x] Add meta keywords to homepage

## Weekly Processing Template Integration

- [x] Database table for weekly processing sessions
- [x] tRPC procedures for session CRUD
- [x] Interactive Weekly Processing page with all 11 sections
- [x] Session history list with status indicators
- [x] Auto-populated weekly statistics from database
- [x] Navigation link in sidebar
- [x] Unit tests for weekly processing

## Templates Library Integration

- [x] Templates Library page with all 8 entry templates
- [x] Template 1: Vocabulary Entry (Simple)
- [x] Template 2: Vocabulary Entry (Extended)
- [x] Template 3: Single Quote
- [x] Template 4: Quote Collection (By Author)
- [x] Template 5: Quote Collection (By Theme)
- [x] Template 6: Definition from Notebook
- [x] Template 7: Hub Note (Connecting Multiple Entries)
- [x] Template 8: Quick Capture
- [x] Template usage guide and workflow recommendations
- [x] Copy-to-clipboard and create-from-template functionality

## Starter Pack Seed Data

- [x] Pre-populate 5 vocabulary entries (Integrity, Alchemy, Kaizen, Übermensch, Self-Sovereignty)
- [x] Pre-populate 4 quote entries (Van Gogh, Bukowski, Rumi, Lamott)
- [x] Pre-populate 1 hub note (Becoming Yourself)
- [x] Integrate starter pack data into the Templates Library page as examples

## Create from Template & New Repositories (Phase 3)

### Feature 1: Create from Template Workflow
- [x] Create from Template page with template selection
- [x] Pre-fill note creation forms from Starter Pack templates
- [x] Wire template copy action to Notes creation form
- [x] Support all 8 template types (Vocab Simple/Extended, Single Quote, Quote by Author/Theme, Definition, Hub Note, Quick Capture)

### Feature 2: Starter Pack as Repository Templates
- [x] Vocabulary templates pre-fill word entry forms
- [x] Quote templates pre-fill quotation entry forms
- [x] Book/Literature templates pre-fill reading note forms
- [x] Hub Note template pre-fills synthesis note forms

### Feature 3: Literature & Reading Notes Repository
- [x] Database table for literature notes
- [x] tRPC procedures for literature notes CRUD
- [x] Literature Notes page with list, search, filter
- [x] Bulk import for literature notes (CSV/Excel)
- [x] Single-entry creation form for literature notes

### Feature 4: Research Notes Repository
- [x] Database table for research notes
- [x] tRPC procedures for research notes CRUD
- [x] Research Notes page with list, search, filter
- [x] Bulk import for research notes (CSV/Excel)
- [x] Single-entry creation form for research notes

### Feature 5: Single-Entry Creation for All Repositories
- [x] Single quote entry form
- [x] Single vocabulary entry form
- [x] Single book entry form
- [x] Single literature note entry form
- [x] Single research note entry form
- [x] Single general note entry form
- [x] Quick-add buttons in each repository page

### Infrastructure
- [x] Update navigation with new pages
- [x] Update bulk import to support literature & research types
- [x] Unit tests for new features
- [x] Save checkpoint

## Seed Data & Dashboard Enhancement

- [x] Extract Starter Pack vocabulary entries (Integrity, Alchemy, Kaizen, Übermensch, Self-Sovereignty)
- [x] Extract Starter Pack quote entries (Van Gogh, Bukowski, Rumi, Lamott)
- [x] Extract Starter Pack hub note (Becoming Yourself)
- [x] Create database seed script to populate initial data
- [x] Add Create from Template quick-action cards to Dashboard
- [x] Display 8 templates as clickable cards with icons
- [x] Link template cards to Create from Template page

## Fixes & Enhancements (Current)

- [x] Fix WritingAssistant.tsx TypeScript error (rename essays router)
- [x] Fix 'import' router name collision with JS reserved word
- [x] Fix missing AppRouter type export
- [x] Fix LiteratureNotes/ResearchNotes data access pattern (.rows)
- [x] Enhance Create from Template to save directly to database
- [x] Add template-to-repository direct save mapping
- [x] Run database seed script with Starter Pack data
- [x] Update all tests to match renamed routers (62 passing)

## Inline Editing & Export Features

### Feature 1: Inline Editing for Existing Entries
- [ ] Add update/delete procedures for quotations
- [ ] Add update/delete procedures for vocabulary
- [x] Add update/delete procedures for books
- [x] Add update/delete procedures for literature notes
- [x] Add update/delete procedures for research notes
- [ ] Add update/delete procedures for general notes
- [x] Add edit dialog to Quote Browser page
- [ ] Add edit dialog to Flashcards/Vocabulary page
- [x] Add edit dialog to Books page
- [x] Add edit dialog to Literature Notes page
- [x] Add edit dialog to Research Notes page
- [ ] Add edit dialog to Notes page
- [x] Add delete confirmation for all entry types

### Feature 2: Export All Backup
- [x] Create server-side export endpoint that gathers all data
- [x] Export quotes as CSV
- [x] Export vocabulary as CSV
- [x] Export books as CSV
- [x] Export literature notes as Markdown
- [x] Export research notes as Markdown
- [x] Export general notes as Markdown with metadata JSON
- [x] Package all exports into a single file
- [x] Add Export page with download functionality
- [x] Unit tests for export and inline editing

## Category Seed Data & Note CRUD

- [ ] Seed all 100 Johnny Decimal categories into the database
- [ ] Category selector dropdown in note creation forms
- [ ] Full Note CRUD on Notes page (create, read, update, delete)
- [ ] Unique ID generation (AC.ID-YYYYMMDD-Seq format)
- [ ] Bidirectional linking UI in note editor
- [ ] Note detail view with linked notes display

## Inline Editing & Export (continued)

- [ ] Add update/delete procedures for quotations
- [ ] Add update/delete procedures for vocabulary
- [x] Inline edit dialog on Quote Browser
- [ ] Inline edit dialog on Flashcards/Vocabulary page
- [x] Inline edit dialog on Books page
- [x] Inline edit dialog on Literature Notes page
- [x] Inline edit dialog on Research Notes page
- [x] Delete confirmation for all entry types
- [x] Export All endpoint (structured text with Markdown)
- [x] Export page with full download functionality


## Synthesis Engine (Phase 4) - COMPLETE

### Feature 1: Synthesis Detection Algorithm
- [x] Implement convergence detection (shared themes, keywords, people across nodes)
- [x] Implement contradiction detection (conflicting statements, opposing viewpoints)
- [x] Implement semantic similarity detection (cosine similarity on embeddings or keyword overlap)
- [x] Create synthesis candidate scoring system (rank by relevance and strength)
- [x] Add filtering to exclude low-confidence candidates

### Feature 2: LLM-Powered Synthesis Generation
- [x] Create synthesis prompt templates for convergence, contradiction, semantic similarity
- [x] Implement LLM integration to generate synthesis note content
- [x] Generate synthesis note title based on detected pattern
- [x] Auto-assign 80.xx category (synthesis/integration notes)
- [x] Create bidirectional 'synthesizes' links back to source nodes

### Feature 3: Synthesis Engine UI
- [x] Create Synthesis Engine page with detection controls
- [x] Show synthesis candidates with confidence scores
- [x] Display detected pattern type (convergence/contradiction/similarity)
- [x] Preview generated synthesis before saving
- [x] Batch generate synthesis notes from multiple candidates
- [x] Manual synthesis note creation with custom LLM prompts

### Feature 4: Testing & Refinement
- [x] Unit tests for convergence detection algorithm
- [x] Unit tests for contradiction detection algorithm
- [x] Unit tests for semantic similarity detection
- [x] Unit tests for LLM prompt generation
- [x] Integration tests for synthesis note creation and linking
- [x] Test edge cases (empty nodes, single node, circular references)



## DIKW UI Framework Integration (Phase 5) - COMPLETE

### Feature 1: DIKW Tier Selector
- [x] Create tier selection component (Wisdom/Knowledge/Information/Data buttons)
- [x] Map DIKW tiers to color scheme (Gold/Orange/Pink/Blue)
- [x] Update note creation flow to show tier selector first
- [x] Store tier selection in note metadata
- [x] Display tier indicator in note headers and navigation

### Feature 2: Category-Specific Note Editors
- [x] Create Information template editor (Vocabulary & Definitions focus)
- [x] Create Knowledge template editor (Epistemological Research & Models)
- [x] Create Wisdom template editor (Axioms & Universal Quotes)
- [x] Create Data template editor (Raw facts and datasets)
- [x] Implement dynamic form fields based on selected tier
- [x] Add placeholder text and field descriptions per tier

### Feature 3: Cross-Reference System
- [x] Add DIKW cross-reference buttons in all editors
- [ ] Link notes across tiers (W→K→I→D) - deferred to Phase 6
- [ ] Display cross-reference connections in note view - deferred to Phase 6
- [ ] Update synthesis engine to consider DIKW tier relationships - deferred to Phase 6

### Feature 4: Visual Styling & Navigation
- [x] Update color palette (Gold #C4A747, Orange #D97634, Pink #D4A5A5, Blue #4A90E2)
- [x] Apply tier colors to navigation, headers, and buttons
- [ ] Update PKMLayout to show tier indicator - deferred to Phase 6
- [x] Style tier selector with icon badges
- [x] Implement tier-specific accent colors in forms

### Feature 5: Testing & Refinement
- [ ] Unit tests for tier selection logic - deferred to Phase 6
- [ ] Tests for tier-specific form validation - deferred to Phase 6
- [ ] Tests for cross-reference creation - deferred to Phase 6
- [ ] Visual regression tests for tier colors - deferred to Phase 6
- [ ] Integration tests for tier-based workflows - deferred to Phase 6



## Phase 6: Tier Indicators, Cross-Tier Linking & Search Filters - COMPLETE

### Feature 1: DIKW Tier Indicators on Note Lists
- [x] Create DIKWBadge component (reusable tier badge with color and icon)
- [ ] Add tier badges to Quote Browser page - deferred to Phase 7
- [ ] Add tier badges to Vocabulary/Flashcards page - deferred to Phase 7
- [ ] Add tier badges to Books page - deferred to Phase 7
- [ ] Add tier badges to Literature Notes page - deferred to Phase 7
- [ ] Add tier badges to Research Notes page - deferred to Phase 7
- [ ] Add tier badges to General Notes page - deferred to Phase 7
- [ ] Display tier in note detail views - deferred to Phase 7

### Feature 2: Cross-Tier Linking UI
- [x] Add "Link to Other Tier" button in note cards - component ready
- [x] Create LinkModal component for selecting target notes
- [ ] Add link creation mutation to tRPC routers - deferred to Phase 7
- [ ] Store cross-tier links in database (link table) - deferred to Phase 7
- [ ] Display linked notes in note detail view - deferred to Phase 7
- [ ] Add visual indicator for linked notes (chain icon) - deferred to Phase 7
- [ ] Allow unlinking notes - deferred to Phase 7

### Feature 3: Tier-Based Search & Filters
- [x] Add tier filter dropdown to note list pages - TierFilter component created
- [ ] Implement client-side filtering by tier - deferred to Phase 7
- [x] Add search input with tier context
- [x] Create filter state management (useState for active filters)
- [x] Display active filter count badge
- [x] Add "Clear Filters" button
- [ ] Persist filter preferences to localStorage - deferred to Phase 7

### Feature 4: Visual Graph for Cross-Tier Connections
- [x] Create TierConnectionGraph component
- [x] Render nodes for each tier (W/K/I/D)
- [x] Draw edges for cross-tier links
- [x] Add interactive node selection
- [x] Show connection details on hover
- [ ] Implement zoom and pan controls - deferred to Phase 7
- [ ] Add graph to Knowledge Graph page - deferred to Phase 7

### Feature 5: Testing & Refinement
- [ ] Unit tests for DIKWBadge component - deferred to Phase 7
- [ ] Tests for tier filtering logic - deferred to Phase 7
- [ ] Tests for link creation and deletion - deferred to Phase 7
- [ ] Integration tests for cross-tier workflows - deferred to Phase 7
- [ ] Visual tests for graph rendering - deferred to Phase 7

## Phase 7: TierConnectionGraph Integration & Filter Wiring - COMPLETE

### Feature 1: TierConnectionGraph Integration
- [x] Add TierConnectionGraph to Knowledge Graph page
- [x] Render DIKW tier nodes with connection counts
- [x] Display cross-tier edges with weights
- [x] Implement interactive node selection
- [x] Add hover effects for visual feedback

### Feature 2: TierFilter Integration
- [x] Create useTierFilter custom hook
- [x] Implement localStorage persistence for filter state
- [x] Add search query filtering
- [x] Add tier selection filtering
- [x] Create applyFilters utility function
- [ ] Integrate TierFilter into QuoteBrowser - deferred to Phase 8
- [ ] Integrate TierFilter into Vocabulary - deferred to Phase 8
- [ ] Integrate TierFilter into Books - deferred to Phase 8
- [ ] Integrate TierFilter into LiteratureNotes - deferred to Phase 8
- [ ] Integrate TierFilter into ResearchNotes - deferred to Phase 8
- [ ] Integrate TierFilter into Notes - deferred to Phase 8

### Feature 3: LinkModal Wiring
- [ ] Add link creation mutation to tRPC routers - deferred to Phase 8
- [ ] Wire LinkModal to note cards - deferred to Phase 8
- [ ] Implement cross-tier linking logic - deferred to Phase 8
- [ ] Display linked notes in detail views - deferred to Phase 8


## Phase 8: Cross-Tier Linking with Database Persistence - COMPLETE

### Feature 1: Cross-Tier Link Database Table
- [x] Add crossTierLinks table to schema
- [x] Support all item types (quote, vocabulary, book, literatureNote, researchNote, note)
- [x] Store link types (supports, contradicts, develops, questions, synthesizes, references, mutual)
- [x] Add timestamps and user isolation

### Feature 2: Cross-Tier Link tRPC Procedures
- [x] Create procedure for creating links
- [x] Create procedure for deleting links
- [x] Create procedure for retrieving links for an item
- [x] Create procedure for retrieving all user links
- [x] Create procedure for getting links between specific items
- [x] Create procedure for updating links
- [x] Implement user isolation and authorization checks
- [x] Add validation to prevent self-linking

### Feature 3: Link Display Component
- [x] Create LinkedNotesDisplay component
- [x] Show outgoing and incoming links separately
- [x] Display link types with color coding
- [x] Add delete button for link management
- [x] Show link descriptions and item metadata

### Feature 4: Testing
- [x] Add 10 comprehensive tests for cross-tier linking
- [x] Test link creation, deletion, retrieval
- [x] Test user isolation and authorization
- [x] Test self-linking prevention
- [x] Test unauthenticated access rejection
