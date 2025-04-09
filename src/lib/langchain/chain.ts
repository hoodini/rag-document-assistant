import { ChatCohere } from "@langchain/cohere";
import { CohereEmbeddings } from "@langchain/cohere";
import { PromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import { formatDocumentsAsString } from "langchain/util/document";
import { RunnableSequence } from "langchain/schema/runnable";

// Initialize Cohere language model
const getCohereAPI = () => {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    throw new Error("COHERE_API_KEY is not set");
  }
  return apiKey;
};

export const getEmbeddings = () => {
  return new CohereEmbeddings({
    apiKey: getCohereAPI(),
    model: "embed-english-v3.0",
  });
};

export const getLLM = () => {
  return new ChatCohere({
    apiKey: getCohereAPI(),
    model: "command",
    temperature: 0.1,
  });
};

// Standard Question-Answering prompt
const QA_PROMPT_TEMPLATE = `
You are a helpful assistant that answers questions based on the provided documents. 
Documents:
{context}

Question: {question}

Answer the question based only on the provided documents. If the documents don't contain the answer, say "I don't have enough information to answer this question".
Your answer should be thorough, accurate, and helpful.
`;

// Create the QA chain
export const createQAChain = (retriever: any) => {
  const qaPrompt = PromptTemplate.fromTemplate(QA_PROMPT_TEMPLATE);
  const llm = getLLM();
  const outputParser = new StringOutputParser();

  const qaChain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocumentsAsString),
      question: (input: { question: string }) => input.question,
    },
    qaPrompt,
    llm,
    outputParser,
  ]);

  return qaChain;
};

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