import type { ReactNode } from 'react';

/**
 * UqPriceCard — carte pricing style Spaceship.
 * Prix 1re année vs renouvellement TOUJOURS visibles (transparence).
 */
export function UqPriceCard({
  tld,
  extension,
  prix1re,
  renouvellement,
  note,
  featured = false,
  cta,
  onCta,
}: {
  tld: string;
  extension: string;
  prix1re: string;
  renouvellement: string;
  note?: string;
  featured?: boolean;
  cta?: string;
  onCta?: () => void;
}) {
  return (
    <div className={`uq-price-card${featured ? ' featured' : ''}`}>
      <div className="uq-price-tld">
        {tld}
        <small>.{extension}</small>
      </div>
      <div className="uq-price-row">
        <span>1ʳᵉ année</span>
        <b>{prix1re}</b>
      </div>
      <div className="uq-price-row renew">
        <span>Puis renouvellement</span>
        <b>{renouvellement}/an</b>
      </div>
      {note && <div className="uq-price-note">{note}</div>}
      {cta && (
        <button className="uq-price-cta" onClick={onCta}>
          {cta}
        </button>
      )}
    </div>
  );
}

/** UqLaunchItem — tuile produit style launchpad Spaceship. */
export function UqLaunchItem({
  icone,
  nom,
  desc,
  onClick,
}: {
  icone: ReactNode;
  nom: string;
  desc?: string;
  onClick?: () => void;
}) {
  return (
    <button className="uq-launch-item" onClick={onClick} type="button">
      <span className="uq-launch-ico">{icone}</span>
      <span className="uq-launch-nom">{nom}</span>
      {desc && <span className="uq-launch-desc">{desc}</span>}
    </button>
  );
}
