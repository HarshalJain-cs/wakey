// Knowledge Management Services
// Notes, Knowledge Graph, RAG, and Flashcards

// ==========================================
// Notes Service
// ==========================================

export interface Note {
    id: number;
    title: string;
    content: string;
    tags: string[];
    embedding?: number[];
    createdAt: string;
    updatedAt: string;
}

export interface KnowledgeNode {
    id: number;
    title: string;
    type: 'concept' | 'entity' | 'note' | 'project' | 'task';
    content: string;
    metadata: Record<string, unknown>;
    createdAt: string;
}

export interface KnowledgeEdge {
    id: number;
    sourceId: number;
    targetId: number;
    relationship: string;
    weight: number;
}

export interface Flashcard {
    id: number;
    front: string;
    back: string;
    sourceNoteId?: number;
    easeFactor: number;
    intervalDays: number;
    nextReview: string;
    reviewCount: number;
    createdAt: string;
}

// In-memory storage (will be persisted via electron-store)
let notes: Note[] = [];
let knowledgeNodes: KnowledgeNode[] = [];
let knowledgeEdges: KnowledgeEdge[] = [];
let flashcards: Flashcard[] = [];
let nextIds = { note: 1, node: 1, edge: 1, flashcard: 1 };

// ==========================================
// Notes CRUD
// ==========================================

export function createNote(title: string, content: string, tags: string[] = []): Note {
    const now = new Date().toISOString();
    const note: Note = {
        id: nextIds.note++,
        title,
        content,
        tags,
        createdAt: now,
        updatedAt: now,
    };
    notes.push(note);
    saveToDisk();

    // Auto-create knowledge node for the note
    createKnowledgeNode(title, 'note', content, { noteId: note.id });

    return note;
}

export function updateNote(id: number, updates: Partial<Pick<Note, 'title' | 'content' | 'tags'>>): Note | null {
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return null;

    notes[idx] = {
        ...notes[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
    };
    saveToDisk();

    return notes[idx];
}

export function deleteNote(id: number): boolean {
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return false;

    notes.splice(idx, 1);
    saveToDisk();

    // Remove associated knowledge nodes and edges
    const nodeIdx = knowledgeNodes.findIndex(n => n.metadata.noteId === id);
    if (nodeIdx !== -1) {
        const nodeId = knowledgeNodes[nodeIdx].id;
        knowledgeNodes.splice(nodeIdx, 1);
        knowledgeEdges = knowledgeEdges.filter(e => e.sourceId !== nodeId && e.targetId !== nodeId);
    }

    // Remove associated flashcards
    flashcards = flashcards.filter(f => f.sourceNoteId !== id);

    return true;
}

export function getNote(id: number): Note | null {
    return notes.find(n => n.id === id) || null;
}

export function getAllNotes(): Note[] {
    return [...notes].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export function searchNotes(query: string): Note[] {
    const lower = query.toLowerCase();
    return notes.filter(n =>
        n.title.toLowerCase().includes(lower) ||
        n.content.toLowerCase().includes(lower) ||
        n.tags.some(t => t.toLowerCase().includes(lower))
    );
}

export function getNotesByTag(tag: string): Note[] {
    return notes.filter(n => n.tags.includes(tag));
}

export function getAllTags(): string[] {
    const tagSet = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
}

// ==========================================
// Knowledge Graph
// ==========================================

export function createKnowledgeNode(
    title: string,
    type: KnowledgeNode['type'],
    content: string = '',
    metadata: Record<string, unknown> = {}
): KnowledgeNode {
    const node: KnowledgeNode = {
        id: nextIds.node++,
        title,
        type,
        content,
        metadata,
        createdAt: new Date().toISOString(),
    };
    knowledgeNodes.push(node);
    updateNextIds();
    saveToDisk();
    return node;
}

export function createKnowledgeEdge(
    sourceId: number,
    targetId: number,
    relationship: string,
    weight: number = 1.0
): KnowledgeEdge | null {
    // Verify nodes exist
    if (!knowledgeNodes.find(n => n.id === sourceId) ||
        !knowledgeNodes.find(n => n.id === targetId)) {
        return null;
    }

    const edge: KnowledgeEdge = {
        id: nextIds.edge++,
        sourceId,
        targetId,
        relationship,
        weight,
    };
    knowledgeEdges.push(edge);
    saveToDisk();
    return edge;
}

export function getKnowledgeGraph(): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
    return {
        nodes: [...knowledgeNodes],
        edges: [...knowledgeEdges],
    };
}

export function getConnectedNodes(nodeId: number): KnowledgeNode[] {
    const connectedIds = new Set<number>();

    knowledgeEdges.forEach(e => {
        if (e.sourceId === nodeId) connectedIds.add(e.targetId);
        if (e.targetId === nodeId) connectedIds.add(e.sourceId);
    });

    return knowledgeNodes.filter(n => connectedIds.has(n.id));
}

export function findNodesByType(type: KnowledgeNode['type']): KnowledgeNode[] {
    return knowledgeNodes.filter(n => n.type === type);
}

export function searchKnowledgeNodes(query: string): KnowledgeNode[] {
    const lower = query.toLowerCase();
    return knowledgeNodes.filter(n =>
        n.title.toLowerCase().includes(lower) ||
        n.content.toLowerCase().includes(lower)
    );
}

// ==========================================
// Simple Text Embeddings (TF-IDF style)
// ==========================================

function tokenize(text: string): string[] {
    return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);
}

