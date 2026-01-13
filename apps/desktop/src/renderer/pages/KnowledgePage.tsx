import { useState, useEffect } from 'react';
import {
    BookOpen, Plus, Search, Tag, Trash2, Edit, Save, X,
    Network, FileText, Link2, RefreshCw, ChevronRight
} from 'lucide-react';
import {
    createNote,
    updateNote,
    deleteNote,
    getAllNotes,
    searchNotes,
    getAllTags,
    getKnowledgeGraph,
    getKnowledgeStats,
    getConnectedNodes,
    Note,
    KnowledgeNode,
} from '../services/knowledge-service';

export default function KnowledgePage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
    const [editNote, setEditNote] = useState({ title: '', content: '', tags: '' });
    const [view, setView] = useState<'notes' | 'graph'>('notes');
    const [stats, setStats] = useState<ReturnType<typeof getKnowledgeStats> | null>(null);
    const [graphData, setGraphData] = useState<{ nodes: KnowledgeNode[]; edges: any[] }>({ nodes: [], edges: [] });
    const [selectedGraphNode, setSelectedGraphNode] = useState<KnowledgeNode | null>(null);

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        setNotes(getAllNotes());
        setAllTags(getAllTags());
        setStats(getKnowledgeStats());
        setGraphData(getKnowledgeGraph());
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            setNotes(searchNotes(query));
        } else {
            setNotes(getAllNotes());
        }
    };

    const handleTagFilter = (tag: string | null) => {
        setSelectedTag(tag);
        if (tag) {
            setNotes(getAllNotes().filter(n => n.tags.includes(tag)));
        } else {
            setNotes(getAllNotes());
        }
    };

    const handleCreate = () => {
        if (!newNote.title.trim()) return;

        const tags = newNote.tags.split(',').map(t => t.trim()).filter(t => t);
        createNote(newNote.title, newNote.content, tags);
        setNewNote({ title: '', content: '', tags: '' });
        setShowCreateModal(false);
        refreshData();
    };

    const handleUpdate = () => {
        if (!selectedNote || !editNote.title.trim()) return;

        const tags = editNote.tags.split(',').map(t => t.trim()).filter(t => t);
        updateNote(selectedNote.id, {
            title: editNote.title,
            content: editNote.content,
            tags,
        });
        setIsEditing(false);
        refreshData();

        // Update selected note
        const updated = getAllNotes().find(n => n.id === selectedNote.id);
        if (updated) setSelectedNote(updated);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this note?')) {
            deleteNote(id);
            if (selectedNote?.id === id) {
                setSelectedNote(null);
            }
            refreshData();
        }
    };

    const startEditing = () => {
        if (selectedNote) {
            setEditNote({
                title: selectedNote.title,
                content: selectedNote.content,
                tags: selectedNote.tags.join(', '),
            });
            setIsEditing(true);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-teal-400" />
                        Knowledge Base
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Organize notes, build knowledge graphs, and connect ideas
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-dark-800 rounded-lg p-1">
                        <button
                            onClick={() => setView('notes')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'notes'
                                    ? 'bg-teal-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <FileText className="w-4 h-4 inline mr-2" />
                            Notes
                        </button>
                        <button
                            onClick={() => setView('graph')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'graph'
                                    ? 'bg-teal-500 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Network className="w-4 h-4 inline mr-2" />
                            Graph
                        </button>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Note
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                        <p className="text-gray-400 text-sm">Total Notes</p>
                        <p className="text-2xl font-bold text-white">{stats.totalNotes}</p>
                    </div>
                    <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                        <p className="text-gray-400 text-sm">Knowledge Nodes</p>
                        <p className="text-2xl font-bold text-white">{stats.totalNodes}</p>
                    </div>
                    <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                        <p className="text-gray-400 text-sm">Connections</p>
                        <p className="text-2xl font-bold text-white">{stats.totalEdges}</p>
                    </div>
                    <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
                        <p className="text-gray-400 text-sm">Flashcards</p>
                        <p className="text-2xl font-bold text-white">{stats.totalFlashcards}</p>
                        {stats.dueFlashcards > 0 && (
                            <p className="text-xs text-teal-400">{stats.dueFlashcards} due for review</p>
                        )}
                    </div>
                </div>
            )}

            {view === 'notes' ? (
                <div className="flex gap-6">
                    {/* Notes List */}
                    <div className="w-80 space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search notes..."
                                className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                            />
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleTagFilter(null)}
                                className={`px-3 py-1 rounded-full text-sm ${!selectedTag
                                        ? 'bg-teal-500 text-white'
                                        : 'bg-dark-700 text-gray-400 hover:text-white'
                                    }`}
                            >
                                All
                            </button>
                            {allTags.slice(0, 5).map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagFilter(tag)}
                                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${selectedTag === tag
                                            ? 'bg-teal-500 text-white'
                                            : 'bg-dark-700 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {/* Notes */}
                        <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                            {notes.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No notes found</p>
                                    <p className="text-sm">Create your first note to get started</p>
                                </div>
                            ) : (
                                notes.map(note => (
                                    <div
                                        key={note.id}
                                        onClick={() => {
                                            setSelectedNote(note);
                                            setIsEditing(false);
                                        }}
                                        className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedNote?.id === note.id
                                                ? 'bg-teal-500/20 border border-teal-500/50'
                                                : 'bg-dark-800 border border-dark-700 hover:border-dark-600'
                                            }`}
                                    >
                                        <h3 className="text-white font-medium truncate">{note.title}</h3>
                                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                            {note.content || 'No content'}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex gap-1">
                                                {note.tags.slice(0, 2).map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 bg-dark-700 rounded text-xs text-gray-400"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(note.updatedAt)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Note Detail */}
                    <div className="flex-1 bg-dark-800 rounded-xl border border-dark-700">
                        {selectedNote ? (
                            isEditing ? (
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-white">Edit Note</h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="p-2 text-gray-400 hover:text-white"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={handleUpdate}
                                                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg flex items-center gap-2"
                                            >
                                                <Save className="w-4 h-4" />
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={editNote.title}
                                        onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                                        className="w-full px-4 py-2 mb-4 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                        placeholder="Title"
                                    />
                                    <textarea
                                        value={editNote.content}
                                        onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                                        rows={15}
                                        className="w-full px-4 py-3 mb-4 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 resize-none"
                                        placeholder="Write your note..."
                                    />
                                    <input
                                        type="text"
                                        value={editNote.tags}
                                        onChange={(e) => setEditNote({ ...editNote, tags: e.target.value })}
                                        className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                        placeholder="Tags (comma-separated)"
                                    />
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-white">{selectedNote.title}</h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={startEditing}
                                                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-700"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(selectedNote.id)}
                                                className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-dark-700"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-4">
                                        {selectedNote.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-gray-300 whitespace-pre-wrap">
                                            {selectedNote.content || 'No content'}
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-dark-700 text-sm text-gray-500">
                                        <p>Created: {formatDate(selectedNote.createdAt)}</p>
                                        <p>Updated: {formatDate(selectedNote.updatedAt)}</p>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <div className="text-center">
                                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                    <p>Select a note to view</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Knowledge Graph View */
                <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Network className="w-5 h-5 text-teal-400" />
                            Knowledge Graph
                        </h2>
                        <button
                            onClick={refreshData}
                            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-dark-700"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>

                    {graphData.nodes.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <Network className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p>No knowledge nodes yet</p>
                            <p className="text-sm">Create notes to build your knowledge graph</p>
                        </div>
                    ) : (
                        <div className="flex gap-6">
                            {/* Simple node list visualization */}
                            <div className="flex-1 grid grid-cols-3 gap-4">
                                {graphData.nodes.map(node => (
                                    <div
                                        key={node.id}
                                        onClick={() => setSelectedGraphNode(node)}
                                        className={`p-4 rounded-lg cursor-pointer transition-all ${selectedGraphNode?.id === node.id
                                                ? 'bg-teal-500/20 border border-teal-500'
                                                : 'bg-dark-900 border border-dark-600 hover:border-teal-500/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`w-2 h-2 rounded-full ${node.type === 'note' ? 'bg-teal-400' :
                                                    node.type === 'concept' ? 'bg-purple-400' :
                                                        node.type === 'entity' ? 'bg-blue-400' :
                                                            'bg-gray-400'
                                                }`} />
                                            <span className="text-xs text-gray-500 capitalize">{node.type}</span>
                                        </div>
                                        <h4 className="text-white font-medium truncate">{node.title}</h4>
                                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                            {node.content || 'No description'}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Node details panel */}
                            {selectedGraphNode && (
                                <div className="w-80 bg-dark-900 rounded-lg p-4 border border-dark-600">
                                    <h3 className="text-white font-semibold mb-2">{selectedGraphNode.title}</h3>
                                    <span className="inline-block px-2 py-1 bg-dark-700 rounded text-xs text-gray-400 capitalize mb-3">
                                        {selectedGraphNode.type}
                                    </span>
                                    <p className="text-gray-400 text-sm mb-4">{selectedGraphNode.content}</p>

                                    <h4 className="text-gray-500 text-sm font-medium mb-2">Connected Nodes</h4>
                                    <div className="space-y-2">
                                        {getConnectedNodes(selectedGraphNode.id).map(connected => (
                                            <div
                                                key={connected.id}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <Link2 className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-300">{connected.title}</span>
                                            </div>
                                        ))}
                                        {getConnectedNodes(selectedGraphNode.id).length === 0 && (
                                            <p className="text-gray-600 text-sm">No connections yet</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-dark-800 rounded-xl p-6 w-full max-w-lg border border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Create New Note</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            className="w-full px-4 py-2 mb-4 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                            placeholder="Note title"
                        />
                        <textarea
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            rows={6}
                            className="w-full px-4 py-3 mb-4 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 resize-none"
                            placeholder="Write your note..."
                        />
                        <input
                            type="text"
                            value={newNote.tags}
                            onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                            className="w-full px-4 py-2 mb-4 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                            placeholder="Tags (comma-separated)"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newNote.title.trim()}
                                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-dark-600 text-white rounded-lg"
                            >
                                Create Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
