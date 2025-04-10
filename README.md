# RAG Document Assistant

A document assistant application with RAG (Retrieval-Augmented Generation) capabilities for answering questions about your documents.

## Features

- Upload and manage documents
- Chat with AI about document content
- Get insights and analysis on your documents
- Responsive UI with dark mode support

## Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Cohere API key (for AI features)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
COHERE_API_KEY=your_cohere_api_key
```

### 3. Database Setup

There are two ways to set up the required Supabase resources:

#### Option 1: Using the application setup UI

1. Start the application: `npm run dev`
2. Open your browser at `http://localhost:3000`
3. You'll see a setup notification - click "Setup Instructions"
4. Follow the instructions to initialize the database and storage

#### Option 2: Manual setup

1. In your Supabase dashboard, open the SQL Editor
2. Run the following SQL to create the required table:

```sql
-- Table for storing document chunks and embeddings
CREATE TABLE document_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index on document_id for faster lookup
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
```

3. In the Supabase Storage section, create a new bucket named "documents"
4. Set the bucket to public (or configure appropriate RLS policies)

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

## Advanced Configuration

See `DOCUMENT_PROCESSING.md` for more details on how document processing works and how to configure it for production use.

## Security Considerations

This application implements security best practices following OWASP guidelines:

- Input validation for all user inputs
- Protection against XSS attacks
- CSRF protection
- Secure authentication with Supabase
- Content Security Policy

For production use, it's recommended to implement Row Level Security (RLS) in Supabase to restrict document access to authorized users.

## License

MIT

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database & Storage**: Supabase
- **AI & NLP**: LangChain, Cohere (LLM & Embeddings)
- **State Management**: Zustand

## Project Structure

```
src/
├── app/               # Next.js app router
│   ├── api/           # API routes
│   └── page.tsx       # Main page
├── components/        # UI components
│   ├── chat/          # Chat-related components
│   ├── documents/     # Document-related components
│   ├── insights/      # Insights and analytics components
│   ├── layout/        # Layout components
│   └── ui/            # UI components from shadcn/ui
├── lib/               # Utility libraries
│   ├── langchain/     # LangChain integrations
│   └── supabase/      # Supabase client
├── store/             # State management
└── types/             # TypeScript types
```

## API Endpoints

- `GET /api/documents` - Get all documents
- `POST /api/documents/upload` - Upload a document
- `DELETE /api/documents/:id` - Delete a document
- `POST /api/chat` - Send a message to the AI assistant
- `GET /api/insights` - Get insights from documents

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
