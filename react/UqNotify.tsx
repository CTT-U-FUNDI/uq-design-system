// UQ Notify — équivalent React des popups/toasts du design system.
// Les styles viennent de css/uq-notify.css (importé via uq-glass.css).
import { useEffect, useState, type ReactNode } from 'react';
import { UqIcon } from './UqIcon';

export type UqTon = 'succes' | 'info' | 'patience' | 'attention' | 'danger' | 'service';
export type UqCategorie =
  | 'familier' | 'amical' | 'technique' | 'scientifique' | 'entreprise' | 'commercial';

const ICONES: Record<UqTon, string> = {
  succes: 'check', info: 'info', patience: 'clock',
  attention: 'alert', danger: 'shield', service: 'heart',
};

export interface UqNotifProps {
  ton?: UqTon;
  titre?: string;
  message: string;
  detail?: string;
  spin?: boolean;
  bouton?: string;
  /** false = toast non bloquant en bas d'écran */
  bloquant?: boolean;
  duree?: number;
  onClose?: () => void;
}

/** Popup système centré — arrière-plan flouté. */
export function UqPopup({
  ton = 'info', titre, message, detail, spin, bouton = 'OK',
  onClose,
}: UqNotifProps) {
  const [visible, setVisible] = useState(true);
  const fermer = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 180);
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === 'Escape') fermer(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!visible) return null;
  return (
    <div className={`uq-notif-overlay${visible ? '' : ' uq-notif-out'}`}>
      <div className={`uq-notif-card uq-notif-${ton} uq-anim-pop`} role="alertdialog">
        <div className="uq-notif-icone">
          {spin ? <span className="uq-notif-spin" /> : <UqIcon name={ICONES[ton]} size={24} />}
        </div>
        {titre && <div className="uq-notif-titre">{titre}</div>}
        <div className="uq-notif-message">{message}</div>
        {detail && <div className="uq-notif-detail">{detail}</div>}
        <button className="uq-notif-btn" onClick={fermer}>{bouton}</button>
      </div>
    </div>
  );
}

/** Toast non bloquant — s'efface seul. */
export function UqToast({ ton = 'info', message, duree = 4200, onClose }: UqNotifProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    const k = setTimeout(() => setVisible(false), duree);
    const fin = setTimeout(() => onClose?.(), duree + 300);
    return () => { cancelAnimationFrame(t); clearTimeout(k); clearTimeout(fin); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={`uq-toast${visible ? ' uq-toast-in' : ''}`}>
      <span className={`uq-toast-icone uq-toast-${ton}`}>
        <UqIcon name={ICONES[ton]} size={18} />
      </span>
      <span className="uq-toast-msg">{message}</span>
    </div>
  );
}

/** Hook pratique : queue de notifications. */
export function useUqNotify() {
  const [file, setFile] = useState<UqNotifProps[]>([]);
  const montrer = (n: UqNotifProps) => setFile((f) => [...f, n]);
  const fermer = (i: number) => setFile((f) => f.filter((_, j) => j !== i));
  const ui: ReactNode = file.map((n, i) =>
    n.bloquant === false
      ? <UqToast key={i} {...n} onClose={() => fermer(i)} />
      : <UqPopup key={i} {...n} onClose={() => fermer(i)} />,
  );
  return {
    montrer,
    succes: (message: string, o?: Partial<UqNotifProps>) => montrer({ ton: 'succes', message, ...o }),
    attention: (message: string, o?: Partial<UqNotifProps>) => montrer({ ton: 'attention', message, ...o }),
    danger: (message: string, o?: Partial<UqNotifProps>) => montrer({ ton: 'danger', message, ...o }),
    patience: (message: string, o?: Partial<UqNotifProps>) => montrer({ ton: 'patience', message, spin: true, ...o }),
    info: (message: string, o?: Partial<UqNotifProps>) => montrer({ ton: 'info', message, ...o }),
    service: (message: string, o?: Partial<UqNotifProps>) => montrer({ ton: 'service', message, ...o }),
    ui,
  };
}
