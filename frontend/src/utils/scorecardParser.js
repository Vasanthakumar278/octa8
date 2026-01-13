
export const parseScorecard = (text) => {
    // Default structure
    const result = {
        technicalScore: 'N/A',
        communicationScore: 'N/A',
        strengths: [],
        improvements: [],
        summary: 'No summary provided.'
    };

    if (!text) return result;

    // Regex patterns to capture fields with extreme flexibility
    const techRegex = /(?:Technical|Tech)(?:\s+Score|\s+Proficiency|\s+Skill|\s+Grade|\s+Rating)?[\s\*\_]*[:\-]?[\s\*\_]*\[?(\d+(?:\.\d+)?)\]?(?:\/10)?/i;
    const techMatch = text.match(techRegex) || text.match(/Technical\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
    if (techMatch) result.technicalScore = techMatch[1].split('/')[0].trim() + '/10';

    const commRegex = /(?:Communication|Comm)(?:\s+Score|\s+Skills?|\s+Skill|\s+Grade|\s+Rating)?[\s\*\_]*[:\-]?[\s\*\_]*\[?(\d+(?:\.\d+)?)\]?(?:\/10)?/i;
    const commMatch = text.match(commRegex) || text.match(/Communication\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
    if (commMatch) result.communicationScore = commMatch[1].split('/')[0].trim() + '/10';

    // Helper to extract list items with better section boundaries
    const extractList = (sectionName) => {
        const nextSections = ['Areas for Improvement', 'Improvements', 'Growth Areas', 'Summary', 'Conclusion', 'Overall', 'Next Steps'];
        const nextSectionsPattern = nextSections.join('|');
        const regex = new RegExp(`(?:\\*\\*|\\*)?${sectionName}(?:\\*\\*|\\*)?:\\s*([\\s\\S]*?)(?=(?:(?:\\*\\*|\\*)?(?:${nextSectionsPattern})(?:\\*\\*|\\*)?|$))`, 'i');
        const match = text.match(regex);
        if (match) {
            return match[1]
                .split('\n')
                .map(line => line.replace(/^[-*•]\s*/, '').trim())
                .filter(line => line.length > 2 && !line.startsWith('---'));
        }
        return [];
    };

    result.strengths = extractList('Strengths');
    result.improvements = extractList('(?:Areas for Improvement|Improvements|Growth Areas)');

    const sumMatch = text.match(/(?:\*\*|\*)?(?:Summary|Conclusion|Overall|Final Thoughts)(?:\*\*|\*)?:\s*([\s\S]*)$/i);
    if (sumMatch) {
        let summaryText = sumMatch[1].trim();
        // cleanup potential trailing junk
        summaryText = summaryText.split(/Next Question|Task:|Output Rules:|Interviewer Assistant:/i)[0].trim();
        result.summary = summaryText;
    }

    return result;
};
