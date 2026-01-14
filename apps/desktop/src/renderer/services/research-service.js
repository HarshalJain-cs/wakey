// Deep Research Engine Service
// Web search and AI-powered research summarization
import { queryWithFallback } from './multi-model-service';
// ==========================================
// State
// ==========================================
let researchHistory = [];
let nextSessionId = 1;
let config = {
    maxResults: 10,
    includeAISummary: true,
    autoSaveToKnowledge: false,
};
// ==========================================
// Web Search
// ==========================================
/**
 * Search the web using DuckDuckGo Instant Answer API
 * This is free and doesn't require an API key
 */
export async function searchWeb(query) {
    try {
        // Use DuckDuckGo Instant Answer API
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`);
        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }
        const data = await response.json();
        const results = [];
        // Parse abstract (main result)
        if (data.Abstract) {
            results.push({
                title: data.Heading || query,
                url: data.AbstractURL || '',
                snippet: data.Abstract,
                source: data.AbstractSource || 'DuckDuckGo',
                relevanceScore: 1.0,
            });
        }
        // Parse related topics
        if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
            for (const topic of data.RelatedTopics.slice(0, config.maxResults - 1)) {
                if (topic.Text && topic.FirstURL) {
                    results.push({
                        title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 50),
                        url: topic.FirstURL,
                        snippet: topic.Text,
                        source: 'DuckDuckGo',
                        relevanceScore: 0.8,
                    });
                }
            }
        }
        // Parse results (if available)
        if (data.Results && Array.isArray(data.Results)) {
            for (const result of data.Results) {
                if (result.Text && result.FirstURL) {
                    results.push({
                        title: result.Text.substring(0, 100),
                        url: result.FirstURL,
                        snippet: result.Text,
                        source: 'DuckDuckGo',
                        relevanceScore: 0.7,
                    });
                }
            }
        }
        return results.slice(0, config.maxResults);
    }
    catch (error) {
        console.error('Web search error:', error);
        // Return fallback with AI-generated content
        return generateFallbackResults(query);
    }
}
/**
 * Generate fallback search results using AI when web search fails
 */
async function generateFallbackResults(query) {
    try {
        const prompt = `Generate 5 relevant search result summaries for the query: "${query}"

For each result, provide:
1. A descriptive title
2. A brief snippet (2-3 sentences)
3. The type of source it would be (Wikipedia, Article, Research Paper, etc.)

Format each result as:
TITLE: [title]
SNIPPET: [snippet]
SOURCE: [source]
---`;
        const response = await queryWithFallback(prompt, 'You are a research assistant. Generate realistic, helpful search result summaries.', 500);
        const results = [];
        const blocks = response.split('---').filter(b => b.trim());
        for (const block of blocks) {
            const titleMatch = block.match(/TITLE:\s*(.+)/i);
            const snippetMatch = block.match(/SNIPPET:\s*(.+)/is);
            const sourceMatch = block.match(/SOURCE:\s*(.+)/i);
            if (titleMatch && snippetMatch) {
                results.push({
                    title: titleMatch[1].trim(),
                    url: '#ai-generated',
                    snippet: snippetMatch[1].trim().replace(/SOURCE:.*/is, '').trim(),
                    source: sourceMatch ? sourceMatch[1].trim() : 'AI Generated',
                    relevanceScore: 0.6,
                });
            }
        }
        return results;
    }
    catch {
        return [{
                title: `Research: ${query}`,
                url: '#',
                snippet: 'Unable to fetch search results. Please try again later.',
                source: 'Local',
                relevanceScore: 0,
            }];
    }
}
// ==========================================
// Research Sessions
// ==========================================
/**
 * Conduct a full research session with AI summarization
 */
export async function conductResearch(query) {
    // Search the web
    const results = await searchWeb(query);
    let summary = '';
    let keyFindings = [];
    // Generate AI summary if enabled
    if (config.includeAISummary && results.length > 0) {
        const summaryResult = await generateResearchSummary(query, results);
        summary = summaryResult.summary;
        keyFindings = summaryResult.keyFindings;
    }
    // Create session
    const session = {
        id: nextSessionId++,
        query,
        results,
        summary,
        keyFindings,
        sources: results.map(r => r.url).filter(url => url !== '#ai-generated' && url !== '#'),
        createdAt: new Date().toISOString(),
        savedToKnowledge: false,
    };
    // Add to history
    researchHistory.unshift(session);
    if (researchHistory.length > 50) {
        researchHistory = researchHistory.slice(0, 50);
    }
    return session;
}
/**
 * Generate an AI summary of research results
 */
async function generateResearchSummary(query, results) {
    const resultsText = results
        .map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}`)
        .join('\n\n');
    const prompt = `Based on these search results for "${query}":

${resultsText}

Please provide:
1. A comprehensive summary (2-3 paragraphs) synthesizing the key information
2. 3-5 key findings as bullet points

Format your response as:
SUMMARY:
[your summary here]

KEY FINDINGS:
- [finding 1]
- [finding 2]
- [finding 3]`;
    try {
        const response = await queryWithFallback(prompt, 'You are a research analyst. Synthesize information from multiple sources into clear summaries.', 800);
        // Parse summary
        const summaryMatch = response.match(/SUMMARY:\s*([\s\S]*?)(?=KEY FINDINGS:|$)/i);
        const summary = summaryMatch ? summaryMatch[1].trim() : response;
        // Parse key findings
        const findingsMatch = response.match(/KEY FINDINGS:\s*([\s\S]*?)$/i);
        const keyFindings = [];
        if (findingsMatch) {
            const lines = findingsMatch[1].split('\n');
            for (const line of lines) {
                const cleaned = line.replace(/^[-•*]\s*/, '').trim();
                if (cleaned && cleaned.length > 5) {
                    keyFindings.push(cleaned);
                }
            }
        }
        return { summary, keyFindings };
    }
    catch {
        return {
            summary: 'Unable to generate summary. Please review the search results manually.',
            keyFindings: [],
        };
    }
}
// ==========================================
// History Management
// ==========================================
export function getResearchHistory() {
    return [...researchHistory];
}
export function getResearchSession(id) {
    return researchHistory.find(s => s.id === id);
}
export function deleteResearchSession(id) {
    researchHistory = researchHistory.filter(s => s.id !== id);
}
export function clearResearchHistory() {
    researchHistory = [];
}
// ==========================================
// Configuration
// ==========================================
export function getResearchConfig() {
    return { ...config };
}
export function updateResearchConfig(newConfig) {
    config = { ...config, ...newConfig };
}
// ==========================================
// Integration with Knowledge Base
// ==========================================
export function markAsSavedToKnowledge(sessionId) {
    const session = researchHistory.find(s => s.id === sessionId);
    if (session) {
        session.savedToKnowledge = true;
    }
}
/**
 * Generate note content from a research session
 */
