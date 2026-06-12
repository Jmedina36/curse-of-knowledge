import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

function passwordIssues(pass) {
  const issues = [];
  if (pass.length < 8)        issues.push('At least 8 characters');
  if (!/[A-Z]/.test(pass))    issues.push('One uppercase letter');
  if (!/[0-9]/.test(pass))    issues.push('One number');
  return issues;
}

export default function SetPasswordModal({ onClose }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [status, setStatus]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const issues = passwordIssues(password);
  const mismatch = confirm && password !== confirm;

  async function handleSubmit(e) {
    e.preventDefault();
    if (issues.length) return;
    if (password !== confirm) { setStatus({ type: 'error', msg: 'Passwords do not match.' }); return; }
    setLoading(true);
    setStatus(null);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setStatus({ type: 'error', msg: error.message }); return; }
    setDone(true);
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '6px',
    border: '1px solid rgba(212,175,55,0.25)', background: 'rgba(0,0,0,0.45)',
    color: 'rgba(235,220,190,0.9)', fontSize: '0.9rem', fontFamily: 'Georgia, serif',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{
        width: '100%', maxWidth: '380px', margin: '0 16px',
        background: 'linear-gradient(to bottom, rgba(28,16,6,0.98), rgba(14,8,3,0.98))',
        border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)', overflow: 'hidden',
      }}>
        <div style={{ padding: '28px 28px 8px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'rgba(212,175,55,0.45)', textTransform: 'uppercase', margin: '0 0 6px' }}>Account Security</p>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem', color: 'rgba(212,175,55,0.9)', fontWeight: 'normal', margin: 0 }}>Set New Password</h2>
        </div>

        {done ? (
          <div style={{ padding: '24px 28px 32px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(120,200,120,0.9)', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '20px' }}>
              Password updated successfully.
            </p>
            <button onClick={onClose} style={{ padding: '11px 32px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.45)', background: 'rgba(212,175,55,0.14)', color: 'rgba(212,175,55,0.95)', fontFamily: 'Cinzel, serif', fontSize: '0.88rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
              Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} maxLength={128} />
            <input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={{ ...inputStyle, borderColor: mismatch ? 'rgba(220,100,80,0.6)' : 'rgba(212,175,55,0.25)' }} maxLength={128} />

            {/* Live requirements */}
            {password && (
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
            {mismatch && <p style={{ fontSize: '0.7rem', color: 'rgba(220,100,80,0.9)', margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>Passwords do not match.</p>}
            {status && <p style={{ fontSize: '0.82rem', color: 'rgba(220,100,80,0.9)', margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>{status.msg}</p>}

            <button type="submit" disabled={loading || issues.length > 0 || mismatch} style={{ marginTop: '4px', padding: '13px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.45)', background: loading || issues.length ? 'rgba(212,175,55,0.06)' : 'rgba(212,175,55,0.14)', color: issues.length ? 'rgba(212,175,55,0.4)' : 'rgba(212,175,55,0.95)', fontFamily: 'Cinzel, serif', fontSize: '0.8rem', letterSpacing: '0.12em', cursor: loading || issues.length > 0 ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
