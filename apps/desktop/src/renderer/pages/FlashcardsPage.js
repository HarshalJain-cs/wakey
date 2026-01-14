import { useState, useEffect } from 'react';
import { GraduationCap, Plus, Check, X, Sparkles, BookOpen, Clock, Award } from 'lucide-react';
import { createFlashcard, reviewFlashcard, getDueFlashcards, getAllFlashcards, deleteFlashcard, getAllNotes, generateFlashcardsFromNote, } from '../services/knowledge-service';
export default function FlashcardsPage() {
    const [cards, setCards] = useState([]);
    const [dueCards, setDueCards] = useState([]);
    const [isReviewing, setIsReviewing] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [newCard, setNewCard] = useState({ front: '', back: '' });
    const [notes, setNotes] = useState([]);
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
    useEffect(() => {
        refreshData();
    }, []);
    const refreshData = () => {
        setCards(getAllFlashcards());
        setDueCards(getDueFlashcards());
        setNotes(getAllNotes());
    };
    const startReview = () => {
        const due = getDueFlashcards();
        if (due.length === 0)
            return;
        setDueCards(due);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionStats({ reviewed: 0, correct: 0 });
        setIsReviewing(true);
    };
    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };
    const handleAnswer = (quality) => {
        const card = dueCards[currentIndex];
        reviewFlashcard(card.id, quality);
        setSessionStats(prev => ({
            reviewed: prev.reviewed + 1,
            correct: quality >= 3 ? prev.correct + 1 : prev.correct,
        }));
        if (currentIndex < dueCards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        }
        else {
            setIsReviewing(false);
            refreshData();
        }
    };
    const handleCreate = () => {
        if (!newCard.front.trim() || !newCard.back.trim())
            return;
        createFlashcard(newCard.front, newCard.back);
        setNewCard({ front: '', back: '' });
        setShowCreateModal(false);
        refreshData();
    };
    const handleGenerateFromNote = () => {
        if (!selectedNoteId)
            return;
        generateFlashcardsFromNote(selectedNoteId);
        setShowGenerateModal(false);
        setSelectedNoteId(null);
        refreshData();
    };
    const handleDelete = (id) => {
        if (confirm('Delete this flashcard?')) {
            deleteFlashcard(id);
            refreshData();
        }
    };
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };
    const currentCard = dueCards[currentIndex];
    // Review mode
    if (isReviewing && currentCard) {
        return (<div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center">
                {/* Progress */}
                <div className="w-full max-w-xl mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">
                            Card {currentIndex + 1} of {dueCards.length}
                        </span>
                        <span className="text-gray-400 text-sm">
                            {sessionStats.correct}/{sessionStats.reviewed} correct
                        </span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all" style={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }}/>
                    </div>
                </div>

                {/* Card */}
                <div onClick={handleFlip} className="w-full max-w-xl aspect-[3/2] perspective-1000 cursor-pointer mb-8">
                    <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
            }}>
                        {/* Front */}
                        <div className="absolute inset-0 bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-8 flex items-center justify-center border border-dark-600 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                            <p className="text-2xl text-white text-center">{currentCard.front}</p>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/30 to-dark-900 rounded-2xl p-8 flex items-center justify-center border border-teal-500/30 backface-hidden" style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
            }}>
                            <p className="text-2xl text-teal-100 text-center">{currentCard.back}</p>
                        </div>
                    </div>
                </div>

                {/* Instructions or Rating */}
                {!isFlipped ? (<div className="text-center">
                        <p className="text-gray-500 mb-4">Click the card to reveal the answer</p>
                        <button onClick={handleFlip} className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors">
                            Show Answer
                        </button>
                    </div>) : (<div className="text-center">
                        <p className="text-gray-500 mb-4">How well did you know this?</p>
                        <div className="flex gap-3">
                            <button onClick={() => handleAnswer(1)} className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2">
                                <X className="w-5 h-5"/>
                                Again
                            </button>
                            <button onClick={() => handleAnswer(3)} className="px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors">
                                Hard
                            </button>
                            <button onClick={() => handleAnswer(4)} className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center gap-2">
                                <Check className="w-5 h-5"/>
                                Good
                            </button>
                            <button onClick={() => handleAnswer(5)} className="px-6 py-3 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg transition-colors">
                                Easy
                            </button>
                        </div>
                    </div>)}

                {/* Exit button */}
                <button onClick={() => {
                setIsReviewing(false);
                refreshData();
            }} className="mt-8 text-gray-500 hover:text-white transition-colors">
                    Exit Review
                </button>
            </div>);
    }
    // Session complete screen
    if (sessionStats.reviewed > 0 && !isReviewing) {
        return (<div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center">
                <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700 text-center max-w-md">
                    <Award className="w-16 h-16 text-teal-400 mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
                    <p className="text-gray-400 mb-6">
                        You reviewed {sessionStats.reviewed} cards with {Math.round((sessionStats.correct / sessionStats.reviewed) * 100)}% accuracy
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => {
                setSessionStats({ reviewed: 0, correct: 0 });
                refreshData();
            }} className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors">
                            Back to Deck
                        </button>
                        {dueCards.length > 0 && (<button onClick={startReview} className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors">
                                Continue Reviewing
                            </button>)}
                    </div>
                </div>
            </div>);
    }
    // Main view
    return (<div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-teal-400"/>
                        Flashcards
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Learn and review with spaced repetition
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowGenerateModal(true)} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors flex items-center gap-2">
                        <Sparkles className="w-4 h-4"/>
                        Generate from Notes
                    </button>
                    <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4"/>
                        New Card
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-teal-500/20 rounded-lg">
                            <BookOpen className="w-5 h-5 text-teal-400"/>
                        </div>
                        <span className="text-gray-400">Total Cards</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{cards.length}</p>
                </div>
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-400"/>
                        </div>
                        <span className="text-gray-400">Due Today</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{dueCards.length}</p>
                </div>
                <div className="bg-gradient-to-br from-teal-500/20 to-dark-800 rounded-xl p-6 border border-teal-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 mb-1">Ready to review?</p>
                            <p className="text-white font-semibold">
                                {dueCards.length > 0
            ? `${dueCards.length} cards waiting`
            : 'All caught up!'}
                            </p>
                        </div>
                        <button onClick={startReview} disabled={dueCards.length === 0} className="px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-dark-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors">
                            Start Review
                        </button>
                    </div>
                </div>
            </div>

            {/* Card List */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <h2 className="text-lg font-semibold text-white mb-4">All Flashcards</h2>
                {cards.length === 0 ? (<div className="text-center py-12">
                        <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4"/>
                        <p className="text-gray-500 mb-2">No flashcards yet</p>
                        <p className="text-gray-600 text-sm">Create your first flashcard or generate from notes</p>
                    </div>) : (<div className="grid grid-cols-2 gap-4">
                        {cards.map(card => (<div key={card.id} className="bg-dark-900 rounded-lg p-4 border border-dark-600">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <p className="text-white font-medium line-clamp-2">{card.front}</p>
                                        <p className="text-gray-500 text-sm mt-1 line-clamp-1">{card.back}</p>
                                    </div>
                                    <button onClick={() => handleDelete(card.id)} className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                                        <X className="w-4 h-4"/>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">
                                        Next: {formatDate(card.nextReview)}
                                    </span>
                                    <span className={`px-2 py-1 rounded ${card.intervalDays <= 1 ? 'bg-red-500/20 text-red-400' :
                    card.intervalDays <= 7 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'}`}>
                                        {card.intervalDays}d interval
                                    </span>
                                </div>
                            </div>))}
                    </div>)}
            </div>

            {/* Create Modal */}
            {showCreateModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-dark-800 rounded-xl p-6 w-full max-w-lg border border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Create Flashcard</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-400 hover:text-white">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Front (Question)</label>
                                <textarea value={newCard.front} onChange={(e) => setNewCard({ ...newCard, front: e.target.value })} rows={3} className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 resize-none" placeholder="What is the question?"/>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Back (Answer)</label>
                                <textarea value={newCard.back} onChange={(e) => setNewCard({ ...newCard, back: e.target.value })} rows={3} className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 resize-none" placeholder="What is the answer?"/>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button onClick={handleCreate} disabled={!newCard.front.trim() || !newCard.back.trim()} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-dark-600 text-white rounded-lg">
                                Create Card
                            </button>
                        </div>
                    </div>
                </div>)}

            {/* Generate Modal */}
            {showGenerateModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-dark-800 rounded-xl p-6 w-full max-w-lg border border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-teal-400"/>
                                Generate Flashcards
                            </h2>
                            <button onClick={() => setShowGenerateModal(false)} className="p-2 text-gray-400 hover:text-white">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        <p className="text-gray-400 mb-4">
                            Select a note to automatically generate flashcards from its content.
                        </p>
                        {notes.length === 0 ? (<p className="text-gray-500 text-center py-8">
                                No notes available. Create notes first in the Knowledge Base.
                            </p>) : (<div className="space-y-2 max-h-64 overflow-y-auto">
                                {notes.map(note => (<div key={note.id} onClick={() => setSelectedNoteId(note.id)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedNoteId === note.id
                        ? 'bg-teal-500/20 border border-teal-500'
                        : 'bg-dark-900 border border-dark-600 hover:border-dark-500'}`}>
                                        <p className="text-white font-medium">{note.title}</p>
                                        <p className="text-gray-500 text-sm line-clamp-1">{note.content}</p>
                                    </div>))}
                            </div>)}
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowGenerateModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                Cancel
                            </button>
                            <button onClick={handleGenerateFromNote} disabled={!selectedNoteId} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-dark-600 text-white rounded-lg flex items-center gap-2">
                                <Sparkles className="w-4 h-4"/>
                                Generate
                            </button>
                        </div>
                    </div>
                </div>)}
        </div>);
}
//# sourceMappingURL=FlashcardsPage.js.map