import { hash } from '../data';
import { SERVER_BASE } from '../api';

export default function Cover({ seed = '', hue = 150, url = '', round = false, children }) {
  if (url) {
    const fullUrl = url.startsWith('/uploads') ? `${SERVER_BASE}${url}` : url;
    return (
      <div className={`cover${round ? ' round' : ''}`}>
        <img
          src={fullUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: round ? '50%' : 'inherit' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {children}
      </div>
    );
  }
  const h = hash(seed);
  const x = 18 + (h % 55);
  const y = 18 + ((h >> 4) % 55);
  const style = {
    background: [
      `radial-gradient(circle at ${x}% ${y}%, hsl(${(hue + 70) % 360} 85% 68%) 0 15%, transparent 16%)`,
      `radial-gradient(circle at ${100 - x}% ${100 - y}%, hsl(${(hue + 20) % 360} 70% 55% / .55) 0 32%, transparent 33%)`,
      `linear-gradient(145deg, hsl(${hue} 65% 42%), hsl(${(hue + 40) % 360} 55% 20%))`,
    ].join(','),
  };
  return (
    <div className={`cover${round ? ' round' : ''}`} style={style}>
      {children}
    </div>
  );
}
