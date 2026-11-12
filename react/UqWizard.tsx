// UQ Wizard — opérations en écrans numérotés.
// RèGLE : maximum 3 champs/opérations par écran.
// Chaque écran a un titre + un message de guide + optionnellement
// un encart "patience" pour les traitements longs.
import { type ReactNode } from 'react';
import { UqIcon } from './UqIcon';

export interface UqEtape {
  titre: string;
  guide?: string;          // message d'accompagnement de l'écran
  champs: ReactNode;       // MAX 3 champs/opérations
  patience?: string;       // message affiché pendant un long traitement
}

interface Props {
  etapes: UqEtape[];
  actif: number;                       // index 0-based de l'écran courant
  onSuivant?: () => void;
  onPrecedent?: () => void;
  onTerminer?: () => void;
  libelleSuivant?: string;
  libellePrecedent?: string;
  desactive?: boolean;                 // bloque Suivant (validation en cours)
  traitement?: boolean;                // affiche l'encart patience
}

export function UqWizard({
  etapes, actif, onSuivant, onPrecedent, onTerminer,
  libelleSuivant = 'Continuer', libellePrecedent = 'Retour',
  desactive = false, traitement = false,
}: Props) {
  const etape = etapes[actif];
  const dernier = actif === etapes.length - 1;
  if (!etape) return null;
  return (
    <div className="uq-wizard">
      <div className="uq-wizard-progress" aria-label={`Étape ${actif + 1} sur ${etapes.length}`}>
        {etapes.map((_, i) => (
          <span key={i} style={{ display: 'contents' }}>
            {i > 0 && <span className="uq-wizard-link" />}
            <span className={`uq-wizard-dot${i === actif ? ' actif' : ''}${i < actif ? ' fait' : ''}`}>
              <span>{i + 1}</span>
            </span>
          </span>
        ))}
      </div>
      <div className="uq-wizard-step" key={actif}>
        <div className="uq-wizard-step-title">{etape.titre}</div>
        {etape.guide && <div className="uq-wizard-step-guide">{etape.guide}</div>}
        <div className="uq-wizard-fields">{etape.champs}</div>
        {traitement && etape.patience && (
          <div className="uq-wizard-patience">
            <UqIcon name="clock" size={16} />
            <span>{etape.patience}</span>
          </div>
        )}
      </div>
      <div className="uq-wizard-nav">
        {actif > 0 && (
          <button className="btn btn-ghost" onClick={onPrecedent} disabled={desactive}>
            <UqIcon name="arrow-left" size={16} /> {libellePrecedent}
          </button>
        )}
        {dernier ? (
          <button className="btn btn-gold" onClick={onTerminer} disabled={desactive}>
            {desactive ? <span className="spin" /> : libelleSuivant}
          </button>
        ) : (
          <button className="btn btn-gold" onClick={onSuivant} disabled={desactive}>
            <UqIcon name="arrow-right" size={16} /> {libelleSuivant}
          </button>
        )}
      </div>
    </div>
  );
}
