import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthModal({ onClose, onSignIn }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'magic'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null); // { type: 'error'|'success', msg }
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
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
        if (error) throw error;
        onSignIn(data.user);
        onClose();
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid rgba(212,175,55,0.3)',
    background: 'rgba(0,0,0,0.4)',
    color: 'rgba(235,220,190,0.9)',
    fontSize: '0.85rem',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const btnStyle = {
    width: '100%',
    padding: '11px',
    borderRadius: '6px',
    border: '1px solid rgba(212,175,55,0.5)',
    background: 'rgba(212,175,55,0.15)',
    color: 'rgba(212,175,55,0.95)',
    fontSize: '0.82rem',
    fontFamily: 'Cinzel, serif',
    letterSpacing: '0.1em',
    cursor: loading ? 'wait' : 'pointer',
    transition: 'background 0.15s',
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '7px 0',
    background: active ? 'rgba(212,175,55,0.12)' : 'transparent',
    border: 'none',
    borderBottom: active ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(212,175,55,0.1)',
    color: active ? 'rgba(212,175,55,0.9)' : 'rgba(160,140,100,0.5)',
    fontSize: '0.65rem',
    fontFamily: 'Cinzel, serif',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    textTransform: 'uppercase',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        width: '360px',
        background: 'linear-gradient(to bottom, rgba(30,18,8,0.98), rgba(15,8,3,0.98))',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '10px',
        boxShadow: '0 0 40px rgba(0,0,0,0.8)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.58rem',
            letterSpacing: '0.2em',
            color: 'rgba(212,175,55,0.45)',
            textTransform: 'uppercase',
            margin: '0 0 6px',
          }}>Cloud Sync</p>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1.2rem',
            color: 'rgba(212,175,55,0.9)',
            fontWeight: 'normal',
            margin: 0,
          }}>Bind Your Chronicle</h2>
          <p style={{
            fontSize: '0.72rem',
            color: 'rgba(160,140,110,0.6)',
            fontStyle: 'italic',
            marginTop: '8px',
          }}>
            Sign in to carry your progress across devices.
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
          <button style={tabStyle(mode === 'signin')} onClick={() => { setMode('signin'); setStatus(null); }}>Sign In</button>
          <button style={tabStyle(mode === 'signup')} onClick={() => { setMode('signup'); setStatus(null); }}>Sign Up</button>
          <button style={tabStyle(mode === 'magic')} onClick={() => { setMode('magic'); setStatus(null); }}>Magic Link</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          {mode !== 'magic' && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          {status && (
            <div style={{
              fontSize: '0.72rem',
              fontStyle: 'italic',
              color: status.type === 'error' ? 'rgba(220,100,80,0.9)' : 'rgba(120,200,120,0.9)',
              lineHeight: 1.5,
            }}>
              {status.msg}
            </div>
          )}

          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? 'Working...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(140,125,95,0.5)',
              fontSize: '0.68rem',
              fontStyle: 'italic',
              cursor: 'pointer',
              fontFamily: 'Georgia, serif',
              padding: '4px 0',
            }}
          >
            Continue without signing in
          </button>
        </form>
      </div>
    </div>
  );
}
