# RAG Document Assistant

A web application that allows users to upload documents and files, which are stored in Supabase and retrieved via Retrieval-Augmented Generation (RAG) when a user asks a question to an AI agent in the chat UI.

## Features

- **Document Management**: Upload, view, and delete documents
- **Intelligent Chat**: Ask questions about your documents with an AI assistant
- **Insights & Analytics**: Get valuable insights from your uploaded documents
- **Responsive UI**: Optimized for both desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database & Storage**: Supabase
- **AI & NLP**: LangChain, Cohere (LLM & Embeddings)
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Cohere API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hoodini/rag-document-assistant.git
   cd rag-document-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Cohere
   COHERE_API_KEY=your-cohere-api-key
   ```

4. Set up Supabase:
   - Create a new project in Supabase
   - Set up storage with a bucket called "documents"
   - Configure storage permissions to allow authenticated uploads and public reads

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## Security

This application implements security measures that correspond to the OWASP Top 10 recommendations:

- Input validation for all forms
- Authentication and authorization via Supabase
- CSRF protection
- XSS prevention
- Content Security Policy
- Rate limiting for API endpoints
- Secure file handling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
