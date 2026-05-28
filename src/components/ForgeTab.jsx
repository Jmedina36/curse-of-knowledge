import React from 'react';
import { Hammer, Link, Plus, Sparkles, X } from 'lucide-react';
import { COLORS } from '../constants';

const ForgeTab = ({
  forgeSubTab,
  setForgeSubTab,
  flashcardDecks,
  setFlashcardDecks,
  showDeckModal,
  setShowDeckModal,
  showCardModal,
  setShowCardModal,
  showStudyModal,
  setShowStudyModal,
  selectedDeck,
  setSelectedDeck,
  currentCardIndex,
  setCurrentCardIndex,
  studyQueue,
  setStudyQueue,
  isFlipped,
  setIsFlipped,
  studyWebsites,
  newWebsiteName,
  setNewWebsiteName,
  newWebsiteUrl,
  setNewWebsiteUrl,
  newWebsiteCategory,
  setNewWebsiteCategory,
  addStudyWebsite,
  removeStudyWebsite,
  trackWebsiteClick,
  generateQuiz,
  startMatchGame,
  addLog,
}) => {
  return (
  <div className="bg-black bg-opacity-50 rounded-xl p-6 border-2" style={{
    borderColor: 'rgba(212, 175, 55, 0.6)'
  }}>
    <div className="text-center mb-4">
      <h2 className="text-4xl font-bold mb-4" style={{color: '#D4AF37', letterSpacing: '0.15em'}}>KNOWLEDGE FORGE</h2>
      <div className="flex items-center justify-center gap-2">
        <div style={{width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5))'}}></div>
        <span style={{color: 'rgba(212, 175, 55, 0.6)', fontSize: '8px'}}>◆</span>
        <div style={{width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.5))'}}></div>
      </div>
    </div>
    <p className="text-sm mb-6 italic text-center" style={{color: COLORS.silver}}>"Sharpen your mind, temper your wisdom..."</p>
    
    {/* Sub-navigation tabs */}
    <div className="flex gap-2 justify-center mb-6">
      <button 
        onClick={() => setForgeSubTab('flashcards')}
        className="px-6 py-2 rounded-lg transition-all border-2 font-semibold"
        style={{
          backgroundColor: forgeSubTab === 'flashcards' ? 'rgba(184, 134, 11, 0.5)' : 'rgba(30, 30, 30, 0.5)',
          borderColor: forgeSubTab === 'flashcards' ? '#D4AF37' : 'rgba(100, 100, 100, 0.5)',
          color: '#F5F5DC'
        }}
      >
        FLASHCARDS
      </button>
      <button 
        onClick={() => setForgeSubTab('resources')}
        className="px-6 py-2 rounded-lg transition-all border-2 font-semibold"
        style={{
          backgroundColor: forgeSubTab === 'resources' ? 'rgba(184, 134, 11, 0.5)' : 'rgba(30, 30, 30, 0.5)',
          borderColor: forgeSubTab === 'resources' ? '#D4AF37' : 'rgba(100, 100, 100, 0.5)',
          color: '#F5F5DC'
        }}
      >
        FORGED LINKS
      </button>
    </div>
    
    {/* Flashcards Tab Content */}
    {forgeSubTab === 'flashcards' && (
    <>
    <div className="flex justify-between items-center mb-6">
      <div>
        <p className="text-lg" style={{color: '#F5F5DC'}}>Your Decks: <span className="font-bold" style={{color: '#D4AF37'}}>{flashcardDecks.length}</span></p>
        <p className="text-sm" style={{color: '#95A5A6'}}>Study to earn XP and loot!</p>
      </div>
      <button 
        onClick={() => setShowDeckModal(true)}
        className="px-4 py-2 rounded-lg transition-all flex items-center gap-2 border-2"
        style={{
          background: 'linear-gradient(to bottom, #B8860B, #8B6914)',
          borderColor: '#CD7F32',
          color: '#F5F5DC',
          boxShadow: '0 2px 8px rgba(184, 134, 11, 0.3)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #DAA520, #B8860B)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #B8860B, #8B6914)'}
      >
        <Plus size={20}/> New Deck
      </button>
    </div>
    
    {flashcardDecks.length === 0 ? (
      <div className="text-center py-12 rounded-lg border-2" style={{
        background: 'rgba(0, 0, 0, 0.5)',
        borderColor: 'rgba(212, 175, 55, 0.6)'
      }}>
        <p className="mb-2 text-lg" style={{color: '#C0C0C0'}}>The forge stands empty...</p>
        <p className="text-sm" style={{color: '#95A5A6'}}>Create your first deck to begin forging knowledge</p>
      </div>
    ) : (
      <div className="space-y-4">
        {flashcardDecks.map((deck, idx) => (
          <div key={idx} className="rounded-lg p-4 border-2" style={{
            background: 'rgba(0, 0, 0, 0.55)',
            borderColor: 'rgba(212, 175, 55, 0.6)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3), inset 0 0 30px rgba(212, 175, 55, 0.03)'
          }}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold" style={{
                  color: '#D4AF37',
                  fontFamily: 'Cinzel, serif'
                }}>{deck.name}</h3>
                <p className="text-sm" style={{color: '#C0C0C0'}}>
                  {deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''} • 
                  {deck.cards.filter(c => c.mastered).length} mastered
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm(`Delete deck "${deck.name}"?`)) {
                    setFlashcardDecks(prev => prev.filter((_, i) => i !== idx));
                    addLog(`🗑️ Deleted deck: ${deck.name}`);
                  }
                }}
                className="transition-all"
                style={{color: '#9B1B30'}}
                onMouseEnter={(e) => e.currentTarget.style.color = '#B8293E'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9B1B30'}
              >
                <X size={20}/>
              </button>
            </div>
            
            {/* Add Card Button - Top */}
            <button
              onClick={() => {
                setSelectedDeck(idx);
                setShowCardModal(true);
              }}
              className="w-full py-2 rounded transition-all border-2 mb-2"
              style={{
                background: 'linear-gradient(to bottom, #B8860B, #8B6914)',
                borderColor: '#CD7F32',
                color: '#F5F5DC'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #DAA520, #B8860B)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom, #B8860B, #8B6914)'}
            >
              Add Card
            </button>
            
            {deck.cards.length > 0 && (
              <div className="mt-1 pt-3" style={{borderTop: '1px solid rgba(212, 175, 55, 0.3)'}}>
                <p className="text-xs mb-2" style={{color: '#B8B8B8'}}>Cards in this deck:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {deck.cards.map((card, cardIdx) => (
                    <div key={cardIdx} className="flex justify-between items-center text-sm rounded p-2" style={{
                      background: 'rgba(20, 20, 20, 0.6)',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}>
                      <span className="flex-1 truncate" style={{color: '#F5F5DC'}}>
                        {card.mastered && '✓ '}{card.front}
                      </span>
                      <button
                        onClick={() => {
                          setFlashcardDecks(prev => prev.map((d, i) => 
                            i === idx ? {...d, cards: d.cards.filter((_, ci) => ci !== cardIdx)} : d
                          ));
                        }}
                        className="ml-2 transition-all"
                        style={{color: '#9B1B30'}}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#B8293E'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9B1B30'}
                      >
                        <X size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Study Mode Buttons - Bottom */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  if (deck.cards.length === 0) {
                    alert('Add some cards first!');
                    return;
                  }
                  setSelectedDeck(idx);
                  setCurrentCardIndex(0);
                  // Initialize queue with all card indices
                  const allCardIndices = Array.from({length: deck.cards.length}, (_, i) => i);
                  setStudyQueue(allCardIndices);
                  setIsFlipped(false);
                  setShowStudyModal(true);
                }}
                disabled={deck.cards.length === 0}
                className="flex-1 py-2 rounded transition-all border-2 disabled:cursor-not-allowed"
                style={{
                  background: deck.cards.length === 0 ? '#2C3E50' : 'linear-gradient(to bottom, #2F5233, #1E3421)',
                  borderColor: deck.cards.length === 0 ? '#95A5A6' : '#C0C0C0',
                  color: '#F5F5DC',
                  opacity: deck.cards.length === 0 ? 0.5 : 1
                }}
                onMouseEnter={(e) => { if (deck.cards.length > 0) e.currentTarget.style.background = 'linear-gradient(to bottom, #3D6B45, #2F5233)'; }}
                onMouseLeave={(e) => { if (deck.cards.length > 0) e.currentTarget.style.background = 'linear-gradient(to bottom, #2F5233, #1E3421)'; }}
              >
                Review
              </button>
              <button
                onClick={() => {
                  if (deck.cards.length < 4) {
                    alert('Need at least 4 cards for Match!');
                    return;
                  }
                  startMatchGame(idx);
                }}
                disabled={deck.cards.length < 4}
                className="flex-1 py-2 rounded transition-all border-2 disabled:cursor-not-allowed"
                style={{
                  background: deck.cards.length < 4 ? '#2C3E50' : 'linear-gradient(to bottom, #5C2E5C, #3D1F3D)',
                  borderColor: deck.cards.length < 4 ? '#95A5A6' : '#C0C0C0',
                  color: '#F5F5DC',
                  opacity: deck.cards.length < 4 ? 0.5 : 1
                }}
                onMouseEnter={(e) => { if (deck.cards.length >= 4) e.currentTarget.style.background = 'linear-gradient(to bottom, #7A3C7A, #5C2E5C)'; }}
                onMouseLeave={(e) => { if (deck.cards.length >= 4) e.currentTarget.style.background = 'linear-gradient(to bottom, #5C2E5C, #3D1F3D)'; }}
              >
                Match
              </button>
              <button
                onClick={() => {
                  if (deck.cards.length < 4) {
                    alert('Need at least 4 cards for a quiz!');
                    return;
                  }
                  setSelectedDeck(idx);
                  generateQuiz(idx);
                }}
                disabled={deck.cards.length < 4}
                className="flex-1 py-2 rounded transition-all border-2 disabled:cursor-not-allowed"
                style={{
                  background: deck.cards.length < 4 ? '#2C3E50' : 'linear-gradient(to bottom, #1E3A5F, #152840)',
                  borderColor: deck.cards.length < 4 ? '#95A5A6' : '#C0C0C0',
                  color: '#F5F5DC',
                  opacity: deck.cards.length < 4 ? 0.5 : 1
                }}
                onMouseEnter={(e) => { if (deck.cards.length >= 4) e.currentTarget.style.background = 'linear-gradient(to bottom, #2B5082, #1E3A5F)'; }}
                onMouseLeave={(e) => { if (deck.cards.length >= 4) e.currentTarget.style.background = 'linear-gradient(to bottom, #1E3A5F, #152840)'; }}
              >
                Quiz
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
    </>
    )}
    
    {/* Forged Links Tab Content */}
    {forgeSubTab === 'resources' && (
    <>
    <div>
      <p className="text-sm mb-6 italic text-center" style={{color: COLORS.silver}}>"Forge the chains that bind knowledge to will..."</p>
      
      {/* Forge New Link Form */}
      <div className="bg-black bg-opacity-40 rounded-lg p-4 mb-6 border-2 relative overflow-hidden" style={{
        borderColor: 'rgba(212, 175, 55, 0.5)',
        boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)'
      }}>
        {/* Decorative corner accents */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '20px',
          height: '20px',
          borderTop: '2px solid rgba(212, 175, 55, 0.3)',
          borderLeft: '2px solid rgba(212, 175, 55, 0.3)'
        }}/>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '20px',
          height: '20px',
          borderTop: '2px solid rgba(212, 175, 55, 0.3)',
          borderRight: '2px solid rgba(212, 175, 55, 0.3)'
        }}/>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Relic Name (e.g., Canvas LMS)"
            value={newWebsiteName}
            onChange={(e) => setNewWebsiteName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newWebsiteName && newWebsiteUrl) {
                addStudyWebsite();
              }
            }}
            className="px-4 py-3 rounded border-2 bg-black bg-opacity-50 focus:outline-none focus:border-opacity-100 transition-all"
            style={{
              borderColor: 'rgba(212, 175, 55, 0.3)',
              color: '#F5F5DC',
              fontSize: '14px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
            }}
          />
          <input
            type="text"
            placeholder="Source URL (e.g., canvas.instructure.com)"
            value={newWebsiteUrl}
            onChange={(e) => setNewWebsiteUrl(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newWebsiteName && newWebsiteUrl) {
                addStudyWebsite();
              }
            }}
            className="px-4 py-3 rounded border-2 bg-black bg-opacity-50 focus:outline-none focus:border-opacity-100 transition-all"
            style={{
              borderColor: 'rgba(212, 175, 55, 0.3)',
              color: '#F5F5DC',
              fontSize: '14px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
            }}
          />
          <button
            onClick={(e) => {
              if (newWebsiteName.trim() && newWebsiteUrl.trim()) {
                // Visual feedback - golden flash
                e.currentTarget.style.boxShadow = '0 0 30px rgba(218, 165, 32, 0.8), inset 0 0 20px rgba(218, 165, 32, 0.3)';
                e.currentTarget.style.transform = 'scale(0.95)';
                setTimeout(() => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
                  e.currentTarget.style.transform = 'scale(1)';
                }, 150);
                addStudyWebsite();
              }
            }}
            disabled={!newWebsiteName.trim() || !newWebsiteUrl.trim()}
            className="px-4 py-3 rounded font-bold transition-all border-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm relative overflow-hidden"
            style={{
              background: (!newWebsiteName.trim() || !newWebsiteUrl.trim()) 
                ? 'rgba(100, 100, 100, 0.3)' 
                : 'linear-gradient(135deg, #B8860B 0%, #8B6914 50%, #B8860B 100%)',
              borderColor: (!newWebsiteName.trim() || !newWebsiteUrl.trim()) 
                ? 'rgba(100, 100, 100, 0.3)' 
                : '#CD7F32',
              color: '#F5F5DC',
              boxShadow: (!newWebsiteName.trim() || !newWebsiteUrl.trim()) 
                ? 'none' 
                : '0 4px 12px rgba(0,0,0,0.4)',
              letterSpacing: '0.1em',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}
            onMouseEnter={(e) => {
              if (newWebsiteName.trim() && newWebsiteUrl.trim()) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #DAA520 0%, #B8860B 50%, #DAA520 100%)';
                e.currentTarget.style.borderColor = '#D4AF37';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (newWebsiteName.trim() && newWebsiteUrl.trim()) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #B8860B 0%, #8B6914 50%, #B8860B 100%)';
                e.currentTarget.style.borderColor = '#CD7F32';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
              }
            }}
          >
            <Hammer size={16} className="inline mr-2 mb-0.5"/>
            Forge Link
          </button>
        </div>
      </div>
      
      {/* Forged Links Collection */}
      {studyWebsites.length === 0 ? (
        <div className="text-center py-12 rounded-lg border-2 relative" style={{
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(26, 22, 18, 0.3))',
          borderColor: 'rgba(212, 175, 55, 0.3)'
        }}>
          <Sparkles size={32} style={{color: 'rgba(212, 175, 55, 0.3)', margin: '0 auto 12px'}}/>
          <p className="text-sm mb-2" style={{color: '#C9A961', fontWeight: '500'}}>Your forge awaits...</p>
          <p className="text-xs" style={{color: '#95A5A6'}}>Craft your first knowledge relic above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {studyWebsites.map((site) => {
            // Extract domain for favicon and smart icons
            const urlObj = (() => {
              try {
                return new URL(site.url);
              } catch {
                return null;
              }
            })();
            const domain = urlObj ? urlObj.hostname.replace('www.', '') : '';
            const faviconUrl = urlObj ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null;
            
            // Smart domain detection for special icons
            const getDomainIcon = (domain) => {
              const d = domain.toLowerCase();
              if (d.includes('canvas') || d.includes('instructure')) return { icon: '🎓', color: '#E13F2B', label: 'LMS' };
              if (d.includes('github')) return { icon: '</>' , color: '#6e5494', label: 'Code' };
              if (d.includes('stackoverflow') || d.includes('stackexchange')) return { icon: '💻', color: '#F48024', label: 'Dev' };
              if (d.includes('youtube') || d.includes('youtu.be')) return { icon: '▶️', color: '#FF0000', label: 'Video' };
              if (d.includes('docs.google') || d.includes('drive.google')) return { icon: '📄', color: '#4285F4', label: 'Docs' };
              if (d.includes('wikipedia')) return { icon: '📚', color: '#000000', label: 'Wiki' };
              if (d.includes('medium') || d.includes('substack')) return { icon: '✍️', color: '#00AB6C', label: 'Article' };
              if (d.includes('coursera') || d.includes('udemy') || d.includes('edx')) return { icon: '🎯', color: '#0056D2', label: 'Course' };
              if (d.includes('notion')) return { icon: '📝', color: '#000000', label: 'Notes' };
              if (d.includes('leetcode') || d.includes('hackerrank') || d.includes('codewars')) return { icon: '⚔️', color: '#FFA116', label: 'Practice' };
              return { icon: '🔗', color: '#9B8B7E', label: 'Link' };
            };
            
            const domainInfo = getDomainIcon(domain);
            
            return (
              <div
                key={site.id}
                className="group relative rounded-lg border-2 transition-all duration-300"
                style={{
                  background: 'linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(26, 22, 18, 0.4))',
                  borderColor: 'rgba(155, 139, 126, 0.4)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, rgba(26, 22, 18, 0.7), rgba(42, 36, 28, 0.6))';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(212, 175, 55, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(26, 22, 18, 0.4))';
                  e.currentTarget.style.borderColor = 'rgba(155, 139, 126, 0.4)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Metallic edge highlight */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3), transparent)',
                  opacity: 0
                }} className="group-hover:opacity-100 transition-opacity"/>
                
                <div className="flex items-center p-4">
                  {/* Favicon + Smart Icon */}
                  <div className="flex items-center gap-3 mr-4">
                    {faviconUrl && (
                      <img 
                        src={faviconUrl} 
                        alt="" 
                        className="w-6 h-6 rounded"
                        style={{
                          border: '1px solid rgba(155, 139, 126, 0.3)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className="flex flex-col items-center">
                      <span style={{fontSize: '20px', lineHeight: '1'}}>{domainInfo.icon}</span>
                      <span style={{
                        fontSize: '8px',
                        color: domainInfo.color,
                        fontWeight: '600',
                        letterSpacing: '0.05em',
                        marginTop: '2px',
                        textTransform: 'uppercase'
                      }}>
                        {domainInfo.label}
                      </span>
                    </div>
                  </div>
                  
                  {/* Link Content */}
                  <div className="flex-1 min-w-0">
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWebsiteClick(site.id)}
                      className="block"
                    >
                      <p className="font-bold group-hover:underline mb-1 flex items-center gap-2" style={{
                        color: '#D4AF37',
                        fontSize: '15px',
                        letterSpacing: '0.03em',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}>
                        {site.name}
                        {site.clicks > 0 && (
                          <span style={{
                            fontSize: '10px',
                            color: '#95A5A6',
                            fontWeight: '400',
                            marginLeft: '4px'
                          }}>
                            ({site.clicks} {site.clicks === 1 ? 'use' : 'uses'})
                          </span>
                        )}
                      </p>
                      <p className="text-xs overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-1" style={{color: '#95A5A6'}}>
                        <span style={{color: 'rgba(155, 139, 126, 0.5)'}}>⚡</span>
                        {domain || site.url.replace(/^https?:\/\//, '')}
                      </p>
                    </a>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Destroy the "${site.name}" relic?`)) {
                        removeStudyWebsite(site.id);
                      }
                    }}
                    className="ml-3 p-2.5 rounded transition-all flex-shrink-0 border border-transparent"
                    style={{color: '#6B1318'}}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#9B1B30';
                      e.currentTarget.style.background = 'rgba(155, 27, 48, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(155, 27, 48, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#6B1318';
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                    title="Destroy this relic"
                  >
                    <X size={18}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
    )}
  </div>
  );
};

export default ForgeTab;
