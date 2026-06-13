import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

function passwordIssues(pass) {
  const issues = [];
  if (pass.length < 8)        issues.push('At least 8 characters');
  if (!/[A-Z]/.test(pass))    issues.push('One uppercase letter');
  if (!/[0-9]/.test(pass))    issues.push('One number');
  return issues;
}

export default function AuthModal({ onClose, onSignIn }) {
  const [mode, setMode]               = useState('signin');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [status, setStatus]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [failedAttempts, setFailed]   = useState(0);
  const [resetSent, setResetSent]     = useState(false);

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
        setStatus({ type: 'success', msg: 'Account created. Check your email to confirm.' });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setFailed(f => f + 1);
          throw error;
        }
        onSignIn(data.user);
        onClose();
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!email.trim()) {
      setStatus({ type: 'error', msg: 'Enter your email address above first.' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) { setStatus({ type: 'error', msg: error.message }); return; }
    setResetSent(true);
    setStatus({ type: 'success', msg: 'Password reset email sent — check your inbox.' });
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '6px',
    border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(0,0,0,0.4)',
    color: 'rgba(235,220,190,0.9)', fontSize: '0.85rem', fontFamily: 'Georgia, serif',
    outline: 'none', boxSizing: 'border-box',
  };

  const tabStyle = (active) => ({
    flex: 1, padding: '7px 0', background: active ? 'rgba(212,175,55,0.12)' : 'transparent',
    border: 'none', borderBottom: active ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(212,175,55,0.1)',
    color: active ? 'rgba(212,175,55,0.9)' : 'rgba(160,140,100,0.5)',
    fontSize: '0.75rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em',
    cursor: 'pointer', textTransform: 'uppercase',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ width: '100%', maxWidth: '360px', margin: '0 16px', background: 'linear-gradient(to bottom, rgba(30,18,8,0.98), rgba(15,8,3,0.98))', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '10px', boxShadow: '0 0 40px rgba(0,0,0,0.8)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.45)', textTransform: 'uppercase', margin: '0 0 6px' }}>Cloud Sync</p>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem', color: 'rgba(212,175,55,0.9)', fontWeight: 'normal', margin: 0 }}>Bind Your Chronicle</h2>
          <p style={{ fontSize: '0.82rem', color: 'rgba(160,140,110,0.6)', fontStyle: 'italic', lineHeight: 1.6, marginTop: '8px' }}>
            Sign in to carry your progress across devices.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
          <button style={tabStyle(mode === 'signin')} onClick={() => { setMode('signin'); setStatus(null); setFailed(0); }}>Sign In</button>
          <button style={tabStyle(mode === 'signup')} onClick={() => { setMode('signup'); setStatus(null); }}>Sign Up</button>
          <button style={tabStyle(mode === 'magic')}  onClick={() => { setMode('magic');  setStatus(null); }}>Magic Link</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} style={inputStyle} />

          {mode !== 'magic' && (
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={128} style={inputStyle} />
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

          {/* After 3 failed attempts — reset prompt */}
          {showResetPrompt && !resetSent && (
            <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '6px', padding: '10px 12px' }}>
              <p style={{ fontSize: '0.7rem', color: 'rgba(212,175,55,0.75)', margin: '0 0 8px', fontStyle: 'italic', lineHeight: 1.6 }}>
                Having trouble signing in?
              </p>
              <button type="button" onClick={handleReset} disabled={loading} style={{ background: 'none', border: 'none', color: 'rgba(212,175,55,0.8)', fontSize: '0.82rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.08em', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                Send password reset email →
              </button>
            </div>
          )}

          {status && (
            <div style={{ fontSize: '0.82rem', fontStyle: 'italic', lineHeight: 1.6, color: status.type === 'error' ? 'rgba(220,100,80,0.9)' : 'rgba(120,200,120,0.9)' }}>
              {status.msg}
            </div>
          )}

          <button type="submit" style={{ width: '100%', padding: '11px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.5)', background: 'rgba(212,175,55,0.15)', color: 'rgba(212,175,55,0.95)', fontSize: '0.82rem', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', cursor: loading ? 'wait' : 'pointer' }} disabled={loading}>
            {loading ? 'Working...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}
          </button>

          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(140,125,95,0.5)', fontSize: '0.78rem', fontStyle: 'italic', lineHeight: 1.6, cursor: 'pointer', fontFamily: 'Georgia, serif', padding: '4px 0' }}>
            Continue without signing in
          </button>
        </form>
      </div>
    </div>
  );
}
