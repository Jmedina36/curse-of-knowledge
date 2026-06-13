import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

function passwordIssues(pass) {
  const issues = [];
  if (pass.length < 8)        issues.push('At least 8 characters');
  if (!/[A-Z]/.test(pass))    issues.push('One uppercase letter');
  if (!/[0-9]/.test(pass))    issues.push('One number');
  return issues;
}

export default function AuthGate({ onEnter }) {
  const [mode, setMode]             = useState('signin');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [status, setStatus]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [failedAttempts, setFailed] = useState(0);
  const [resetSent, setResetSent]   = useState(false);

  const issues = mode === 'signup' ? passwordIssues(password) : [];
  const showResetPrompt = failedAttempts >= 3;

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    if (mode === 'signup' && issues.length) {
      setStatus({ type: 'error', msg: 'Please meet all password requirements.' });
      return;
    }
    setLoading(true);
    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        setStatus({ type: 'success', msg: 'Magic link sent — check your email.' });
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setStatus({ type: 'success', msg: 'Account created. Check your email to confirm, then sign in.' });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setFailed(f => f + 1); throw error; }
        onEnter({ user: data.user, offline: false });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!email.trim()) { setStatus({ type: 'error', msg: 'Enter your email address above first.' }); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    setLoading(false);
    if (error) { setStatus({ type: 'error', msg: error.message }); return; }
    setResetSent(true);
    setStatus({ type: 'success', msg: 'Password reset email sent — check your inbox.' });
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid rgba(212,175,55,0.25)',
    background: 'rgba(0,0,0,0.45)',
    color: 'rgba(235,220,190,0.9)',
    fontSize: '0.9rem',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '9px 0',
    background: 'none',
    border: 'none',
    borderBottom: active ? '1px solid rgba(212,175,55,0.6)' : '1px solid rgba(212,175,55,0.1)',
    color: active ? 'rgba(212,175,55,0.9)' : 'rgba(160,140,100,0.45)',
    fontSize: '0.75rem',
    fontFamily: 'Cinzel, serif',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'color 0.15s',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 50% 40%, rgba(30,18,8,1) 0%, rgba(8,5,2,1) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'Georgia, serif',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(212,175,55,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '0.6rem',
          letterSpacing: '0.35em',
          color: 'rgba(212,175,55,0.7)',
          textTransform: 'uppercase',
          marginBottom: '14px',
        }}>
          The Chronicle Awaits
        </p>
        <h1 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 'clamp(2rem, 6vw, 3.2rem)',
          fontWeight: 900,
          letterSpacing: '0.1em',
          color: 'rgba(212,175,55,0.85)',
          margin: 0,
          textShadow: '0 0 40px rgba(212,175,55,0.2)',
        }}>
          Curse of Knowledge
        </h1>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'linear-gradient(to bottom, rgba(28,16,6,0.97), rgba(14,8,3,0.97))',
        border: '1px solid rgba(212,175,55,0.18)',
        borderRadius: '10px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        margin: '0 16px',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex' }}>
          <button style={tabStyle(mode === 'signin')} onClick={() => { setMode('signin'); setStatus(null); }}>Sign In</button>
          <button style={tabStyle(mode === 'signup')} onClick={() => { setMode('signup'); setStatus(null); }}>Sign Up</button>
          <button style={tabStyle(mode === 'magic')} onClick={() => { setMode('magic'); setStatus(null); }}>Magic Link</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.25)'} />
          {mode !== 'magic' && (
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={128} style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.25)'} />
          )}

          {/* Live password requirements on signup */}
          {mode === 'signup' && password && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {['At least 8 characters', 'One uppercase letter', 'One number'].map(req => {
                const pass = !issues.includes(req);
                return (
                  <div key={req} style={{ fontSize: '0.78rem', color: pass ? 'rgba(120,200,120,0.8)' : 'rgba(200,160,100,0.7)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span>{pass ? '✓' : '○'}</span> {req}
                  </div>
                );
              })}
            </div>
          )}

          {/* After 3 failed sign-in attempts */}
          {showResetPrompt && !resetSent && (
            <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '6px', padding: '10px 12px' }}>
              <p style={{ fontSize: '0.7rem', color: 'rgba(212,175,55,0.75)', margin: '0 0 8px', fontStyle: 'italic', lineHeight: 1.6 }}>Having trouble signing in?</p>
              <button type="button" onClick={handleReset} disabled={loading} style={{ background: 'none', border: 'none', color: 'rgba(212,175,55,0.8)', fontSize: '0.82rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                Send password reset email →
              </button>
            </div>
          )}

          {status && (
            <p style={{ fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.6, color: status.type === 'error' ? 'rgba(220,100,80,0.9)' : 'rgba(120,200,120,0.9)', margin: 0 }}>
              {status.msg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px',
              borderRadius: '6px',
              border: '1px solid rgba(212,175,55,0.45)',
              background: loading ? 'rgba(212,175,55,0.08)' : 'rgba(212,175,55,0.14)',
              color: 'rgba(212,175,55,0.95)',
              fontSize: '0.8rem',
              fontFamily: 'Cinzel, serif',
              letterSpacing: '0.1em',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.15s',
              marginTop: '4px',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(212,175,55,0.22)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = loading ? 'rgba(212,175,55,0.08)' : 'rgba(212,175,55,0.14)'; }}
          >
            {loading
              ? 'Working...'
              : mode === 'signin' ? 'Enter the World'
              : mode === 'signup' ? 'Create Account'
              : 'Send Magic Link'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 28px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(212,175,55,0.08)' }} />
          <span style={{ fontSize: '7px', color: 'rgba(212,175,55,0.55)' }}>◆</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(212,175,55,0.08)' }} />
        </div>

        {/* Play offline */}
        <div style={{ padding: '18px 28px 24px', textAlign: 'center' }}>
          <button
            onClick={() => onEnter({ user: null, offline: true })}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(140,125,95,0.78)',
              fontSize: '0.82rem',
              fontStyle: 'italic', lineHeight: 1.6,
              cursor: 'pointer',
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.05em',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(180,160,120,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(140,125,95,0.5)'}
          >
            Play offline — progress saved locally only
          </button>
        </div>
      </div>
    </div>
  );
}
