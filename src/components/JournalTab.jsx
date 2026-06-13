import React, { useState } from 'react';
import { LOCATION_CONTRACTS } from '../data/locationContracts';

const PROLOGUE_ENTRY = {
  id: '__prologue__',
  title: 'The Shore. Day One.',
  location: 'Unnamed Coast',
  text: `The crossing took longer than it should have. By the time the boat scraped sand I had already counted three reasons to turn back. I didn't.\n\nThe island hit me before I reached the tree line. Something in the undergrowth — fast, low, more than one. I don't know what they were. I know I nearly died in the first hour of a place I came to study.\n\nI had rules going in. Don't fight unless forced. Observe. Learn the terrain before touching it. The creatures didn't care about my rules. I broke two of them in the first ten minutes just to stay alive. The curse doesn't wait for you to be ready. It starts the moment you arrive.\n\nA man pulled me out of it. Said his name was Rylan. Didn't explain much — just moved like someone who had done this before, or watched others fail to. He wasn't fighting for me. He was redirecting things, buying time. There's a difference.\n\nHe brought me to the guild. It's more established than I expected for something this far out. People here know the island, or they're learning it the same way I almost did — badly and fast.\n\nRylan said I'd need a structure. Tasks. A system for when the instinct to just react takes over. He didn't say what the curse was exactly. I didn't ask. I'd felt it already.\n\nI start tomorrow. There's work here. That's what I came for.`,
};

const ZONE_LABELS = {
  1: 'Zone I — The First Roads',
  2: 'Zone II — The Deepening',
  3: 'Zone III — Beyond the Threshold',
  4: 'Zone IV — The Far Reaches',
  5: 'Zone V — The Edge',
};

// Deductions that unlock progressively as entries are found
const DEDUCTIONS = [
  // Zone 1–2
  { requiresId: 'lc_harbor',         text: 'Someone called C is running a coordinated operation. Bandits under orders, not improvising. The mark is a six-pointed sigil I don\'t recognize. Scope unknown.' },
  { requiresId: 'lc_holy_tree',      text: 'Two factions, one mark. Armed men at the harbor, robed women at the grove — both bearing the same sigil. Whatever C is building, it moves through more than one hand.' },
  { requiresId: 'lc_canopy',         text: 'They know who I am. They were watching before I found the harbor. They sent two others before me. I don\'t know if they were testing me or just underestimating me.' },
  { requiresId: 'lc_ivy_crossing',   text: 'Movement is being controlled. Specific people are being blocked or allowed through. Something is being contained — or protected.' },
  { requiresId: 'lc_whisper_forest', text: 'They have relay nodes distributed across the region. The network is wider than I thought. This is infrastructure.' },
  { requiresId: 'lc_outskirts',      text: 'C is tracking my progress in real time. Gryvara was deployed two days after I cleared the crossing. Every move I make is being answered.' },
  // Zone 3
  { requiresId: 'lc_old_crossing',   text: 'Zone 3 is a construction site, not a territory. There is a structure called the monolith at the center. Everything inside this zone was built or positioned in service of it.' },
  { requiresId: 'lc_the_pillars',    text: "C didn't design this system. The standing stones, the dungeon, the pillars — built centuries ago by someone who understood what the monolith could do. C found a plan that already existed and executed it." },
  { requiresId: 'lc_arcane_monolith', text: "The activation was stopped. C's note said I wouldn't be in time. They were wrong. But C builds systems and leaves. Whatever comes next was already in motion before I reached the monolith." },
  { requiresId: 'lc_old_nexus',      text: "The activation drew something ancient. It said the order had opened a door that was already there — not something C built. Whatever was on the other side was coming regardless. C may have simply accelerated it." },
  // Zone 4
  { requiresId: 'lc_iron_crossing',  text: "The monolith failing didn't end anything. Vorn had sealed contingency orders. The order built a second path before they finished the first. The zone 3 failure only changed the timeline." },
  { requiresId: 'order_mira',        text: "Mira built the entire ritual network — the relay, the silence, the transit system. She wasn't following orders. She was extending them. She believed in what C was building. Two faction leaders down. Whoever is above them hasn't responded." },
  // Zone 5
  { requiresId: 'order_malachar',    text: "C is not a person. It was a title Malachar created so the order would survive his deaths. He has died seventeen times. Every time, someone held the structure under that name until he returned. The order wasn't his legacy — it was his mechanism. And before he fell, he said he had already passed the title on." },
  { requiresId: 'lc_skull_order',    text: "Cutter and Mira weren't making a last stand. They were the last people C trusted to hold the order together. They're gone. The order's structure is gone. Whatever it was building toward — I don't know if I stopped it or just interrupted it." },
  { requiresId: 'lc_skull_cavern',   text: "The order was payment. Malachar made a deal in his first life — the deal that let him return seventeen times — with something that predates every record I've found. The order spent decades building the path for it. Something is still out there. It isn't in any room I've cleared. Malachar called it the Omen. He sounded afraid when he said it." },
];

