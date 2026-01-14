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
declare let nextIds: {
    note: number;
    node: number;
    edge: number;
    flashcard: number;
};
export declare function createNote(title: string, content: string, tags?: string[]): Note;
export declare function updateNote(id: number, updates: Partial<Pick<Note, 'title' | 'content' | 'tags'>>): Note | null;
export declare function deleteNote(id: number): boolean;
export declare function getNote(id: number): Note | null;
export declare function getAllNotes(): Note[];
export declare function searchNotes(query: string): Note[];
export declare function getNotesByTag(tag: string): Note[];
export declare function getAllTags(): string[];
export declare function createKnowledgeNode(title: string, type: KnowledgeNode['type'], content?: string, metadata?: Record<string, unknown>): KnowledgeNode;
export declare function createKnowledgeEdge(sourceId: number, targetId: number, relationship: string, weight?: number): KnowledgeEdge | null;
export declare function getKnowledgeGraph(): {
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
};
export declare function getConnectedNodes(nodeId: number): KnowledgeNode[];
export declare function findNodesByType(type: KnowledgeNode['type']): KnowledgeNode[];
export declare function searchKnowledgeNodes(query: string): KnowledgeNode[];
export declare function updateNoteEmbedding(noteId: number): void;
export declare function updateAllEmbeddings(): void;
export declare function findSimilarNotes(query: string, topK?: number): {
    note: Note;
    similarity: number;
}[];
export declare function getContextForQuery(query: string, maxChars?: number): string;
export declare function createFlashcard(front: string, back: string, sourceNoteId?: number): Flashcard;
export declare function reviewFlashcard(id: number, quality: number): Flashcard | null;
export declare function getDueFlashcards(): Flashcard[];
export declare function getAllFlashcards(): Flashcard[];
export declare function getFlashcardsByNote(noteId: number): Flashcard[];
export declare function deleteFlashcard(id: number): boolean;
export declare function extractKeyPoints(content: string): string[];
export declare function generateFlashcardsFromNote(noteId: number): Flashcard[];
export declare function saveToDisk(): Promise<void>;
export declare function loadFromDisk(): Promise<void>;
export declare function exportKnowledgeData(): {
    notes: Note[];
    nodes: KnowledgeNode[];
    edges: KnowledgeEdge[];
    flashcards: Flashcard[];
    nextIds: typeof nextIds;
};
export declare function importKnowledgeData(data: ReturnType<typeof exportKnowledgeData>): void;
export declare function getKnowledgeStats(): {
    totalNotes: number;
    totalNodes: number;
    totalEdges: number;
    totalFlashcards: number;
    dueFlashcards: number;
    recentNotes: Note[];
};
export {};
//# sourceMappingURL=knowledge-service.d.ts.map