function computeTermFrequency(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    tokens.forEach(token => {
        tf.set(token, (tf.get(token) || 0) + 1);
    });
    // Normalize
    const maxFreq = Math.max(...tf.values());
    tf.forEach((v, k) => tf.set(k, v / maxFreq));
    return tf;
}

function computeSimpleEmbedding(text: string): number[] {
    // Simple bag-of-words style embedding
    const tokens = tokenize(text);
    const tf = computeTermFrequency(tokens);

    // Use first 100 most common English words as dimensions
    const commonWords = [
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
        'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
        'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
        'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
        'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
        'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
        'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
    ];

    return commonWords.map(word => tf.get(word) || 0);
}

function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ==========================================
// RAG (Retrieval Augmented Generation)
// ==========================================

export function updateNoteEmbedding(noteId: number): void {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        note.embedding = computeSimpleEmbedding(`${note.title} ${note.content}`);
    }
}

export function updateAllEmbeddings(): void {
    notes.forEach(note => {
        note.embedding = computeSimpleEmbedding(`${note.title} ${note.content}`);
    });
}

export function findSimilarNotes(query: string, topK: number = 5): { note: Note; similarity: number }[] {
    const queryEmbedding = computeSimpleEmbedding(query);

    const results = notes
        .filter(n => n.embedding)
        .map(note => ({
            note,
            similarity: cosineSimilarity(queryEmbedding, note.embedding!),
        }))
        .filter(r => r.similarity > 0.1)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

    return results;
}

export function getContextForQuery(query: string, maxChars: number = 2000): string {
    const similar = findSimilarNotes(query, 3);

    if (similar.length === 0) return '';

    let context = 'Relevant notes:\n\n';
    let charCount = context.length;

    for (const { note } of similar) {
        const noteContext = `## ${note.title}\n${note.content}\n\n`;
        if (charCount + noteContext.length > maxChars) break;
        context += noteContext;
        charCount += noteContext.length;
    }

    return context;
}

// ==========================================
// Flashcards with Spaced Repetition (SM-2)
// ==========================================

export function createFlashcard(
    front: string,
    back: string,
    sourceNoteId?: number
): Flashcard {
    const card: Flashcard = {
        id: nextIds.flashcard++,
        front,
        back,
        sourceNoteId,
        easeFactor: 2.5,
        intervalDays: 1,
        nextReview: new Date().toISOString().split('T')[0],
        reviewCount: 0,
        createdAt: new Date().toISOString(),
    };
    flashcards.push(card);
    saveToDisk();
    return card;
}

export function reviewFlashcard(id: number, quality: number): Flashcard | null {
    // quality: 0-5 (0-2 = fail, 3 = hard, 4 = good, 5 = easy)
    const idx = flashcards.findIndex(f => f.id === id);
    if (idx === -1) return null;

    const card = flashcards[idx];
    card.reviewCount++;

    if (quality < 3) {
        // Failed - reset
        card.intervalDays = 1;
        card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
    } else {
        // Success - apply SM-2 algorithm
        if (card.reviewCount === 1) {
            card.intervalDays = 1;
        } else if (card.reviewCount === 2) {
            card.intervalDays = 6;
        } else {
            card.intervalDays = Math.round(card.intervalDays * card.easeFactor);
        }

        card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        card.easeFactor = Math.max(1.3, card.easeFactor);
    }

    // Calculate next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + card.intervalDays);
    card.nextReview = nextDate.toISOString().split('T')[0];

    saveToDisk();
    return card;
}

export function getDueFlashcards(): Flashcard[] {
    const today = new Date().toISOString().split('T')[0];
    return flashcards.filter(f => f.nextReview <= today);
}

export function getAllFlashcards(): Flashcard[] {
    return [...flashcards];
}

export function getFlashcardsByNote(noteId: number): Flashcard[] {
    return flashcards.filter(f => f.sourceNoteId === noteId);
}

