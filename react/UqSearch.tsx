// UQ Search — composant React : barre pill + suggestions temps réel
// + écran plein + icône IA à bordure animée.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { UqIcon, type UqTone } from './UqIcon';

export interface UqResultat {
  titre: string;
  sous_titre?: string;
  description?: string;
  icone?: string;
  ton?: UqTone;
  tags?: string[];
  onSelect?: () => void;
}

/** Icône IA — anneau conic animé rouge→bleu→violet. */
export function UqIA({ size = 38, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`uq-ia ${size <= 32 ? 'uq-ia-sm' : ''} ${className}`} style={{ width: size, height: size }}>
      <span className="uq-ia-in">
        <UqIcon name="spark" size={Math.round(size * 0.52)} tone="gradient" />
      </span>
    </span>
  );
}

interface BarreProps {
  placeholder?: string;
  valeur?: string;
  onChange?: (v: string) => void;
  onSubmit?: (v: string) => void;
  suggestions?: UqResultat[];
  onSelectSuggestion?: (r: UqResultat) => void;
  autoFocus?: boolean;
}

/** Barre de recherche pill — suggestions en dropdown. */
export function UqSearchBar({
  placeholder = 'Rechercher sur UQ…',
  valeur, onChange, onSubmit,
  suggestions = [], onSelectSuggestion, autoFocus,
}: BarreProps) {
  const [interne, setInterne] = useState(valeur ?? '');
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const v = valeur ?? interne;

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOuvert(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const taper = (v: string) => {
    if (valeur === undefined) setInterne(v);
    onChange?.(v);
    setOuvert(true);
    setActif(-1);
  };

  const valider = (r?: UqResultat) => {
    if (r) { onSelectSuggestion?.(r); setOuvert(false); return; }
    onSubmit?.(v);
    setOuvert(false);
  };

  const surCle = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActif((a) => Math.min(a + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActif((a) => Math.max(a - 1, -1)); }
    else if (e.key === 'Enter') { e.preventDefault(); valider(suggestions[actif] ?? undefined); }
    else if (e.key === 'Escape') setOuvert(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div className="uq-search">
        <span className="uq-search-ic"><UqIcon name="search" size={19} /></span>
        <input
          value={v}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={(e) => taper(e.target.value)}
          onFocus={() => setOuvert(true)}
          onKeyDown={surCle}
        />
        {v && (
          <button className="uq-search-clear" onClick={() => { taper(''); }} aria-label="Effacer">
            <UqIcon name="x" size={15} />
          </button>
        )}
        <button className="uq-search-go" onClick={() => valider()} aria-label="Rechercher">
          <UqIcon name="arrow-right" size={17} />
        </button>
      </div>
      {ouvert && suggestions.length > 0 && (
        <div className="uq-search-suggest">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className={`uq-suggest-item${i === actif ? ' actif' : ''}`}
              onMouseEnter={() => setActif(i)}
              onClick={() => valider(s)}
            >
              <span className="uq-suggest-ic">
                <UqIcon name={s.icone || 'search'} size={17} tone={s.ton || 'blue'} />
              </span>
              <span className="uq-suggest-texte">
                <span className="uq-suggest-titre">{s.titre}</span>
                {s.sous_titre && <div className="uq-suggest-sub">{s.sous_titre}</div>}
              </span>
              {i === 0 && <UqIA size={26} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Carte résultat avec score de triage. */
export function UqResultCard({ r, index = 0 }: { r: UqResultat & { score?: number }; index?: number }) {
  const score = r.score ?? 50;
  const cls = score >= 70 ? 'uq-score-haut' : score >= 35 ? 'uq-score-moyen' : 'uq-score-bas';
  return (
    <button className="uq-result-card" onClick={r.onSelect} style={{ animationDelay: `${index * 40}ms` }}>
      <span className="uq-result-ic">
        <UqIcon name={r.icone || 'file'} size={20} tone={r.ton || 'current'} />
      </span>
      <span className="uq-result-corps">
        <span className="uq-result-titre">{r.titre}</span>
        {r.description && <div className="uq-result-desc">{r.description}</div>}
      </span>
      <span className={`uq-result-score ${cls}`}>{score}%</span>
    </button>
  );
}

/** Écran de recherche plein écran — titre + barre + résultats. */
export function UqSearchScreen({
  titre = 'Recherche <span class="uq-emph">UQ</span>',
  children, onFermer,
}: { titre?: string; children: ReactNode; onFermer?: () => void }) {
  return (
    <div className="uq-search-screen">
      <div className="uq-search-head">
        <span className="uq-search-title" dangerouslySetInnerHTML={{ __html: titre }} />
        <UqIA size={34} />
        {onFermer && (
          <button className="uq-search-close" onClick={onFermer} aria-label="Fermer">
            <UqIcon name="x" size={17} />
          </button>
        )}
      </div>
      <div className="uq-search-body">{children}</div>
    </div>
  );
}
