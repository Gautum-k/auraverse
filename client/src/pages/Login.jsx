import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context';

export default function Login() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { login, register } = useApp();
  const [isRegister, setIsRegister] = useState(params.get('mode') === 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [genre, setGenre] = useState('Indie Pop');
  const [city, setCity] = useState('Chennai');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register({ name, email, password, genre, city });
      } else {
        await login({ email, password });
      }
      nav('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <svg width="40" height="40" viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="16" r="14" fill="#1ed760" />
            <path d="M8 12c5-2 11-1.5 16 1.2M9 17c4-1.5 9-1 13 1M11 21.5c3-.9 6-.6 9 .7" stroke="#000" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </svg>
        </Link>
        <h1>{isRegister ? 'Sign up to start collaborating' : 'Log in to Auraverse'}</h1>
        
        {error && (
          <div className="auth-error" style={{ color: '#ff5555', backgroundColor: '#2a1515', padding: '10px 14px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          {isRegister && (
            <>
              <div className="field">
                <label htmlFor="n">Artist or display name</label>
                <input id="n" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nila Raj" />
              </div>
              <div className="field">
                <label htmlFor="g">Primary genre</label>
                <input id="g" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Indie Pop, Lo-fi, Hip-hop" />
              </div>
              <div className="field">
                <label htmlFor="c">City</label>
                <input id="c" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Chennai, Kochi, Bengaluru" />
              </div>
            </>
          )}
          <div className="field">
            <label htmlFor="e">Email address</label>
            <input id="e" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <div className="field">
            <label htmlFor="p">Password</label>
            <input id="p" type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="pill green full" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="switch">
          {isRegister ? 'Already have an account?' : 'Don’t have an account?'}{' '}
          <button className="link" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Log in here' : 'Sign up for Auraverse'}
          </button>
        </p>
      </div>
    </div>
  );
}