export function deleteFlashcard(id: number): boolean {
    const idx = flashcards.findIndex(f => f.id === id);
    if (idx === -1) return false;
    flashcards.splice(idx, 1);
    saveToDisk();
    return true;
}

// ==========================================
// AI-Powered Flashcard Generation
// ==========================================

export function extractKeyPoints(content: string): string[] {
    // Simple extraction of sentences that contain key patterns
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);

    const keyPatterns = [
        /\bis\b/i, /\bare\b/i, /\bmeans\b/i, /\bdefine[ds]?\b/i,
        /\bimportant\b/i, /\bkey\b/i, /\bessential\b/i, /\bcritical\b/i,
        /\bremember\b/i, /\bnote\b/i, /\bexample\b/i,
    ];

    return sentences
        .filter(s => keyPatterns.some(p => p.test(s)))
        .map(s => s.trim())
        .slice(0, 10);
}

export function generateFlashcardsFromNote(noteId: number): Flashcard[] {
    const note = notes.find(n => n.id === noteId);
    if (!note) return [];

    const keyPoints = extractKeyPoints(note.content);
    const newCards: Flashcard[] = [];

    keyPoints.forEach(point => {
        // Simple Q&A generation
        const words = point.split(/\s+/);
        if (words.length > 5) {
            // Create a fill-in-the-blank style card
            const midPoint = Math.floor(words.length / 2);
            const keyWord = words[midPoint];

            const front = words.map((w, i) => i === midPoint ? '______' : w).join(' ') + '?';
            const back = keyWord;

            newCards.push(createFlashcard(front, back, noteId));
        }
    });

    return newCards;
}

// ==========================================
// Persistence (Persistence via window.wakey)
// ==========================================

function updateNextIds() {
    // Ensure IDs don't collide
    const maxNoteId = Math.max(0, ...notes.map(n => n.id));
    const maxNodeId = Math.max(0, ...knowledgeNodes.map(n => n.id));
    const maxEdgeId = Math.max(0, ...knowledgeEdges.map(e => e.id));
    const maxFlashcardId = Math.max(0, ...flashcards.map(f => f.id));

    nextIds = {
        note: maxNoteId + 1,
        node: maxNodeId + 1,
        edge: maxEdgeId + 1,
        flashcard: maxFlashcardId + 1
    };
}

export async function saveToDisk() {
    if (typeof window !== 'undefined' && window.wakey) {
        await window.wakey.saveNotes(notes);
        await window.wakey.saveKnowledgeGraph({ nodes: knowledgeNodes, edges: knowledgeEdges });
        await window.wakey.saveFlashcards(flashcards);
    }
}

export async function loadFromDisk() {
    if (typeof window !== 'undefined' && window.wakey) {
        const savedNotes = await window.wakey.getNotes();
        const savedGraph = await window.wakey.getKnowledgeGraph();
        const savedFlashcards = await window.wakey.getFlashcards();

        if (savedNotes) notes = savedNotes;
        if (savedGraph) {
            knowledgeNodes = savedGraph.nodes || [];
            knowledgeEdges = savedGraph.edges || [];
        }
        if (savedFlashcards) flashcards = savedFlashcards;

        updateNextIds();
    }
}

// Initial load
if (typeof window !== 'undefined') {
    loadFromDisk();
}

export function exportKnowledgeData(): {
    notes: Note[];
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
    flashcards: Flashcard[];
    nextIds: typeof nextIds;
} {
    return {
        notes: [...notes],
        nodes: [...knowledgeNodes],
        edges: [...knowledgeEdges],
        flashcards: [...flashcards],
        nextIds: { ...nextIds },
    };
}

export function importKnowledgeData(data: ReturnType<typeof exportKnowledgeData>): void {
    notes = data.notes || [];
    knowledgeNodes = data.nodes || [];
    knowledgeEdges = data.edges || [];
    flashcards = data.flashcards || [];
    nextIds = data.nextIds || { note: 1, node: 1, edge: 1, flashcard: 1 };
    saveToDisk();
}

// ==========================================
// Knowledge Statistics
// ==========================================

export function getKnowledgeStats(): {
    totalNotes: number;
    totalNodes: number;
    totalEdges: number;
    totalFlashcards: number;
    dueFlashcards: number;
    recentNotes: Note[];
} {
    return {
        totalNotes: notes.length,
        totalNodes: knowledgeNodes.length,
        totalEdges: knowledgeEdges.length,
        totalFlashcards: flashcards.length,
        dueFlashcards: getDueFlashcards().length,
        recentNotes: getAllNotes().slice(0, 5),
    };
}
