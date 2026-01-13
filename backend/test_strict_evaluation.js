const axios = require('axios');

const OLLAMA_HOST = 'http://localhost:11434';

async function testEvaluation(scenarioName, history) {
    console.log(`\n--- Testing Scenario: ${scenarioName} ---`);

    // Exact prompt from server.js (with variables injected)
    const prompt = `You are OCTA8, an expert Interviewer. The interview is complete.
CONTEXT:
Interview History:
${history}
Last User Answer: That's all.

TASK: Evaluate the candidate's performance based STRICTLY AND EXCLUSIVELY on their actual answers provided in the "Interview History" above.
- The evaluation must depend ONLY on what the candidate said in the chat.
- Do NOT make assumptions based on implied knowledge.
- If the candidate provided short, vague, or incorrect answers, give them a LOW score.
- Focus on the substance of their responses, their tone, and their professional vocabulary.

EVALUATION CRITERIA:
1. Technical Score (X/10): Based ONLY on the technical accuracy, depth, and correctness of the answers given during this specific chat session.
2. Communication Score (X/10): Based ONLY on the candidate's sentence structure, clarity, professional tone, and vocabulary used in this specific chat session.

REQUIRED OUTPUT FORMAT:
[SCORECARD]
Technical Score: [Score]/10
Communication Score: [Score]/10
Strengths:
- [Point 1: specific positive trait or good answer from the chat]
- [Point 2]
Areas for Improvement:
- [Point 1: specific weak answer, mistake, or communication flaw from the chat]
- [Point 2]
Summary:
[A frank assessment of how they performed in the interview. Did they prove their skills? Be honest and critical.]

CRITICAL: 
- Output should be PLAIN TEXT without markdown bolding or titles.
- Do not hallucinate performance not present in the history.`;

    try {
        const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
            model: 'phi3:mini',
            prompt: prompt,
            stream: false
        }, { timeout: 60000 });

        console.log("AI Response:\n" + response.data.response);
    } catch (error) {
        console.error("Error calling Ollama:", error.message);
    }
}

const badHistory = `
Interviewer: Welcome.
Candidate: Hi.
Interviewer: Can you explain the difference between REST and GraphQL?
Candidate: I don't know much about GraphQL. REST is standard.
Interviewer: How do you handle state in React?
Candidate: Use variables.
Interviewer: What is a closure in JavaScript?
Candidate: It's like a function inside a function I think.
`;

const goodHistory = `
Interviewer: Welcome.
Candidate: Hello, thank you for having me.
Interviewer: Can you explain the difference between REST and GraphQL?
Candidate: REST is an architectural style based on resources and standard HTTP methods, often leading to over-fetching or under-fetching. GraphQL is a query language that allows the client to request exactly the data it needs, solving those over-fetching issues but adding complexity on the backend with schemas and resolvers.
Interviewer: How do you handle state in React?
Candidate: For simple local state, I use the useState hook. For more complex state sharing, I might use useContext or a library like Redux or Zustand depending on the scale of the application.
Interviewer: What is a closure in JavaScript?
Candidate: A closure is the combination of a function bundled together with references to its surrounding state or lexical environment. It gives you access to an outer function's scope from an inner function, which is useful for data privacy and factory functions.
`;

async function run() {
    await testEvaluation("Bad Candidate", badHistory);
    await testEvaluation("Good Candidate", goodHistory);
}

run();
