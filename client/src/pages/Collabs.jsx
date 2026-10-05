import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { ROLES, genres } from '../data';
import Cover from '../components/Cover';
import Icon from '../components/Icon';

const blank = { title: '', role: ROLES[0], genre: genres[0].name, bpm: '', description: '' };

export default function Collabs() {
  const nav = useNavigate();
  const { collabs, addCollab, authorOf, interested, toggleInterest, user } = useApp();
  const [role, setRole] = useState('All');
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);

  const shown = role === 'All' ? collabs : collabs.filter((c) => c.role === role);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    addCollab({ ...form, bpm: Number(form.bpm) || 100 });
    setForm(blank);
    setOpen(false);
  };

  return (
    <div className="view" style={{ '--tint': 'hsl(28 40% 24%)' }}>
      <div className="page-head">
        <h1>Collab board</h1>
        <button className="pill green" onClick={() => (user ? setOpen((o) => !o) : nav('/login'))}>
          <Icon name="plus" size={18} /> Post a request
        </button>
      </div>

      {open && (
        <form className="panel-form" onSubmit={submit}>
          <div className="fields">
            <div className="field wide">
              <label htmlFor="ct">What are you working on?</label>
              <input id="ct" required value={form.title} onChange={set('title')} placeholder="Hook singer for a late-night hip-hop track" />
            </div>
            <div className="field">
              <label htmlFor="cr">Who do you need?</label>
              <select id="cr" value={form.role} onChange={set('role')}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
            </div>
            <div className="field">
              <label htmlFor="cg">Genre</label>
              <select id="cg" value={form.genre} onChange={set('genre')}>{genres.map((g) => <option key={g.name}>{g.name}</option>)}</select>
            </div>
            <div className="field">
              <label htmlFor="cb">Tempo (BPM)</label>
              <input id="cb" type="number" min="40" max="220" value={form.bpm} onChange={set('bpm')} placeholder="96" />
            </div>
            <div className="field wide">
              <label htmlFor="cd">Details</label>
              <textarea id="cd" rows="3" required value={form.description} onChange={set('description')} placeholder="What you already have, what you want from the other person, how credit is shared." />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="txt-btn" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="pill green">Post request</button>
          </div>
        </form>
      )}

      <div className="chips" role="tablist" aria-label="Filter by role">
        {['All', ...ROLES].map((r) => (
          <button key={r} role="tab" aria-selected={role === r} className={`chip${role === r ? ' on' : ''}`} onClick={() => setRole(r)}>{r}</button>
        ))}
      </div>

      {shown.length === 0 && <p className="empty">Nobody is looking for a {role.toLowerCase()} right now. Post a request to be the first.</p>}

      <div className="collab-list">
        {shown.map((c) => {
          const a = authorOf(c);
          const yes = interested.has(c.id);
          return (
            <article className="collab" key={c.id}>
              <div className="collab-cover"><Cover seed={c.id} hue={a.hue} /></div>
              <div className="collab-body">
                <h3>{c.title}</h3>
                <div className="collab-by">
                  {a.id === 'me' ? a.name : <Link to={`/artist/${a.id}`}>{a.name}</Link>} · {c.posted}
                </div>
                <p>{c.description}</p>
                <div className="tags">
                  <span>Needs a {c.role.toLowerCase()}</span><span>{c.genre}</span><span>{c.bpm} BPM</span>
                </div>
              </div>
              {a.id !== 'me' && (
                <button className={`pill ${yes ? 'outline' : 'white'}`} onClick={() => (user ? toggleInterest(c.id) : nav('/login'))}>
                  {yes ? <><Icon name="check" size={16} /> Interested</> : 'I’m interested'}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
