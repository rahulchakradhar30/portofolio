# Website Features & Architecture Documentation

This document contains technical and product specifications for advanced features introduced into the portfolio website.

---

# Proof Mode

## What is Proof Mode?

Proof Mode transforms the portfolio from a collection of claims into an interactive evidence experience. Instead of only telling visitors what the developer can build, it allows them to explore how projects work, why decisions were made, and interact with live demonstrations.

Traditional portfolios state:
- *"I know Next.js, PyTorch, and Distributed Systems."*
- *"I built an AI data engine."*

Proof Mode lets visitors experience evidence:
```
WHAT I BUILD  ➔  HOW I THINK  ➔  HOW IT WORKS  ➔  INTERACT WITH IT  ➔  SEE THE RESULT
```

---

## Why was Proof Mode Created?

1. **Eliminate Portfolio Claims Friction**: Hiring managers, tech leads, and clients encounter generic skill percentage bars and static screenshots. Proof Mode replaces static claims with transparent, verifiable evidence.
2. **Showcase Engineering Depth**: Demonstrates architectural decision-making, trade-off evaluations, system flow design, and benchmark metrics.
3. **Show, Don't Tell Differentiation**: Sets the portfolio apart by turning project showcases into interactive product demonstrations.

---

## How Proof Mode Works

```
Visitor (Homepage / Direct Link)
  │
  ▼
[ ENTER PROOF MODE ] ➔ /proof-mode Route
  │
  ▼
Select Capability (Engineering | AI/ML | Problem Solving | Creative Tech | Product Thinking)
  │
  ▼
Inspect Evidence Experience
  ├─ WHAT I BUILD (Title, Summary, Associated Project Reference)
  ├─ HOW I THINK (Problem Statement & Strategic Approach)
  ├─ HOW IT WORKS (Technical Architecture Breakdown)
  ├─ INTERACT WITH IT (Interactive Visualizer: Nodes, Metrics, Decisions, Flows)
  └─ SEE THE RESULT (Quantified Impact & Verified Evidence Links)
```

---

## Technical Architecture

### Data Flow
```
Admin Dashboard (Proof Mode Tab)
  │
  ▼
POST / PUT / DELETE  /api/admin/proof-mode
  │
  ▼
Firestore Collection `proof_experiences`
  │
  ▼ (Fetch published = true)
Public Route /proof-mode & Homepage Section <ProofModeEntry />
```

### Components & Responsibilities
- **`app/proof-mode/page.tsx`**: Public Proof Mode route rendering category filters, evidence timeline, active proof detail inspector, and polished empty state.
- **`app/components/ProofModeEntry.tsx`**: High-impact homepage section inviting visitors into Proof Mode.
- **`app/components/InteractiveProofVisualizer.tsx`**: Reusable interactive visualizer supporting 5 demonstration types:
  1. `architecture_visualizer`: Interactive system nodes and connection inspector.
  2. `before_after`: Interactive metric comparison (Latency, Throughput, Memory).
  3. `decision_simulation`: Interactive decision tree scenario picker with real engineering outcomes.
  4. `system_flow`: Step-by-step pipeline execution stream.
  5. `interactive_demo`: Live interactive playground.
- **`app/admin/dashboard/components/ProofModeTab.tsx`**: Complete Admin CMS CRUD interface for creating, editing, previewing, publishing, unpublishing, reordering, and deleting Proof Experiences.

### APIs & Firebase Integration
- **`GET /api/admin/proof-mode`**: Public endpoint returning published proof experiences (Admin session returns all items including drafts).
- **`POST /api/admin/proof-mode`**: Admin endpoint creating a new proof experience with rate limiting and audit logging.
- **`PUT /api/admin/proof-mode/[id]`**: Admin endpoint updating proof experience fields or publishing state.
- **`DELETE /api/admin/proof-mode/[id]`**: Admin endpoint removing proof experiences.
- **`serverFirebaseHelpers`**: `getAllProofExperiences`, `getProofExperienceById`, `createProofExperience`, `updateProofExperience`, `deleteProofExperience`.
- **`firestore.rules`**: Added security rule `/proof_experiences/{proofId}` (allow read to all, allow write to admin).

---

## Current V1 Capabilities

- **Zero Fake Data / Zero Hardcoded Claims**: 100% data-driven from Firestore.
- **Admin Control & Live Preview**: Administrator configures real proof experiences and previews them in a live modal before publishing.
- **Polished Empty State**: When no proof experiences are published, the public UI shows: *"Proof Mode is being prepared."*
- **Project Association**: Proof experiences reference existing portfolio projects (`projectId`) without duplicating project records.
- **Accessibility & Motion Preference**: Accessible keyboard navigation, ARIA attributes, and reduced-motion fallbacks.

---

## Future ML Integration Strategy

Proof Mode data structures include reserved `mlMetadata` fields for seamless future integration of an ML recommendation engine:

```typescript
mlMetadata?: {
  tags?: string[];
  similarityVector?: number[];
  capabilityMapping?: string[];
  targetAudience?: string;
};
```

### Planned ML Capabilities:
1. **Embedding & Similarity Search**: Calculate vector embeddings for proof experiences to auto-suggest related technical proofs.
2. **Visitor Persona Adaptation**: Personalize proof recommendations based on visitor domain (e.g., AI Researcher vs Backend Architect vs Product Manager).
3. **Automated Evidence Summarization**: Generate dynamic insights on architectural trade-offs using LLM models.

---

## How to Add a New Proof Experience

1. Log into the Admin Dashboard (`/admin/login`).
2. Select the **Proof Mode** tab on the left sidebar.
3. Click **Create Proof Experience**.
4. Fill in:
   - **Title**: Descriptive experience title.
   - **Category**: Select Engineering, AI / ML, Problem Solving, Creative Technology, or Product Thinking.
   - **Associated Project**: Select an existing project from the dropdown.
   - **Problem Statement (WHAT I BUILD)**
   - **Strategic Approach (HOW I THINK)**
   - **Technical Details (HOW IT WORKS)**
   - **Demonstration Type (INTERACT WITH IT)**
   - **Demonstration Config (JSON)**: Specify nodes/connections, before/after metrics, or flow steps.
   - **Result & Impact (SEE THE RESULT)**
   - **Evidence Links**: `Label | URL | type`
5. Click **Preview** to inspect in live modal view.
6. Check **Publish publicly immediately** and click **Save Proof Experience**.

---

## Key Files & Folders Reference

- `app/lib/types.ts`: Interface definitions (`ProofExperience`, `DemonstrationType`, `EvidenceLink`, `DemonstrationConfig`).
- `firestore.rules`: Security rules for `proof_experiences` collection.
- `app/lib/firebaseServer.ts`: Server-side Firestore helper functions.
- `app/lib/adminAPI.ts`: Client-side admin API methods.
- `app/api/admin/proof-mode/route.ts`: Collection REST endpoint.
- `app/api/admin/proof-mode/[id]/route.ts`: Single-item REST endpoint.
- `app/admin/dashboard/components/ProofModeTab.tsx`: Admin CMS tab component.
- `app/components/InteractiveProofVisualizer.tsx`: Interactive visualizer component.
- `app/components/ProofModeEntry.tsx`: Homepage banner section.
- `app/proof-mode/page.tsx`: Public Proof Mode route page.
- `WEBSITE_FEATURES.md`: Comprehensive documentation.
