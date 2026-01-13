const text1 = "Hello! Welcome to OCTA8. --- ### Instruction with Added Complexity (Difficulty Level: More Challenging)";
const text2 = "Question: What is your background?";
const text3 = "Interviewer: Tell me more.\nResponse: I am a dev.";

function cleanAiResponse(text) {
    if (!text) return '';
    let cleaned = text;
    cleaned = cleaned.replace(/---+\s*###\s*Instruction with Added Complexity.*/gi, '');
    cleaned = cleaned.replace(/Difficulty Level:.*/gi, '');
    cleaned = cleaned.replace(/^(Question|Interviewer|Response|AI|Assistant|Interviewer Assistant):\s*/i, '');
    cleaned = cleaned.replace(/\n(Question|Interviewer|Response|AI|Assistant|Interviewer Assistant):\s*/gi, ' ');
    cleaned = cleaned.replace(/---+$/, '');
    return cleaned.trim();
}

console.log('Test 1:', cleanAiResponse(text1));
console.log('Test 2:', cleanAiResponse(text2));
console.log('Test 3:', cleanAiResponse(text3));
