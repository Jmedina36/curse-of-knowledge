import React from 'react';
import { X, Check } from 'lucide-react';
import { COLORS, GAME_CONSTANTS } from '../constants';

const FlashcardModals = ({
  // Deck modal
  showDeckModal,
  setShowDeckModal,
  newDeck,
  setNewDeck,
  flashcardDecks,
  setFlashcardDecks,
  // Card modal
  showCardModal,
  setShowCardModal,
  selectedDeck,
  setSelectedDeck,
  newCard,
  setNewCard,
  // Study modal
  showStudyModal,
  setShowStudyModal,
  currentCardIndex,
  setCurrentCardIndex,
  studyQueue,
  setStudyQueue,
  isFlipped,
  setIsFlipped,
  // Quiz modal
  showQuizModal,
  setShowQuizModal,
  quizQuestions,
  setQuizQuestions,
  currentQuizIndex,
  setCurrentQuizIndex,
  quizScore,
  setQuizScore,
  selectedAnswer,
  setSelectedAnswer,
  showQuizResults,
  setShowQuizResults,
  wrongCardIndices,
  setWrongCardIndices,
  isRetakeQuiz,
  setIsRetakeQuiz,
  mistakesReviewed,
  setMistakesReviewed,
  reviewingMistakes,
  setReviewingMistakes,
  // Match modal
  showMatchModal,
  setShowMatchModal,
  matchCards,
  setMatchCards,
  selectedMatchCards,
  setSelectedMatchCards,
  matchedPairs,
  setMatchedPairs,
  matchStartTime,
  matchGlowCards,
  setMatchGlowCards,
  // Shared callbacks
  generateQuiz,
  addLog,
  updateAchievementStat,
  gold,
  setGold,
  xp,
  setXp,
  setHealthPots,
  setStaminaPots,
  newTask,
  setNewTask,
  addTask,
  showModal,
  setShowModal,
}) => {
  return (
    <>
{showDeckModal && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowDeckModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2 relative my-8" style={{
      background: 'linear-gradient(to bottom, rgba(15, 35, 45, 0.98), rgba(10, 25, 35, 0.98), rgba(8, 18, 25, 0.98))',
      borderColor: COLORS.gold,
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'
    }} onClick={e => e.stopPropagation()}>
      <div className="mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>CREATE DECK</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"Forge knowledge in the fires of determination..."</p>
        </div>
      </div>
      
      <input 
        type="text" 
        placeholder="Deck name (e.g., Spanish Vocabulary)" 
        value={newDeck.name} 
        onChange={e => setNewDeck({name: e.target.value})} 
        spellCheck="true"
        autoCorrect="on"
        autoCapitalize="words"
        className="w-full p-3 rounded-lg mb-4 border focus:outline-none" 
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          color: '#F5F5DC',
          borderColor: 'rgba(139, 26, 40, 0.4)',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
        }}
        onFocus={(e) => e.target.style.borderColor = 'rgba(139, 26, 40, 0.8)'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(139, 26, 40, 0.4)'}
        autoFocus 
      />
      
      <div className="flex gap-2">
        <button 
          onClick={() => {
            if (newDeck.name.trim()) {
              setFlashcardDecks(prev => [...prev, { name: newDeck.name, cards: [] }]);
              addLog(`Created deck: ${newDeck.name}`);
              updateAchievementStat('decks_created');
              setNewDeck({name: ''});
              setShowDeckModal(false);
            }
          }}
          disabled={!newDeck.name.trim()} 
          className="flex-1 py-2 rounded-lg transition-all border-2" 
          style={{
            backgroundColor: !newDeck.name.trim() ? 'rgba(44, 62, 80, 0.5)' : 'rgba(139, 26, 40, 0.8)',
            borderColor: !newDeck.name.trim() ? 'rgba(149, 165, 166, 0.3)' : 'rgba(184, 134, 11, 0.7)',
            color: '#F5F5DC',
            cursor: !newDeck.name.trim() ? 'not-allowed' : 'pointer',
            opacity: !newDeck.name.trim() ? 0.5 : 1
          }} 
          onMouseEnter={(e) => {if (newDeck.name.trim()) e.currentTarget.style.backgroundColor = 'rgba(155, 27, 48, 0.9)'}} 
          onMouseLeave={(e) => {if (newDeck.name.trim()) e.currentTarget.style.backgroundColor = 'rgba(139, 26, 40, 0.8)'}}
        >
          Create Deck
        </button>
        <button 
          onClick={() => { setShowDeckModal(false); setNewDeck({name: ''}); }} 
          className="flex-1 py-2 rounded-lg transition-all border-2" 
          style={{
            backgroundColor: COLORS.slate.base,
            borderColor: COLORS.slate.border,
            color: '#F5F5DC'
          }} 
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.hover} 
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.base}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showCardModal && selectedDeck !== null && flashcardDecks[selectedDeck] && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowCardModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2 relative my-8" style={{
      background: 'linear-gradient(to bottom, rgba(15, 35, 45, 0.98), rgba(10, 25, 35, 0.98), rgba(8, 18, 25, 0.98))',
      borderColor: COLORS.gold,
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'
    }} onClick={e => e.stopPropagation()}>
      <div className="mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>ADD CARD</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"{flashcardDecks[selectedDeck].name}"</p>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm mb-2" style={{color: COLORS.silver}}>Front (Question)</label>
        <textarea 
          placeholder="e.g., What is the capital of France?" 
          value={newCard.front} 
          onChange={e => setNewCard({...newCard, front: e.target.value})} 
          className="w-full p-3 rounded-lg border focus:outline-none resize-none" 
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#F5F5DC',
            borderColor: 'rgba(139, 26, 40, 0.4)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'rgba(139, 26, 40, 0.8)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(139, 26, 40, 0.4)'}
          rows="3"
          autoFocus 
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm mb-2" style={{color: COLORS.silver}}>Back (Answer)</label>
        <textarea 
          placeholder="e.g., Paris" 
          value={newCard.back} 
          onChange={e => setNewCard({...newCard, back: e.target.value})} 
          className="w-full p-3 rounded-lg border focus:outline-none resize-none" 
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#F5F5DC',
            borderColor: 'rgba(139, 26, 40, 0.4)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'rgba(139, 26, 40, 0.8)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(139, 26, 40, 0.4)'}
          rows="3"
        />
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => {
            if (newCard.front.trim() && newCard.back.trim()) {
              setFlashcardDecks(prev => prev.map((deck, idx) => 
                idx === selectedDeck 
                  ? {...deck, cards: [...deck.cards, {...newCard, mastered: false}]}
                  : deck
              ));
              addLog(`Added card to ${flashcardDecks[selectedDeck].name}`);
              updateAchievementStat('cards_created');
              setNewCard({front: '', back: ''});
              setShowCardModal(false);
            }
          }}
          disabled={!newCard.front.trim() || !newCard.back.trim()} 
          className="flex-1 py-2 rounded-lg transition-all border-2"
          style={{
            backgroundColor: (!newCard.front.trim() || !newCard.back.trim()) ? 'rgba(44, 62, 80, 0.5)' : 'rgba(139, 26, 40, 0.8)',
            borderColor: (!newCard.front.trim() || !newCard.back.trim()) ? 'rgba(149, 165, 166, 0.3)' : 'rgba(184, 134, 11, 0.7)',
            color: '#F5F5DC',
            cursor: (!newCard.front.trim() || !newCard.back.trim()) ? 'not-allowed' : 'pointer',
            opacity: (!newCard.front.trim() || !newCard.back.trim()) ? 0.5 : 1
          }}
          onMouseEnter={(e) => {if (newCard.front.trim() && newCard.back.trim()) e.currentTarget.style.backgroundColor = 'rgba(155, 27, 48, 0.9)'}}
          onMouseLeave={(e) => {if (newCard.front.trim() && newCard.back.trim()) e.currentTarget.style.backgroundColor = 'rgba(139, 26, 40, 0.8)'}}
        >
          Add Card
        </button>
        <button 
          onClick={() => { setShowCardModal(false); setNewCard({front: '', back: ''}); }} 
          className="flex-1 py-2 rounded-lg transition-all border-2"
          style={{
            backgroundColor: COLORS.slate.base,
            borderColor: COLORS.slate.border,
            color: '#F5F5DC'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.base}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showStudyModal && selectedDeck !== null && flashcardDecks[selectedDeck] && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto">
    <div className="rounded-xl p-8 max-w-2xl w-full border-2 relative my-8" style={{
      background: 'linear-gradient(to bottom, rgba(15, 35, 45, 0.98), rgba(10, 25, 35, 0.98), rgba(8, 18, 25, 0.98))',
      borderColor: COLORS.gold,
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'
    }}>
      <div className="mb-6 relative">
        <button 
          onClick={() => {
            if (reviewingMistakes) {
              setShowStudyModal(false);
              setReviewingMistakes(false);
              setStudyQueue([]);
              setIsFlipped(false);
              setShowQuizModal(true);
              setShowQuizResults(true);
            } else {
              setShowStudyModal(false);
              setSelectedDeck(null);
              setCurrentCardIndex(0);
              setStudyQueue([]);
              setIsFlipped(false);
            }
          }}
          className="absolute -top-2 -right-2 p-2 rounded-lg border-2 transition-all"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(212, 175, 55, 0.4)',
            color: '#D4AF37'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.borderColor = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }}
        >
          <X size={20}/>
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em', fontFamily: 'Cinzel, serif'}}>{flashcardDecks[selectedDeck].name}</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{width: '150px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '150px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"Each card brings you closer to mastery..."</p>
        </div>
      </div>
      
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="rounded-xl p-12 mb-6 min-h-[300px] flex items-center justify-center cursor-pointer transition-all border-2"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderColor: 'rgba(139, 0, 0, 0.6)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(40, 0, 0, 0.5)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'}
      >
        <div className="text-center">
          <p className="text-sm mb-4" style={{color: COLORS.silver}}>{isFlipped ? 'ANSWER' : 'QUESTION'}</p>
          <p className="text-2xl whitespace-pre-wrap" style={{color: '#F5F5DC'}}>
            {isFlipped 
              ? flashcardDecks[selectedDeck].cards[studyQueue[0]].back 
              : flashcardDecks[selectedDeck].cards[studyQueue[0]].front}
          </p>
          <p className="text-sm mt-6 italic" style={{color: COLORS.silver}}>Click to flip</p>
        </div>
      </div>
      
      <div className="rounded-full h-2 mb-6" style={{background: 'rgba(0, 0, 0, 0.4)'}}>
        <div 
          className="h-2 rounded-full transition-all" 
          style={{
            width: `${((flashcardDecks[selectedDeck].cards.length - studyQueue.length) / flashcardDecks[selectedDeck].cards.length) * 100}%`,
            background: 'linear-gradient(to right, #8B0000, #DC143C)'
          }}
        />
      </div>
      
      {isFlipped && (
        <div className="flex gap-4">
          <button
            onClick={() => {
              const currentCard = studyQueue[0];
              const newQueue = [...studyQueue.slice(1), currentCard];
              setStudyQueue(newQueue);
              setIsFlipped(false);
            }}
            className="flex-1 py-4 rounded-lg font-bold text-lg transition-all border-2"
            style={{
              backgroundColor: COLORS.burgundy.base,
              borderColor: COLORS.burgundy.border,
              color: '#F5F5DC'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.burgundy.hover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.burgundy.base}
          >
            Review Again
          </button>
          
          <button
            onClick={() => {
              const currentCard = studyQueue[0];
              setFlashcardDecks(prev => prev.map((deck, idx) => 
                idx === selectedDeck 
                  ? {...deck, cards: deck.cards.map((card, cardIdx) => 
                      cardIdx === currentCard ? {...card, mastered: true} : card
                    )}
                  : deck
              ));
              
              updateAchievementStat('cards_mastered');
              setXp(x => x + 5);
              
              const newQueue = studyQueue.slice(1);
              
              if (newQueue.length === 0) {
                const cardsStudied = flashcardDecks[selectedDeck].cards.length;
                const xpGain = 25;
                setXp(x => x + xpGain);
                addLog(`Completed deck! +${xpGain} bonus XP`);
                
                const roll = Math.random();
                if (roll < 0.3) {
                  setHealthPots(h => h + 1);
                  addLog('Found Health Potion!');
                } else if (roll < 0.5) {
                  setStaminaPots(s => s + 1);
                  addLog('Found Stamina Potion!');
                }
                
                if (reviewingMistakes) {
                  setMistakesReviewed(true);
                  setReviewingMistakes(false);
                  setShowStudyModal(false);
                  setShowQuizModal(true);
                  setShowQuizResults(true);
                  setIsFlipped(false);
                  addLog('Mistakes reviewed! Retake unlocked.');
                } else {
                  setShowStudyModal(false);
                  setSelectedDeck(null);
                  setCurrentCardIndex(0);
                  setStudyQueue([]);
                  setIsFlipped(false);
                }
              } else {
                setStudyQueue(newQueue);
                setIsFlipped(false);
              }
            }}
            className="flex-1 py-4 rounded-lg font-bold text-lg transition-all border-2"
            style={{
              backgroundColor: COLORS.crimson.base,
              borderColor: COLORS.crimson.border,
              color: '#F5F5DC'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.crimson.hover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.crimson.base}
          >
            Got It! (+5 XP)
          </button>
        </div>
      )}
      
      {/* Cards Remaining Stats at Bottom */}
      <div className="mt-6 text-center">
        <p className="text-xs" style={{color: '#95A5A6'}}>
          Cards Remaining: <span className="font-bold" style={{color: '#D4AF37'}}>{studyQueue.length}</span> | 
          Total Studied: <span className="font-bold" style={{color: '#68D391'}}>{flashcardDecks[selectedDeck].cards.length - studyQueue.length + 1}</span>
        </p>
      </div>
    </div>
  </div>
)}