export function generateNoteFromSession(session) {
    const content = `# Research: ${session.query}

## Summary
${session.summary}

## Key Findings
${session.keyFindings.map(f => `- ${f}`).join('\n')}

## Sources
${session.sources.map(s => `- ${s}`).join('\n')}

---
*Research conducted on ${new Date(session.createdAt).toLocaleDateString()}*
`;
    // Extract tags from query
    const tags = session.query
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 5);
    return {
        title: `Research: ${session.query}`,
        content,
        tags: ['research', ...tags],
    };
}
// ==========================================
// Quick Research (Inline query)
// ==========================================
/**
 * Quick inline research - returns a brief answer
 */
export async function quickResearch(question) {
    const results = await searchWeb(question);
    if (results.length === 0) {
        return 'No results found. Please try a different query.';
    }
    // Combine top results for context
    const context = results
        .slice(0, 3)
        .map(r => r.snippet)
        .join('\n\n');
    const prompt = `Based on this information:
${context}

Answer this question concisely: ${question}

Provide a direct, helpful answer in 2-3 sentences.`;
    try {
        const answer = await queryWithFallback(prompt, 'You are a helpful assistant. Answer questions directly and concisely.', 200);
        return answer;
    }
    catch {
        return results[0].snippet;
    }
}
//# sourceMappingURL=research-service.js.map