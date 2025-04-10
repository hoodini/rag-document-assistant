import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { CohereClient } from "cohere-ai";
import { CohereEmbeddings } from "@langchain/cohere";

// Cohere API client
export const cohereClient = new CohereClient({
  token: process.env.COHERE_API_KEY!
});

/**
 * Get embeddings model
 */
export function getEmbeddings() {
  return new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model: "embed-english-v3.0", // Explicitly specify model version
  });
}

/**
 * Get LLM instance
 */
export function getLLM() {
  // Return a custom LLM using CohereClient
  const llm = {
    invoke: async (prompt: string): Promise<string> => {
      try {
        const response = await cohereClient.generate({
          model: "command", // Explicitly specify model
          prompt: prompt,
          maxTokens: 1000,
          temperature: 0.7,
          stopSequences: [],
          returnLikelihoods: "NONE",
        });

        // Return the response text
        return response.generations[0]?.text || "No response generated";
      } catch (error: any) {
        console.error("Error calling Cohere API:", error);
        return `Error: ${error.message || "Unknown error calling Cohere API"}`;
      }
    },
    pipe: (fn: any) => {
      return {
        invoke: async (input: string) => {
          const output = await llm.invoke(input);
          return fn(output);
        }
      };
    }
  };

  return llm;
}

/**
 * Format a RAG prompt
 */
const formatRAGPrompt = (context: string, question: string) => {
  return `You are a helpful AI assistant that answers questions based on the provided context.
  
Context information:
${context}

User question: ${question}

Instructions:
1. Answer the user question based ONLY on the context provided
2. If the context doesn't contain the answer, say "I don't have enough information to answer that question."
3. Keep your answer concise, informative, and to the point
4. Include relevant facts from the context to support your answer

Your answer:`;
};

/**
 * Create a QA chain for retrieval augmented generation (RAG)
 */
export function createQAChain(retriever: any) {
  const ragPromptTemplate = (input: { question: string; context: string }) => {
    return formatRAGPrompt(input.context, input.question);
  };

  // Create a chain that retrieves docs, formats them, and sends to LLM
  const chain = RunnableSequence.from([
    {
      // Accepts just a question as input
      question: (input: { question: string }) => input.question,
      // Fetch relevant documents using retriever
      context: async (input: { question: string }) => {
        // Get documents using the retriever
        const docs = await retriever.invoke();
        // Format documents into a single string
        return formatDocumentsAsString(docs);
      },
    },
    // Format with the RAG prompt template
    ragPromptTemplate,
    // Send to LLM
    getLLM(),
    // Output parser
    new StringOutputParser(),
  ]);

  return chain;
}

// Insight prompt template
const INSIGHT_PROMPT_TEMPLATE = `
You are an insights analyst looking at documents provided by a user.
Documents:
{context}

Based on these documents, provide the following insights:
1. Key themes and topics
2. Main entities mentioned
3. Potential action items 
4. A brief summary

Format your response as simple markdown with headers for each section.
`;

// Create the insights chain
export const createInsightChain = (retriever: any) => {
  const insightPrompt = PromptTemplate.fromTemplate(INSIGHT_PROMPT_TEMPLATE);
  const llm = getLLM();
  const outputParser = new StringOutputParser();

  const insightChain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocumentsAsString),
    },
    insightPrompt,
    llm,
    outputParser,
  ]);

  return insightChain;
}; 