export default function JournalTab({ completedLocationContracts = [] }) {
  const [selectedId, setSelectedId] = useState(null);

  const allEntryContracts = LOCATION_CONTRACTS.filter(lc => lc.journalEntry);

  // Group by zone
  const byZone = {};
  allEntryContracts.forEach(lc => {
    const z = lc.journalEntry.zone;
    if (!byZone[z]) byZone[z] = [];
    byZone[z].push(lc);
  });
  const zones = Object.keys(byZone).map(Number).sort();

  const isUnlocked = (id) => completedLocationContracts.includes(id);
  const foundCount = allEntryContracts.filter(lc => isUnlocked(lc.id)).length;
  const totalCount = allEntryContracts.length;

  const unlockedDeductions = DEDUCTIONS.filter(d => isUnlocked(d.requiresId));

  const selectedContract = allEntryContracts.find(lc => lc.id === selectedId);

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 180px)',
      fontFamily: 'Georgia, serif',
      color: 'rgba(235,220,190,0.9)',
      overflow: 'hidden',
    }}>

      {/* ── Left panel: entry list ─────────────────────────────────────── */}
      <div style={{
        width: '260px',
        flexShrink: 0,
        borderRight: '1px solid rgba(212,175,55,0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 16px 12px',
          borderBottom: '1px solid rgba(212,175,55,0.15)',
        }}>
          <p style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.72rem',
            letterSpacing: '0.1em',
            color: 'rgba(212,175,55,0.78)',
            textTransform: 'uppercase',
            margin: '0 0 4px',
          }}>Field Journal</p>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1.1rem',
            color: 'rgba(212,175,55,0.9)',
            margin: '0 0 8px',
            fontWeight: 'normal',
          }}>The Order</h2>
          <div style={{
            fontSize: '0.78rem',
            color: foundCount === 0 ? 'rgba(160,140,110,0.45)' : 'rgba(160,140,110,0.7)',
            fontStyle: 'italic', lineHeight: 1.6,
          }}>
            {foundCount === 0
              ? 'No entries yet.'
              : `${foundCount} of ${totalCount} entries recorded`}
          </div>
        </div>

        {/* Prologue — always visible */}
        <div>
          <div style={{
            padding: '10px 16px 6px',
            fontSize: '0.6rem',
            fontFamily: 'Cinzel, serif',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(212,175,55,0.7)',
          }}>
            Prologue
          </div>
          <button
            onClick={() => setSelectedId(selectedId === '__prologue__' ? null : '__prologue__')}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '9px 16px',
              background: selectedId === '__prologue__' ? 'rgba(212,175,55,0.12)' : 'transparent',
              border: 'none',
              borderLeft: selectedId === '__prologue__' ? '2px solid rgba(212,175,55,0.6)' : '2px solid transparent',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (selectedId !== '__prologue__') e.currentTarget.style.background = 'rgba(212,175,55,0.06)'; }}
            onMouseLeave={e => { if (selectedId !== '__prologue__') e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ fontSize: '0.85rem', color: selectedId === '__prologue__' ? 'rgba(235,220,190,0.95)' : 'rgba(200,185,155,0.85)', lineHeight: 1.35, marginBottom: '2px' }}>
              {PROLOGUE_ENTRY.title}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(140,125,95,0.7)', fontStyle: 'italic', lineHeight: 1.6 }}>
              {PROLOGUE_ENTRY.location}
            </div>
          </button>
        </div>

        {/* Zone sections */}
        {zones.map(zone => {
          const contracts = byZone[zone];
          const anyUnlocked = contracts.some(lc => isUnlocked(lc.id));
          return (
            <div key={zone}>
              <div style={{
                padding: '10px 16px 6px',
                fontSize: '0.6rem',
                fontFamily: 'Cinzel, serif',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: anyUnlocked ? 'rgba(212,175,55,0.45)' : 'rgba(120,110,90,0.35)',
              }}>
                {ZONE_LABELS[zone] || `Zone ${zone}`}
              </div>
              {contracts.map(lc => {
                const unlocked = isUnlocked(lc.id);
                const isSelected = selectedId === lc.id;
                return (
                  <button
                    key={lc.id}
                    onClick={() => unlocked && setSelectedId(isSelected ? null : lc.id)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 16px',
                      background: isSelected
                        ? 'rgba(212,175,55,0.12)'
                        : 'transparent',
                      border: 'none',
                      borderLeft: isSelected
                        ? '2px solid rgba(212,175,55,0.6)'
                        : '2px solid transparent',
                      cursor: unlocked ? 'pointer' : 'default',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (unlocked && !isSelected) e.currentTarget.style.background = 'rgba(212,175,55,0.06)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {unlocked ? (
                      <>
                        <div style={{
                          fontSize: '0.85rem',
                          color: isSelected ? 'rgba(235,220,190,0.95)' : 'rgba(200,185,155,0.85)',
                          lineHeight: 1.35,
                          marginBottom: '2px',
                        }}>
                          {lc.journalEntry.title}
                        </div>
                        <div style={{
                          fontSize: '0.72rem',
                          color: 'rgba(140,125,95,0.7)',
                          fontStyle: 'italic', lineHeight: 1.6,
                        }}>
                          {lc.journalEntry.location}
                        </div>
                      </>
                    ) : (
                      <div style={{
                        fontSize: '0.82rem',
                        color: 'rgba(100,90,70,0.7)',
                        fontStyle: 'italic', lineHeight: 1.6,
                        letterSpacing: '0.05em',
                      }}>
                        — unknown —
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* What I Know section */}
        {unlockedDeductions.length > 0 && (
          <div style={{
            marginTop: 'auto',
            borderTop: '1px solid rgba(212,175,55,0.15)',
            padding: '14px 16px',
          }}>
            <button
              onClick={() => setSelectedId(selectedId === '__deductions__' ? null : '__deductions__')}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: selectedId === '__deductions__' ? 'rgba(212,175,55,0.1)' : 'transparent',
                border: 'none',
                borderLeft: selectedId === '__deductions__' ? '2px solid rgba(212,175,55,0.5)' : '2px solid transparent',
                padding: '6px 0',
                cursor: 'pointer',
              }}
            >
              <div style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                color: 'rgba(212,175,55,0.78)',
                textTransform: 'uppercase',
              }}>
                What I Know
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ── Right panel: entry detail ──────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 40px',
      }}>
        {/* Empty state — prologue always available so just show select prompt */}
        {!selectedId && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: '10px', opacity: 0.45,
          }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: 'rgba(212,175,55,0.7)', letterSpacing: '0.05em' }}>
              Select an entry.
            </p>
          </div>
        )}

        {/* Prologue entry */}
        {selectedId === '__prologue__' && (
          <div style={{ maxWidth: '620px' }}>
            <div style={{
              fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.15em',
              color: 'rgba(212,175,55,0.7)', textTransform: 'uppercase', marginBottom: '6px',
            }}>
              Prologue · {PROLOGUE_ENTRY.location}
            </div>
            <h2 style={{
              fontFamily: 'Cinzel, serif', fontSize: '1.4rem', color: 'rgba(235,220,190,0.95)',
              fontWeight: 'normal', margin: '0 0 24px',
              borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '14px',
            }}>
              {PROLOGUE_ENTRY.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {PROLOGUE_ENTRY.text.split('\n\n').map((para, i) => (
                <p key={i} style={{
                  fontSize: '0.86rem', lineHeight: 1.85,
                  color: 'rgba(215,200,170,0.88)', margin: 0, fontStyle: 'italic', lineHeight: 1.6,
                }}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* What I Know panel */}
        {selectedId === '__deductions__' && (
          <div style={{ maxWidth: '620px' }}>
            <div style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              color: 'rgba(212,175,55,0.7)',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}>
              Running Assessment
            </div>
            <h2 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '1.4rem',
              color: 'rgba(212,175,55,0.9)',
              fontWeight: 'normal',
              margin: '0 0 28px',
              borderBottom: '1px solid rgba(212,175,55,0.2)',
              paddingBottom: '14px',
            }}>
              What I Know
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {unlockedDeductions.map((d, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    flexShrink: 0,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '1px solid rgba(212,175,55,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    color: 'rgba(212,175,55,0.78)',
                    fontFamily: 'Cinzel, serif',
                    marginTop: '1px',
                  }}>
                    {i + 1}
                  </div>
                  <p style={{
                    fontFamily: 'EB Garamond, serif',
                    fontSize: '1.08rem',
                    lineHeight: 1.65,
                    color: 'rgba(210,195,165,0.85)',
                    margin: 0,
                  }}>
                    {d.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Journal entry */}
        {selectedId && selectedId !== '__deductions__' && selectedContract && isUnlocked(selectedContract.id) && (
          <div style={{ maxWidth: '620px' }}>
            {/* Zone label */}
            <div style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              color: 'rgba(212,175,55,0.7)',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}>
              {ZONE_LABELS[selectedContract.journalEntry.zone] || `Zone ${selectedContract.journalEntry.zone}`} · {selectedContract.journalEntry.location}
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '1.4rem',
              color: 'rgba(235,220,190,0.95)',
              fontWeight: 'normal',
              margin: '0 0 24px',
              borderBottom: '1px solid rgba(212,175,55,0.2)',
              paddingBottom: '14px',
            }}>
              {selectedContract.journalEntry.title}
            </h2>

            {/* Body text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedContract.journalEntry.text.split('\n\n').map((para, i) => (
                <p key={i} style={{
                  fontSize: '0.86rem',
                  lineHeight: 1.85,
                  color: 'rgba(215,200,170,0.88)',
                  margin: 0,
                  fontStyle: 'italic', lineHeight: 1.6,
                }}>
                  {para}
                </p>
              ))}
            </div>

            {/* Intel note — shown if contract dropped faction intel */}
            {selectedContract.encounter?.intelNote && (
              <div style={{
                marginTop: '24px',
                padding: '14px 16px',
                borderRadius: '6px',
                background: 'rgba(212,160,30,0.06)',
                border: '1px solid rgba(212,160,30,0.2)',
              }}>
                <p style={{
                  fontFamily: 'Cinzel, serif', fontSize: '0.6rem', fontWeight: 700,
                  letterSpacing: '0.25em', textTransform: 'uppercase',
                  color: 'rgba(212,160,30,0.78)', margin: '0 0 8px',
                }}>Intel Recovered</p>
                <p style={{
                  fontSize: '0.95rem', lineHeight: 1.65,
                  color: 'rgba(210,185,130,0.8)', margin: 0, fontStyle: 'italic',
                }}>
                  {selectedContract.encounter.intelNote}
                </p>
              </div>
            )}

            {/* Divider + contract name */}
            <div style={{
              marginTop: '32px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(212,175,55,0.12)',
              fontSize: '0.75rem',
              color: 'rgba(140,125,95,0.78)',
              fontFamily: 'Cinzel, serif',
              letterSpacing: '0.08em',
            }}>
              Recorded after: {selectedContract.name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
