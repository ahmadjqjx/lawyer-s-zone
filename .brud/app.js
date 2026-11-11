import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function askLegalAI(userQuery) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert, authoritative Legal AI Assistant and Research Analyst.
Your role is to analyze legal issues, extract relevant precedents, interpret statutory provisions, and draft court-ready documentation with precision and professional rigor.

Always structure your responses using:
- **Executive Legal Opinion**: Concise, high-level summary.
- **Statutory Provisions**: Direct sections from relevant acts.
- **Judicial Precedents & Analysis**: Case authorities and their practical application.
- **Actionable Steps / Draft**: Concrete procedural path or drafting checklist.

Do not hallucinate citations. If no direct authority exists, state so clearly.`,
        },
        {
          role: "user",
          content: userQuery,
        },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    console.log("\n--- AI Legal Response ---\n");
    console.log(completion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error communicating with Groq API:", error.message);
  }
}

// Test Query
askLegalAI(
  "What are the legal remedies for a tenant facing unlawful eviction without notice?",
);
