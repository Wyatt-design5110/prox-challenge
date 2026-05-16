# Vulcan OmniPro 220 — Multimodal Welding Assistant

**Live demo:** https://prox-challenge-mu.vercel.app

A multimodal AI agent for the Vulcan OmniPro 220 multiprocess welding system, built for the Prox founding engineer challenge. Ask any question about setup, operation, or troubleshooting — the agent answers from the full owner's manual and generates interactive visuals, diagrams, and calculators when they help more than words.

---

## Quick Start

```bash
git clone https://github.com/Wyatt-design5110/prox-challenge.git
cd prox-challenge
cp .env.example .env        # add your Anthropic API key
npm install
npm run dev
```

Open http://localhost:3000. That's it.

---

## How It Works

### Knowledge Source
The agent reads the **complete 48-page OmniPro 220 owner's manual** on every conversation. The full PDF is passed directly to Claude as a base64-encoded document using Anthropic's native PDF support. This means:

- Every page, table, diagram, and schematic is available
- No knowledge gaps from manual curation
- The agent sees the same document a user would read
- Answers are grounded in the actual manual, not summarized approximations

This is a deliberate architectural choice over a curated system prompt. A hand-written knowledge base would require constant maintenance and would always have gaps. Passing the full PDF means the agent can answer questions we never anticipated.

### Multimodal Responses
The agent produces three types of output depending on the question:

**1. Manual images** — Key pages extracted from the PDF are embedded as base64 images. When a question relates to a specific diagram (polarity setup, wire feed mechanism, weld diagnosis, strike test), the agent surfaces the actual manual page inline. Users see the same diagram the manual shows, not a description of it.

**2. Generated artifacts** — For interactive content, the agent generates self-contained HTML rendered in a sandboxed iframe:
- Duty cycle calculator — input voltage and amperage, get welding/resting minutes
- Troubleshooting flowcharts — decision trees for porosity, burn-through, wire feed issues
- Settings configurator — input process, material, thickness, get recommended wire speed and voltage
- Polarity diagrams — schematic-style cable connection diagrams

**3. Structured text** — For straightforward questions, clean markdown with safety warnings, numbered steps, and clear recommendations.

### Architecture

```
src/
  hooks/
    useAgent.js          # Streaming API calls, PDF attachment, conversation history
  components/
    ChatInterface.jsx    # Main UI, sidebar, input handling
    MessageBubble.jsx    # Renders text, artifacts, and manual images
    ArtifactFrame.jsx    # Sandboxed iframe for generated HTML, auto-resizes
    ManualImage.jsx      # Expandable manual page images with descriptions
  manualImages.js        # 14 key manual pages as base64 JPEGs
  pdfData.js             # Full manual PDF as base64 for API calls
```

The agent uses **streaming responses** so output appears token-by-token. During streaming, partial `<ARTIFACT>` tags are hidden and replaced with a loading spinner — the rendered visual appears only once the full HTML is received. This prevents raw HTML from ever showing in the chat.

### Design Decisions

**Full PDF over RAG** — Retrieval-augmented generation would require chunking, embedding, and a vector store. For a 48-page manual with dense cross-references (duty cycle tables that reference voltage specs that reference process settings), retrieval risks missing context. Sending the full document is simpler, more accurate, and the manual is small enough that it fits comfortably in Claude's context window.

**Client-side API calls** — The API key is stored in `.env` and calls go directly from the browser to Anthropic. No backend server needed, which means no infrastructure to manage and the project runs with a single `npm run dev`.

**Prompt caching** — The PDF is attached with `cache_control: ephemeral`. On the first message of a session the PDF is processed; subsequent messages in the same conversation reuse the cached context, making them significantly faster and cheaper.

**Industrial UI** — The dark theme (IBM Plex Sans/Mono, orange accents) matches the welder's aesthetic and signals that this is a tool built for a specific product, not a generic chatbot.

---

## What It Can Do

Tested against the evaluation criteria:

| Question | Response |
|----------|----------|
| "What's the duty cycle for MIG at 200A on 240V?" | Accurate answer (25% @ 200A) + interactive calculator |
| "I'm getting porosity in my flux-cored welds" | Ordered troubleshooting list with polarity as #1 cause + flowchart |
| "What polarity for TIG? Which socket does ground go in?" | DCEN explanation + polarity diagram + manual image |
| "Show me the stick setup" | Manual page 27 image with labeled cable connections |
| "Can I use an extension cord?" | No — explains why and cites the manual |
| "Can I weld aluminum?" | Yes — with optional spool gun, explains process |
| "What do the symbols mean?" | Full symbology chart from page 6 |
| "Build me a settings configurator" | Interactive HTML tool with process/material/thickness inputs |

---

## Tech Stack

- **React** + **Vite** — frontend
- **Anthropic Claude claude-sonnet-4-5** — the model
- **claude-sonnet-4-5 PDF support** — native document understanding
- **react-markdown** + **remark-gfm** — markdown rendering
- **Vercel** — hosting

---

## Future Direction

This is purpose-built for the OmniPro 220. The natural next step is a document ingestion pipeline where any product manual can be uploaded, parsed, and used to create a product-specific agent instantly. Wich is exactly what Prox does at scale. The architecture here (PDF → Claude → multimodal response) is the core pattern that would generalize across any product in Prox's catalog.

Other improvements with more time:
- Voice input via Web Speech API for hands-free use in a shop
- Persistent chat history across sessions
- Smarter artifact caching so repeat questions don't regenerate visuals
- A/B testing different response formats for helpfulness