{showQuizModal && selectedDeck !== null && flashcardDecks[selectedDeck] && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto">
    <div className="rounded-xl p-8 max-w-2xl w-full border-2 relative my-8" style={{
      background: 'linear-gradient(to bottom, rgba(15, 35, 45, 0.98), rgba(10, 25, 35, 0.98), rgba(8, 18, 25, 0.98))',
      borderColor: COLORS.gold,
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'
    }}>
      {!showQuizResults ? (
        <>
          <div className="mb-6 relative">
            <button 
              onClick={() => {
                setShowQuizModal(false);
                setSelectedDeck(null);
                setQuizQuestions([]);
                setCurrentQuizIndex(0);
                setQuizScore(0);
                setSelectedAnswer(null);
                setShowQuizResults(false);
                setWrongCardIndices([]);
                setIsRetakeQuiz(false);
                setMistakesReviewed(false);
                setReviewingMistakes(false);
              }}
              className="absolute -top-2 -right-2 p-2 rounded-lg border-2 transition-all"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderColor: 'rgba(212, 175, 55, 0.4)',
                color: '#D4AF37'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                e.currentTarget.style.borderColor = '#D4AF37';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
              }}
            >
              <X size={20}/>
            </button>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em', fontFamily: 'Cinzel, serif'}}>{flashcardDecks[selectedDeck].name}</h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div style={{width: '150px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
                <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
                <div style={{width: '150px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
              </div>
              <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"Test your knowledge in the crucible of trial..."</p>
            </div>
          </div>
          
          <div className="rounded-xl p-8 mb-6 min-h-[200px] border-2" style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderColor: 'rgba(139, 0, 0, 0.6)'
          }}>
            <p className="text-sm mb-4" style={{color: COLORS.silver}}>QUESTION</p>
            <p className="text-2xl mb-8" style={{color: '#F5F5DC'}}>{quizQuestions[currentQuizIndex]?.question}</p>
            
            <div className="space-y-3">
              {quizQuestions[currentQuizIndex]?.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(choice)}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === null
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-blue-400'
                      : selectedAnswer === choice
                        ? choice === quizQuestions[currentQuizIndex].correctAnswer
                          ? 'bg-green-600 border-green-400'
                          : 'bg-red-600 border-red-400'
                        : choice === quizQuestions[currentQuizIndex].correctAnswer
                          ? 'bg-green-600 border-green-400'
                          : 'bg-gray-700 border-gray-600'
                  } disabled:cursor-not-allowed`}
                >
                  <span className="font-bold mr-3">{String.fromCharCode(65 + idx)}.</span>
                  {choice}
                </button>
              ))}
            </div>
          </div>
          
          <div className="rounded-full h-2 mb-6" style={{background: 'rgba(0, 0, 0, 0.4)'}}>
            <div 
              className="h-2 rounded-full transition-all" 
              style={{
                width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`,
                background: 'linear-gradient(to right, #8B0000, #DC143C)'
              }}
            />
          </div>
          
          {/* Quiz Stats at Bottom */}
          <div className="mb-6 text-center">
            <p className="text-xs" style={{color: '#95A5A6'}}>
              Question: <span className="font-bold" style={{color: '#D4AF37'}}>{currentQuizIndex + 1}</span>/{quizQuestions.length} | 
              Score: <span className="font-bold" style={{color: '#68D391'}}>{quizScore}</span>/{quizQuestions.length}
            </p>
          </div>
          
          {selectedAnswer && (
            <button
              onClick={() => {
                let finalScore = quizScore;
                const isCorrect = selectedAnswer === quizQuestions[currentQuizIndex].correctAnswer;
                
                if (isCorrect) {
                  finalScore = quizScore + 1;
                  setQuizScore(finalScore);
                } else {
                  // Track wrong answer
                  setWrongCardIndices(prev => [...prev, quizQuestions[currentQuizIndex].cardIndex]);
                }
                
                  const nextIndex = currentQuizIndex + 1;
                if (nextIndex >= quizQuestions.length) {
                  // Quiz complete - award XP, Gold, and loot
                  const baseXP = finalScore * 10;
                  const xpGain = isRetakeQuiz ? Math.floor(baseXP * 0.5) : baseXP;
                  setXp(x => x + xpGain);
                  
                  // Gold reward based on score
                  const baseGold = finalScore * 3; // 3 gold per correct answer
                  const goldGain = isRetakeQuiz ? Math.floor(baseGold * 0.5) : baseGold;
                  setGold(g => g + goldGain);
                  
                  addLog(`Quiz complete! +${xpGain} XP, +${goldGain} Gold${isRetakeQuiz ? ' (retake)' : ''}`);
                  
                  // Loot for good performance (70%+) - only on first attempt
                  if (!isRetakeQuiz && finalScore >= quizQuestions.length * 0.7) {
                    const roll = Math.random();
                    if (roll < 0.4) {
                      setHealthPots(h => h + 1);
                      addLog('Found Health Potion!');
                    } else if (roll < 0.7) {
                      setStaminaPots(s => s + 1);
                      addLog('Found Stamina Potion!');
                    }
                  }
                  
                  setShowQuizResults(true);
                } else {
                  setCurrentQuizIndex(nextIndex);
                  setSelectedAnswer(null);
                }
              }}
              className="w-full py-4 rounded-lg font-bold text-lg transition-all border-2"
              style={{
                backgroundColor: COLORS.crimson.base,
                borderColor: COLORS.crimson.border,
                color: '#F5F5DC'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.crimson.hover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.crimson.base}
            >
              {currentQuizIndex + 1 === quizQuestions.length ? 'See Results' : 'Next Question →'}
            </button>
          )}
        </>
      ) : (
        <div className="text-center">
          <button 
            onClick={() => {
              setShowQuizModal(false);
              setSelectedDeck(null);
              setQuizQuestions([]);
              setCurrentQuizIndex(0);
              setQuizScore(0);
              setSelectedAnswer(null);
              setShowQuizResults(false);
              setWrongCardIndices([]);
              setIsRetakeQuiz(false);
              setMistakesReviewed(false);
              setReviewingMistakes(false);
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={32}/>
          </button>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>TRIAL COMPLETE</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
              <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
              <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            </div>
            <p className="text-5xl font-bold mb-4" style={{color: '#F5F5DC'}}>{quizScore} / {quizQuestions.length}</p>
            <p className="text-xl mb-2" style={{color: COLORS.silver}}>
              {quizScore === quizQuestions.length && 'Flawless Victory!'}
              {quizScore >= quizQuestions.length * 0.7 && quizScore < quizQuestions.length && 'Well Fought!'}
              {quizScore < quizQuestions.length * 0.7 && 'The Path Demands More...'}
            </p>
            {wrongCardIndices.length > 0 && (
              <p className="mt-2 italic" style={{color: '#FF6B6B'}}>{wrongCardIndices.length} question{wrongCardIndices.length !== 1 ? 's' : ''} yet unmastered</p>
            )}
          </div>
          
          <div className="rounded-lg p-6 mb-6 border-2" style={{
            background: 'rgba(184, 134, 11, 0.2)',
            borderColor: 'rgba(212, 175, 55, 0.4)'
          }}>
            <p className="text-xl mb-2" style={{color: COLORS.gold}}>
              +{isRetakeQuiz ? Math.floor(quizScore * 10 * 0.5) : quizScore * 10} XP Earned{isRetakeQuiz ? ' (Retake - 50%)' : ''}
            </p>
            <p className="text-lg mb-2" style={{color: COLORS.gold}}>
              +{isRetakeQuiz ? Math.floor(quizScore * 3 * 0.5) : quizScore * 3} Gold Earned{isRetakeQuiz ? ' (Retake - 50%)' : ''}
            </p>
            {!isRetakeQuiz && quizScore >= quizQuestions.length * 0.7 && (
              <p style={{color: COLORS.silver}}>Bonus loot awarded! Check your inventory.</p>
            )}
          </div>
          
          <div className="space-y-3">
            {wrongCardIndices.length > 0 && !mistakesReviewed && (
              <button
                onClick={() => {
                  setStudyQueue([...wrongCardIndices]);
                  setReviewingMistakes(true);
                  setShowQuizModal(false);
                  setShowQuizResults(false);
                  setIsFlipped(false);
                  setShowStudyModal(true);
                }}
                className="w-full py-4 rounded-lg font-bold text-lg transition-all border-2"
                style={{
                  backgroundColor: COLORS.burgundy.base,
                  borderColor: COLORS.burgundy.border,
                  color: '#F5F5DC'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.burgundy.hover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.burgundy.base}
              >
                Review Mistakes ({wrongCardIndices.length} card{wrongCardIndices.length !== 1 ? 's' : ''})
              </button>
            )}
            
            <button
              onClick={() => {
                setShowQuizModal(false);
                setShowQuizResults(false);
                generateQuiz(selectedDeck, true);
              }}
              disabled={wrongCardIndices.length > 0 && !mistakesReviewed}
              className="w-full py-4 rounded-lg font-bold text-lg transition-all border-2"
              style={{
                backgroundColor: (wrongCardIndices.length > 0 && !mistakesReviewed) ? 'rgba(44, 62, 80, 0.5)' : COLORS.crimson.base,
                borderColor: (wrongCardIndices.length > 0 && !mistakesReviewed) ? 'rgba(149, 165, 166, 0.3)' : COLORS.crimson.border,
                color: (wrongCardIndices.length > 0 && !mistakesReviewed) ? COLORS.silver : '#F5F5DC',
                cursor: (wrongCardIndices.length > 0 && !mistakesReviewed) ? 'not-allowed' : 'pointer',
                opacity: (wrongCardIndices.length > 0 && !mistakesReviewed) ? 0.5 : 1
              }}
              onMouseEnter={(e) => {if (!(wrongCardIndices.length > 0 && !mistakesReviewed)) e.currentTarget.style.backgroundColor = COLORS.crimson.hover}}
              onMouseLeave={(e) => {if (!(wrongCardIndices.length > 0 && !mistakesReviewed)) e.currentTarget.style.backgroundColor = COLORS.crimson.base}}
            >
              {wrongCardIndices.length > 0 && !mistakesReviewed ? 'Review Mistakes First' : 'Retake Quiz (50% XP)'}
            </button>
            
            <button
              onClick={() => {
                setShowQuizModal(false);
                setSelectedDeck(null);
                setQuizQuestions([]);
                setCurrentQuizIndex(0);
                setQuizScore(0);
                setSelectedAnswer(null);
                setShowQuizResults(false);
                setWrongCardIndices([]);
                setIsRetakeQuiz(false);
                setMistakesReviewed(false);
                setReviewingMistakes(false);
              }}
              className="w-full py-4 rounded-lg font-bold text-lg transition-all border-2"
              style={{
                backgroundColor: COLORS.slate.base,
                borderColor: COLORS.slate.border,
                color: '#F5F5DC'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.hover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.base}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)}

{/* Match Game Modal */}
{showMatchModal && selectedDeck !== null && flashcardDecks[selectedDeck] && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto">
    <div className="rounded-xl p-8 max-w-4xl w-full border-2 relative my-8" style={{
      background: 'linear-gradient(to bottom, rgba(30, 10, 40, 0.95), rgba(20, 0, 30, 0.95), rgba(15, 0, 20, 0.95))',
      borderColor: COLORS.gold,
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'
    }}>
      <div className="mb-6 relative">
        <button 
          onClick={() => {
            setShowMatchModal(false);
            setSelectedDeck(null);
            setMatchCards([]);
            setSelectedMatchCards([]);
            setMatchedPairs([]);
            setMatchGlowCards([]);
          }}
          className="absolute -top-2 -right-2 p-2 rounded-lg border-2 transition-all"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(212, 175, 55, 0.4)',
            color: '#D4AF37'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.borderColor = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }}
        >
          <X size={20}/>
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em', fontFamily: 'Cinzel, serif'}}>{flashcardDecks[selectedDeck].name}</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{width: '150px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '150px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"Match the pairs before time slips away..."</p>
        </div>
      </div>
      
      {matchedPairs.length === matchCards.length / 2 ? (
        // Victory screen
        <div className="text-center py-12">
          <h3 className="text-4xl font-bold mb-4" style={{color: '#D4AF37'}}>COMPLETE!</h3>
          <p className="text-2xl mb-6" style={{color: '#68D391'}}>
            Time: {Math.floor((Date.now() - matchStartTime) / 1000)} seconds
          </p>
          <p className="text-lg mb-6" style={{color: COLORS.silver}}>
            All pairs matched!
          </p>
          <button
            onClick={() => {
              // Award XP based on speed
              const timeBonus = Math.max(10, 50 - Math.floor((Date.now() - matchStartTime) / 1000));
              setXp(x => x + timeBonus);
              setGold(g => g + 5);
              addLog(`Match game completed! +${timeBonus} XP, +5 Gold`);
              
              setShowMatchModal(false);
              setSelectedDeck(null);
              setMatchCards([]);
              setSelectedMatchCards([]);
              setMatchedPairs([]);
              setMatchGlowCards([]);
            }}
            className="px-8 py-3 rounded-lg font-bold transition-all border-2"
            style={{
              background: 'linear-gradient(to bottom, #68D391, #48BB78)',
              borderColor: '#9AE6B4',
              color: '#F5F5DC'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #48BB78, #38A169)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #68D391, #48BB78)'}
          >
            Collect Rewards
          </button>
        </div>
      ) : (
        // Game grid
        <div className={`grid gap-3 ${matchCards.length <= 8 ? 'grid-cols-4' : 'grid-cols-4'}`}>
          {matchCards.map((card, idx) => {
            const isSelected = selectedMatchCards.includes(idx);
            const isMatched = card.matched;
            const isGlowing = matchGlowCards.includes(idx);
            
            return (
              <button
                key={card.id}
                onClick={() => {
                  if (isMatched || selectedMatchCards.includes(idx) || selectedMatchCards.length >= 2) return;
                  
                  const newSelected = [...selectedMatchCards, idx];
                  setSelectedMatchCards(newSelected);
                  
                  if (newSelected.length === 2) {
                    // Check if they match
                    const card1 = matchCards[newSelected[0]];
                    const card2 = matchCards[newSelected[1]];
                    
                    if (card1.pairId === card2.pairId) {
                      // Match!
                      setMatchGlowCards(newSelected);
                      
                      setTimeout(() => {
                        setMatchCards(prev => prev.map((c, i) => 
                          newSelected.includes(i) ? {...c, matched: true} : c
                        ));
                        setMatchedPairs(prev => [...prev, card1.pairId]);
                        setSelectedMatchCards([]);
                        setMatchGlowCards([]);
                      }, 800);
                    } else {
                      // No match
                      setTimeout(() => {
                        setSelectedMatchCards([]);
                      }, 1000);
                    }
                  }
                }}
                disabled={isMatched}
                className={`p-4 rounded-lg border-2 transition-all min-h-[100px] flex items-center justify-center text-center ${
                  isMatched ? 'opacity-0 pointer-events-none' : ''
                } ${isGlowing ? 'animate-pulse' : ''}`}
                style={{
                  backgroundColor: isMatched 
                    ? 'transparent'
                    : isGlowing
                      ? 'rgba(104, 211, 145, 0.4)'
                      : isSelected 
                        ? 'rgba(184, 134, 11, 0.3)'
                        : 'rgba(0, 0, 0, 0.4)',
                  borderColor: isMatched
                    ? 'transparent'
                    : isGlowing
                      ? '#68D391'
                      : isSelected
                        ? '#D4AF37'
                        : 'rgba(139, 0, 0, 0.6)',
                  boxShadow: isGlowing
                    ? '0 0 20px rgba(104, 211, 145, 0.8), 0 0 40px rgba(104, 211, 145, 0.4)'
                    : isSelected
                      ? '0 0 10px rgba(212, 175, 55, 0.4)'
                      : 'none',
                  color: '#F5F5DC',
                  cursor: isMatched ? 'default' : 'pointer'
                }}
              >
                <span className="text-sm">{card.text}</span>
              </button>
            );
          })}
        </div>
      )}
      
      {/* Match Stats at Bottom */}
      {matchedPairs.length < matchCards.length / 2 && (
        <div className="mt-6 text-center">
          <p className="text-xs" style={{color: '#95A5A6'}}>
            Matched: <span className="font-bold" style={{color: '#D4AF37'}}>{matchedPairs.length}</span>/{matchCards.length / 2} pairs
            {matchStartTime && <span> | Time: <span className="font-bold" style={{color: '#68D391'}}>{Math.floor((Date.now() - matchStartTime) / 1000)}s</span></span>}
          </p>
        </div>
      )}
    </div>
  </div>
)}

         {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowModal(false)}>
    <div className="rounded-xl p-6 max-w-md w-full border-2 relative" style={{background: 'linear-gradient(to bottom, rgba(15, 35, 45, 0.98), rgba(10, 25, 35, 0.98), rgba(8, 18, 25, 0.98))', borderColor: COLORS.gold, boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), 0 0 30px rgba(212, 175, 55, 0.1)'}} onClick={e => e.stopPropagation()}>
      <div className="mb-6 relative">
        <button 
          onClick={() => setShowModal(false)} 
          className="absolute -top-2 -right-2 p-2 rounded-lg border-2 transition-all"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(212, 175, 55, 0.4)',
            color: '#D4AF37'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            e.currentTarget.style.borderColor = '#D4AF37';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }}
        >
          <X size={20}/>
        </button>
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-2" style={{color: '#D4AF37', letterSpacing: '0.1em'}}>NEW TRIAL</h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'}}></div>
            <span style={{color: 'rgba(212, 175, 55, 0.4)', fontSize: '8px'}}>◆</span>
            <div style={{width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.3))'}}></div>
          </div>
          <p className="text-sm mt-2 italic" style={{color: COLORS.silver}}>"The darkness demands sacrifice..."</p>
        </div>
      </div>
      
      <input 
        type="text" 
        placeholder="Name your trial" 
        value={newTask.title} 
        onChange={e => setNewTask({...newTask, title: e.target.value})} 
        spellCheck="true"
        autoCorrect="on"
        autoCapitalize="sentences"
        onKeyDown={e => {
          if (e.key === 'Enter' && newTask.title) {
            addTask();
          }
        }}
        className="w-full p-3 rounded-lg mb-4 border focus:outline-none" 
        style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', color: '#F5F5DC', borderColor: 'rgba(220, 20, 60, 0.3)', fontFamily: 'Cinzel, serif'}}
        onFocus={e => e.target.style.borderColor = '#DC143C'}
        onBlur={e => e.target.style.borderColor = 'rgba(220, 20, 60, 0.3)'}
        autoFocus 
      />
      
      <div className="mb-4">
        <label className="block text-sm mb-2 text-center" style={{color: COLORS.silver}}>Trial Difficulty</label>
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button" 
            onClick={() => setNewTask({...newTask, priority: 'important'})} 
            className="p-4 rounded-lg border-2 transition-all"
            style={{
              backgroundColor: newTask.priority === 'important' ? 'rgba(194, 144, 21, 0.35)' : 'rgba(0, 0, 0, 0.3)',
              borderColor: newTask.priority === 'important' ? COLORS.gold : 'rgba(128, 128, 128, 0.3)',
              color: '#F5F5DC',
              boxShadow: newTask.priority === 'important' ? 'inset 0 1px 0 rgba(212, 175, 55, 0.1)' : 'none'
            }}
          >
            <div className="font-bold mb-1">IMPORTANT</div>
            <div className="text-xs" style={{color: COLORS.gold}}>1.25x XP</div>
            <div className="text-xs mt-1 italic" style={{color: COLORS.silver}}>Greater reward</div>
          </button>
          
          <button 
            type="button" 
            onClick={() => setNewTask({...newTask, priority: 'routine'})} 
            className="p-4 rounded-lg border-2 transition-all"
            style={{
              backgroundColor: newTask.priority === 'routine' ? 'rgba(30, 58, 95, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              borderColor: newTask.priority === 'routine' ? 'rgba(30, 58, 95, 0.6)' : 'rgba(128, 128, 128, 0.3)',
              color: '#F5F5DC'
            }}
          >
            <div className="font-bold mb-1">ROUTINE</div>
            <div className="text-xs" style={{color: '#6BB6FF'}}>1.0x XP</div>
            <div className="text-xs mt-1 italic" style={{color: COLORS.silver}}>Standard trial</div>
          </button>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={addTask} 
          disabled={!newTask.title} 
          className="flex-1 py-2 rounded-lg transition-all border-2"
          style={{
            backgroundColor: !newTask.title ? '#2C3E50' : 'rgba(139, 26, 40, 0.8)',
            borderColor: !newTask.title ? '#95A5A6' : 'rgba(184, 134, 11, 0.7)',
            color: '#F5F5DC',
            cursor: !newTask.title ? 'not-allowed' : 'pointer',
            opacity: !newTask.title ? 0.5 : 1
          }}
          onMouseEnter={(e) => {if (newTask.title) e.currentTarget.style.backgroundColor = 'rgba(155, 27, 48, 0.9)'}}
          onMouseLeave={(e) => {if (newTask.title) e.currentTarget.style.backgroundColor = 'rgba(139, 26, 40, 0.8)'}}
        >
          Accept Trial
        </button>
        <button 
          onClick={() => setShowModal(false)} 
          className="flex-1 py-2 rounded-lg transition-all border-2"
          style={{backgroundColor: COLORS.slate.base, borderColor: COLORS.slate.border, color: '#F5F5DC'}}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.slate.base}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default FlashcardModals;
