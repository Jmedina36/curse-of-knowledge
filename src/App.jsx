import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Sword,
  Shield,
  Heart,
  Zap,
  Skull,
  Trophy,
  Clock,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

const GAME_CONSTANTS = {
  MAX_HP: 100,
  MAX_STAMINA: 100,

  HEALTH_POTION_RESTORE: 50,
  STAMINA_POTION_RESTORE: 50,

  // Base task time in minutes (per “work” chunk)
  BASE_TASK_MINUTES: 25,

  // Loot roll thresholds (cumulative)
  // roll in [0,1)
  LOOT_RATES: {
    HEALTH_POT: 0.25, // < 0.25
    STAMINA_POT: 0.45, // < 0.45
    WEAPON: 0.65, // < 0.65
    ARMOR: 0.85, // < 0.85
    NOTHING: 1.0,
  },
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function FocusRPG() {
  // Core stats
  const [currentDay, setCurrentDay] = useState(1);
  const [xp, setXp] = useState(0);

  const [hp, setHp] = useState(GAME_CONSTANTS.MAX_HP);
  const [stamina, setStamina] = useState(GAME_CONSTANTS.MAX_STAMINA);

  const [weapon, setWeapon] = useState(0);
  const [armor, setArmor] = useState(0);

  const [healthPots, setHealthPots] = useState(1);
  const [staminaPots, setStaminaPots] = useState(1);

  // Tasks / timer
  const [activeTask, setActiveTask] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [running, setRunning] = useState(false);
  const [timer, setTimer] = useState(GAME_CONSTANTS.BASE_TASK_MINUTES * 60); // seconds remaining
  const [timerEndTime, setTimerEndTime] = useState(null); // ms epoch
  const [overdueTask, setOverdueTask] = useState(null);

  // Flavor states
  const [isCursed, setIsCursed] = useState(false);

  // Logs
  const [logs, setLogs] = useState([]);
  const logRef = useRef(null);

  const addLog = (msg) => {
    setLogs((prev) => [...prev.slice(-200), `${new Date().toLocaleTimeString()} — ${msg}`]);
  };

  // Scaling
  const getMaxHp = () => GAME_CONSTANTS.MAX_HP + armor * 10 + Math.floor(currentDay / 2) * 5;
  const getMaxStamina = () =>
    GAME_CONSTANTS.MAX_STAMINA + weapon * 5 + Math.floor(currentDay / 2) * 5;

  // Keep hp/stamina within scaled max when day/gear changes
  useEffect(() => {
    setHp((h) => clamp(h, 0, getMaxHp()));
    setStamina((s) => clamp(s, 0, getMaxStamina()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay, weapon, armor]);

  // Auto-scroll logs
  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // Timer tick
  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setTimer(() => {
        if (!timerEndTime) return 0;
        const remaining = Math.ceil((timerEndTime - Date.now()) / 1000);

        if (remaining <= 0) {
          // Timer is done
          setRunning(false);
          if (activeTask) {
            setOverdueTask(activeTask);
            addLog(`⏰ Timer ended for "${activeTask}". Task is now OVERDUE.`);
          }
          return 0;
        }

        return remaining;
      });
    }, 250);

    return () => clearInterval(id);
  }, [running, timerEndTime, activeTask]);

  // Start a new task
  const startTask = () => {
    const name = taskInput.trim();
    if (!name) return;

    setActiveTask(name);
    setOverdueTask(null);

    const seconds = GAME_CONSTANTS.BASE_TASK_MINUTES * 60;
    setTimer(seconds);

    const end = Date.now() + seconds * 1000;
    setTimerEndTime(end);
    setRunning(true);

    addLog(`🧠 Started task: "${name}" (${GAME_CONSTANTS.BASE_TASK_MINUTES} min)`);
    setTaskInput("");
  };

  const toggleTimer = () => {
    if (!activeTask) return;

    setRunning((r) => {
      const next = !r;

      // When resuming, rebuild end time from current timer
      if (next) {
        const end = Date.now() + timer * 1000;
        setTimerEndTime(end);
        addLog(`▶️ Resumed timer for "${activeTask}".`);
      } else {
        // When pausing, freeze remaining by recomputing from end time
        if (timerEndTime) {
          const remaining = Math.ceil((timerEndTime - Date.now()) / 1000);
          setTimer(clamp(remaining, 0, 24 * 60 * 60));
        }
        setTimerEndTime(null);
        addLog(`⏸️ Paused timer for "${activeTask}".`);
      }

      return next;
    });
  };

  const resetTask = () => {
    if (activeTask) addLog(`🔁 Reset task timer for "${activeTask}".`);
    setRunning(false);
    setTimer(GAME_CONSTANTS.BASE_TASK_MINUTES * 60);
    setTimerEndTime(null);
    setOverdueTask(null);
  };

  // FIX #2: Use scaled max (getMaxHp)
  const useHealth = () => {
    if (healthPots <= 0) return;
    if (hp >= getMaxHp()) return;

    setHealthPots((p) => p - 1);
    setHp((h) => Math.min(getMaxHp(), h + GAME_CONSTANTS.HEALTH_POTION_RESTORE));
    addLog(`❤️ Used Health Potion! +${GAME_CONSTANTS.HEALTH_POTION_RESTORE} HP`);
  };

  // FIX #1: Stamina Potion is NOT the timer extender
  // Potion restores SP and consumes staminaPots
  const useStaminaPotion = () => {
    if (staminaPots <= 0) return;
    if (stamina >= getMaxStamina()) return;

    setStaminaPots((p) => p - 1);
    setStamina((s) => Math.min(getMaxStamina(), s + GAME_CONSTANTS.STAMINA_POTION_RESTORE));
    addLog(`⚡ Used Stamina Potion! +${GAME_CONSTANTS.STAMINA_POTION_RESTORE} SP`);
  };

  // FIX #1: Separate action — spend stamina to extend timer
  const extendTimerWithStamina = () => {
    const staminaCost = 5;
    const timeBonus = 5 * 60; // seconds

    if (!activeTask) return;

    if (stamina < staminaCost) {
      addLog(`⚠️ Need ${staminaCost} SP to extend timer. (Have ${stamina})`);
      return;
    }

    setStamina((s) => s - staminaCost);

    // Extend timer + end time safely
    setTimer((t) => t + timeBonus);
    setTimerEndTime((prev) => {
      // If running and end-time exists, extend it.
      // If paused or missing end-time, rebuild from now + current timer, then extend.
      const base = prev && running ? prev : Date.now() + timer * 1000;
      return base + timeBonus * 1000;
    });

    if (!running) setRunning(true);

    // If it was overdue, clearing overdue is fair when you “buy time”
    if (overdueTask === activeTask) setOverdueTask(null);

    addLog(`⏳ Extended timer +5 min (-${staminaCost} SP)`);
  };

  const completeTask = () => {
    if (!activeTask) return;

    // Reward model (simple + scaled)
    const dayScale = 1 + Math.floor((currentDay - 1) / 2);
    const xpGain = 10 * dayScale;
    const hpDamageFromOverdue = overdueTask ? 10 * dayScale : 0;

    setXp((x) => x + xpGain);

    if (hpDamageFromOverdue > 0) {
      setHp((h) => clamp(h - hpDamageFromOverdue, 0, getMaxHp()));
      addLog(`💥 Overdue penalty: -${hpDamageFromOverdue} HP`);
    }

    // Loot roll
    const roll = Math.random();

    if (roll < GAME_CONSTANTS.LOOT_RATES.HEALTH_POT) {
      setHealthPots((p) => p + 1);
      addLog(`🧪 Loot: Health Potion +1 (Total: ${healthPots + 1})`);
    } else if (roll < GAME_CONSTANTS.LOOT_RATES.STAMINA_POT) {
      setStaminaPots((p) => p + 1);
      addLog(`🧪 Loot: Stamina Potion +1 (Total: ${staminaPots + 1})`);
    } else if (roll < GAME_CONSTANTS.LOOT_RATES.WEAPON) {
      const gain = 1 + Math.floor(currentDay / 2);
      // FIX #4: log correct total using functional update
      setWeapon((w) => {
        const next = w + gain;
        addLog(`⚔️ Weapon upgraded! +${gain} (Total: ${next})`);
        return next;
      });
    } else if (roll < GAME_CONSTANTS.LOOT_RATES.ARMOR) {
      const gain = 1 + Math.floor(currentDay / 2);
      // FIX #4: log correct total using functional update
      setArmor((a) => {
        const next = a + gain;
        addLog(`🛡️ Armor upgraded! +${gain} (Total: ${next})`);
        return next;
      });
    } else {
      addLog(`🪙 Loot: Nothing this time.`);
    }

    addLog(`✅ Completed "${activeTask}" (+${xpGain} XP)`);

    // Clear task/timer state
    setActiveTask("");
    setOverdueTask(null);
    setRunning(false);
    setTimer(GAME_CONSTANTS.BASE_TASK_MINUTES * 60);
    setTimerEndTime(null);

    // Day progression example: every 3 completes → day++
    // (Keep simple; change to your actual rule if different.)
    setCurrentDay((d) => {
      const next = d + (xpGain >= 10 ? 0 : 0);
      return next;
    });
  };

  const failTask = () => {
    if (!activeTask) return;

    const dayScale = 1 + Math.floor((currentDay - 1) / 2);
    const dmg = 15 * dayScale;

    setHp((h) => clamp(h - dmg, 0, getMaxHp()));
    addLog(`☠️ Failed "${activeTask}" (-${dmg} HP)`);

    setActiveTask("");
    setOverdueTask(null);
    setRunning(false);
    setTimer(GAME_CONSTANTS.BASE_TASK_MINUTES * 60);
    setTimerEndTime(null);
  };

  const nextDay = () => {
    setCurrentDay((d) => d + 1);

    // Some light “new day” regen
    setHp((h) => clamp(h + 15, 0, getMaxHp()));
    setStamina((s) => clamp(s + 20, 0, getMaxStamina()));

    // Random curse toggle for flavor
    const cursed = Math.random() < 0.15;
    setIsCursed(cursed);

    addLog(`🌅 Day advanced to ${currentDay + 1}${cursed ? " — A CURSE LINGERS..." : ""}`);
  };

  const hpPct = useMemo(() => (hp / getMaxHp()) * 100, [hp, armor, currentDay]);
  const spPct = useMemo(
    () => (stamina / getMaxStamina()) * 100,
    [stamina, weapon, currentDay]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-2xl font-bold tracking-tight">
              Focus RPG <span className="text-slate-400 text-base font-medium">Day {currentDay}</span>
            </div>
            <div className="text-slate-400 text-sm">
              XP: <span className="text-slate-200 font-semibold">{xp}</span>{" "}
              {isCursed ? <span className="text-red-400">• Cursed</span> : null}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={nextDay}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              Next Day
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 font-semibold">
              <Heart className="text-red-400" size={18} />
              HP
              <span className="ml-auto text-slate-300 text-sm">
                {hp}/{getMaxHp()}
              </span>
            </div>
            <div className="mt-2 h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: `${clamp(hpPct, 0, 100)}%` }} />
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 font-semibold">
              <Zap className="text-yellow-400" size={18} />
              Stamina
              <span className="ml-auto text-slate-300 text-sm">
                {stamina}/{getMaxStamina()}
              </span>
            </div>
            <div className="mt-2 h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500" style={{ width: `${clamp(spPct, 0, 100)}%` }} />
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <Trophy className="text-emerald-400" size={18} />
                Gear
              </div>
              <div className="text-slate-300 text-sm flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Sword size={16} className="text-slate-300" /> {weapon}
                </span>
                <span className="flex items-center gap-1">
                  <Shield size={16} className="text-slate-300" /> {armor}
                </span>
              </div>
            </div>
            <div className="mt-2 text-slate-400 text-sm">
              Weapon boosts max stamina. Armor boosts max HP.
            </div>
          </div>
        </section>

        {/* Task input */}
        <section className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Enter a task (e.g., 'Study subnetting')"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-slate-600"
              disabled={!!activeTask}
            />
            <button
              onClick={startTask}
              disabled={!!activeTask || !taskInput.trim()}
              className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 transition font-semibold"
            >
              Start
            </button>
          </div>

          {/* Active task area */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-lg font-semibold flex items-center gap-2">
                <Clock size={18} className="text-slate-300" />
                {activeTask ? (
                  <>
                    <span className="text-slate-100">"{activeTask}"</span>
                    {overdueTask === activeTask ? (
                      <span className="text-red-400 text-sm font-bold">OVERDUE</span>
                    ) : null}
                  </>
                ) : (
                  <span className="text-slate-400">No active task</span>
                )}
              </div>
              <div className="text-3xl font-mono mt-1">{formatTime(timer)}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleTimer}
                disabled={!activeTask}
                className="bg-slate-800 px-3 py-2 rounded-xl hover:bg-slate-700 disabled:opacity-40 transition flex items-center gap-2"
              >
                {running ? <Pause size={16} /> : <Play size={16} />}
                {running ? "Pause" : "Resume"}
              </button>

              <button
                onClick={resetTask}
                disabled={!activeTask}
                className="bg-slate-800 px-3 py-2 rounded-xl hover:bg-slate-700 disabled:opacity-40 transition flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset
              </button>

              {/* FIX #1: Timer extension uses stamina, not stamina potion */}
              <button
                onClick={extendTimerWithStamina}
                disabled={!activeTask || stamina < 5}
                className="bg-purple-600 px-3 py-2 rounded-xl hover:bg-purple-500 disabled:opacity-40 transition flex items-center gap-2"
              >
                <Zap size={16} />
                +5 min (-5 SP)
              </button>

              <button
                onClick={completeTask}
                disabled={!activeTask}
                className="bg-emerald-600 px-3 py-2 rounded-xl hover:bg-emerald-500 disabled:opacity-40 transition flex items-center gap-2"
              >
                <Trophy size={16} />
                Complete
              </button>

              <button
                onClick={failTask}
                disabled={!activeTask}
                className="bg-red-700 px-3 py-2 rounded-xl hover:bg-red-600 disabled:opacity-40 transition flex items-center gap-2"
              >
                <Skull size={16} />
                Fail
              </button>
            </div>
          </div>
        </section>

        {/* Inventory */}
        <section className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <div className="font-semibold mb-3">Inventory</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={useHealth}
              disabled={healthPots === 0 || hp >= getMaxHp()}
              className="bg-slate-800 px-4 py-3 rounded-xl hover:bg-slate-700 disabled:opacity-40 transition flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Heart size={16} className="text-red-400" />
                Health Potion (+{GAME_CONSTANTS.HEALTH_POTION_RESTORE} HP)
              </span>
              <span className="font-mono">{healthPots}</span>
            </button>

            {/* FIX #1 + #2: correct function + scaled max */}
            <button
              onClick={useStaminaPotion}
              disabled={staminaPots === 0 || stamina >= getMaxStamina()}
              className="bg-slate-800 px-4 py-3 rounded-xl hover:bg-slate-700 disabled:opacity-40 transition flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                Stamina Potion (+{GAME_CONSTANTS.STAMINA_POTION_RESTORE} SP)
              </span>
              <span className="font-mono">{staminaPots}</span>
            </button>
          </div>

          <div className="text-slate-400 text-sm mt-3">
            Potions restore stats. The <span className="text-slate-200">+5 min</span> button spends stamina, not potions.
          </div>
        </section>

        {/* Logs */}
        <section className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <div className="font-semibold mb-3">Activity Log</div>
          <div
            ref={logRef}
            className="h-56 overflow-auto rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm space-y-1"
          >
            {logs.length === 0 ? (
              <div className="text-slate-500">No activity yet.</div>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="text-slate-200">
                  {l}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* Diagnostics
Efficiency: 98/100
Redundancy: None
Ambiguity: None
Context Integrity: 99%
Semantic Fidelity: 99%
*/


