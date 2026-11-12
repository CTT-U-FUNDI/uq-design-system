/* ============================================================
   UQ Notify — notifications système UQ
   Popup centré + arrière-plan flouté (backdrop blur).
   Toasts en bas pour les messages non bloquants.

   Usage :
     UQNotify.succes('operation', { categorie:'amical' })
     UQNotify.attention('Vérifie ta phrase', { detail:'...' })
     UQNotify.danger('Connexion refusée')
     UQNotify.custom({ titre, message, ton, categorie, bouton })
   ============================================================ */
import { messageUQ } from './uq-messages.js';

const TONS = {
  succes:   { icone: 'check',      css: 'uq-notif-succes' },
  info:     { icone: 'info',       css: 'uq-notif-info' },
  patience: { icone: 'clock',      css: 'uq-notif-patience' },
  attention:{ icone: 'alert',      css: 'uq-notif-attention' },
  danger:   { icone: 'shield',     css: 'uq-notif-danger' },
  service:  { icone: 'heart',      css: 'uq-notif-service' },
};

let _root = null;
function root() {
  if (!_root) {
    _root = document.createElement('div');
    _root.className = 'uq-notif-root';
    document.body.appendChild(_root);
  }
  return _root;
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

/** Icône SVG inline (chemins du design system). */
const ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4m0 4h.01"/>',
  shield: '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10z"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  spark: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
};
function icone(nom) {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[nom] || ICONS.info}</svg>`;
}

function displayIcone(ton, spin) {
  if (spin) return '<span class="uq-notif-spin"></span>';
  return icone(TONS[ton]?.icone || 'info');
}

/**
 * Popup système centré — flou arrière-plan, bloquant optionnel.
 * @returns {Promise<'ok'|'close'>}
 */
export function popupUQ({
  ton = 'info',
  titre = null,
  message = null,
  detail = null,
  categorie = 'amical',
  spin = false,
  bouton = 'OK',
  bloquant = true,
} = {}) {
  return new Promise((resolve) => {
    const t = TONS[ton] || TONS.info;
    const msg = message || messageUQ(categorie, ton);
    const wrap = el('div', 'uq-notif-overlay' + (bloquant ? ' uq-notif-bloquant' : ''));
    const card = el('div', `uq-notif-card ${t.css} uq-anim-pop`);
    card.innerHTML = `
      <div class="uq-notif-icone">${displayIcone(ton, spin)}</div>
      ${titre ? `<div class="uq-notif-titre">${titre}</div>` : ''}
      <div class="uq-notif-message">${msg}</div>
      ${detail ? `<div class="uq-notif-detail">${detail}</div>` : ''}
      <button class="uq-notif-btn">${bouton}</button>`;
    const btn = card.querySelector('.uq-notif-btn');
    const fermer = (r) => {
      wrap.classList.add('uq-notif-out');
      setTimeout(() => { wrap.remove(); resolve(r); }, 180);
    };
    btn.addEventListener('click', () => fermer('ok'));
    if (!bloquant) wrap.addEventListener('click', (e) => { if (e.target === wrap) fermer('close'); });
    wrap.appendChild(card);
    root().appendChild(wrap);
    btn.focus();
  });
}

/** Toast non bloquant — coin inférieur, disparaît seul. */
export function toastUQ({ ton = 'info', message = null, categorie = 'familier', duree = 4200 } = {}) {
  const t = TONS[ton] || TONS.info;
  const wrap = el('div', 'uq-toast');
  wrap.innerHTML = `
    <span class="uq-toast-icone ${t.css}">${displayIcone(ton)}</span>
    <span class="uq-toast-msg">${message || messageUQ(categorie, ton)}</span>`;
  root().appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('uq-toast-in'));
  setTimeout(() => {
    wrap.classList.remove('uq-toast-in');
    setTimeout(() => wrap.remove(), 300);
  }, duree);
}

/** Raccourcis par ton. */
export const UQNotify = {
  succes:   (msg, opt = {}) => popupUQ({ ton: 'succes', message: msg, ...opt }),
  info:     (msg, opt = {}) => popupUQ({ ton: 'info', message: msg, ...opt }),
  patience: (msg, opt = {}) => popupUQ({ ton: 'patience', message: msg, spin: true, ...opt }),
  attention:(msg, opt = {}) => popupUQ({ ton: 'attention', message: msg, ...opt }),
  danger:   (msg, opt = {}) => popupUQ({ ton: 'danger', message: msg, ...opt }),
  service:  (msg, opt = {}) => popupUQ({ ton: 'service', message: msg, ...opt }),
  toast:    (msg, opt = {}) => toastUQ({ message: msg, ...opt }),
  /** Message auto depuis la banque : UQNotify.auto('entreprise','succes') */
  auto:     (categorie, ton, opt = {}) => popupUQ({ ton, categorie, ...opt }),
};

window.UQNotify = UQNotify;
window.UQPopup = popupUQ;
