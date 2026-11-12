/* ============================================================
   UQ Context — menu contextuel intelligent
   Déclencheurs : clic droit (contextmenu) + appui long tactile.
   Items : action, danger, séparateur, label, sous-menu, slider.
   ============================================================ */

const CHEMINS = {
  copy: 'M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  edit: 'M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
  share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4m4-4v13',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  external: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m0-6L10 14',
  eye: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  lock: 'M6 11V8a6 6 0 0 1 12 0v3m-13 0h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z',
  star: 'm12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
  more: 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  arrowRight: 'M5 12h14m-6-6 6 6-6 6',
  check: 'M20 6 9 17l-5-5',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2-4.35-4.35',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
};

function icone(nom, size = 15) {
  const d = CHEMINS[nom] || CHEMINS.more;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
}

let menuOuvert = null;

function fermerMenu() {
  if (menuOuvert) { menuOuvert.remove(); menuOuvert = null; }
  document.removeEventListener('mousedown', fermerMenu, true);
  document.removeEventListener('contextmenu', fermerMenu, true);
  document.removeEventListener('scroll', fermerMenu, true);
}

function placer(menu, x, y) {
  // Flip intelligent : si pas de place à droite/dessous, on inverse.
  const r = menu.getBoundingClientRect();
  const vw = innerWidth, vh = innerHeight;
  let gx = x, gy = y;
  if (gx + r.width > vw - 8) gx = Math.max(8, vw - r.width - 8);
  if (gy + r.height > vh - 8) gy = Math.max(8, vh - r.height - 8);
  if (gx < 8) gx = 8;
  if (gy < 8) gy = 8;
  menu.style.left = gx + 'px';
  menu.style.top = gy + 'px';
}

function rendreItem(it, menu) {
  if (it.type === 'sep') {
    const s = document.createElement('div');
    s.className = 'uq-ctx-sep';
    return s;
  }
  if (it.type === 'label') {
    const l = document.createElement('div');
    l.className = 'uq-ctx-label';
    l.textContent = it.label;
    return l;
  }
  if (it.slider) {
    // Item slider : { label, slider:{min,max,val,unite?,onInput} }
    const s = it.slider;
    const w = document.createElement('div');
    w.className = 'uq-ctx-slider';
    w.innerHTML = `
      <div class="uq-ctx-slider-tete">
        <span>${it.label || ''}</span>
        <span class="uq-ctx-slider-val">${s.val}${s.unite || ''}</span>
      </div>
      <input type="range" class="uq-ctx-range" min="${s.min}" max="${s.max}" step="${s.step || 1}" value="${s.val}">`;
    const range = w.querySelector('.uq-ctx-range');
    const val = w.querySelector('.uq-ctx-slider-val');
    range.addEventListener('input', () => {
      const v = +range.value;
      val.textContent = v + (s.unite || '');
      s.onInput?.(v);
    });
    // Empêche la fermeture du menu pendant le drag
    w.addEventListener('mousedown', (e) => e.stopPropagation());
    return w;
  }

  const b = document.createElement('button');
  b.className = 'uq-ctx-item' + (it.danger ? ' danger' : '');
  b.innerHTML = `
    <span class="uq-ctx-ic">${icone(it.icone || 'more')}</span>
    <span>${it.label}</span>
    ${it.enfants ? '<span class="uq-ctx-fleche">' + icone('arrowRight', 13) + '</span>' : ''}`;

  if (it.enfants) {
    let sous = null;
    b.addEventListener('mouseenter', () => {
      if (sous) return;
      sous = document.createElement('div');
      sous.className = 'uq-ctx-sub';
      for (const e of it.enfants) sous.appendChild(rendreItem(e, menu));
      b.appendChild(sous);
      // Flip du sous-menu si déborde à droite
      const br = b.getBoundingClientRect(), sr = sous.getBoundingClientRect();
      if (br.right + sr.width > innerWidth - 8) sous.style.left = 'auto', sous.style.right = 'calc(100% + 6px)';
      // Si déborde en bas, aligner en bas
      if (br.top + sr.height > innerHeight - 8) {
        sous.style.top = 'auto';
        sous.style.bottom = '-8px';
      }
    });
    b.addEventListener('mouseleave', () => {
      // délai pour laisser le temps de viser le sous-menu
      setTimeout(() => { if (sous && !sous.matches(':hover') && !b.matches(':hover')) { sous.remove(); sous = null; } }, 200);
    });
  } else if (it.action) {
    b.addEventListener('click', () => { fermerMenu(); it.action(); });
  }
  return b;
}

/** Ouvre le menu contextuel à (x,y) avec les items donnés. */
export function ouvrirContexte(x, y, items) {
  fermerMenu();
  const menu = document.createElement('div');
  menu.className = 'uq-ctx-menu';
  for (const it of items) menu.appendChild(rendreItem(it, menu));
  document.body.appendChild(menu);
  menuOuvert = menu;
  placer(menu, x, y);
  // Fermer au clic ailleurs / scroll / échap
  setTimeout(() => {
    document.addEventListener('mousedown', fermerMenu, true);
    document.addEventListener('contextmenu', fermerMenu, true);
    document.addEventListener('scroll', fermerMenu, true);
    document.addEventListener('keydown', echap);
  }, 0);
}

function echap(e) { if (e.key === 'Escape') fermerMenu(); }

/**
 * Attache un menu contextuel intelligent à un élément.
 * Déclencheurs : clic droit + appui long (~450ms tactile).
 * @param {Element|string} cible
 * @param {Array} items  ex: [{label:'Copier',icone:'copy',action:fn},
 *                            {label:'Danger',danger:true,...},
 *                            {type:'sep'},
 *                            {type:'label',label:'Actions'},
 *                            {label:'Volume',enfants:[{label:'...',slider...}]}]
 * @param {object} opts { appuiLong:true, clicDroit:true }
 */
export function attacherContexte(cible, items, opts = {}) {
  const el = typeof cible === 'string' ? document.querySelector(cible) : cible;
  if (!el) return null;
  const { appuiLong = true, clicDroit = true } = opts;
  let timer = null, hint = null, depart = null;

  const ouvrir = (x, y, e) => {
    e?.preventDefault?.();
    ouvrirContexte(x, y, typeof items === 'function' ? items(el) : items);
  };

  // Clic droit
  if (clicDroit) {
    el.addEventListener('contextmenu', (e) => { e.preventDefault(); ouvrir(e.clientX, e.clientY, e); });
  }

  // Appui long tactile
  if (appuiLong) {
    el.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      depart = { x: t.clientX, y: t.clientY };
      hint = document.createElement('div');
      hint.className = 'uq-ctx-hint';
      hint.style.left = t.clientX + 'px';
      hint.style.top = t.clientY + 'px';
      document.body.appendChild(hint);
      timer = setTimeout(() => {
        hint?.remove(); hint = null;
        // Vibrate si dispo (tactile)
        navigator.vibrate?.(30);
        ouvrir(t.clientX, t.clientY, e);
      }, 450);
    }, { passive: true });
    const annuler = () => {
      clearTimeout(timer); timer = null;
      hint?.remove(); hint = null;
    };
    el.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (depart && Math.hypot(t.clientX - depart.x, t.clientY - depart.y) > 12) annuler();
    }, { passive: true });
    el.addEventListener('touchend', annuler);
    el.addEventListener('touchcancel', annuler);
  }
  return { fermer: fermerMenu, ouvrir: (x, y) => ouvrirContexte(x, y, typeof items === 'function' ? items(el) : items) };
}

/** Attache le menu par défaut sur tout le document (démonstration). */
export function menuGlobal(defautItems) {
  return attacherContexte(document.body, defautItems || [
    { label: 'Rechercher', icone: 'search', action: () => UQNotify?.toast?.('Recherche…', { categorie: 'technique' }) },
    { label: 'Partager', icone: 'share', action: () => {} },
    { label: 'Copier', icone: 'copy', action: () => document.execCommand?.('copy') },
    { type: 'sep' },
    { type: 'label', label: 'Zone sensible' },
    { label: 'Verrouiller', icone: 'lock', danger: true, action: () => {} },
  ]);
}

window.UQContexte = { ouvrir: ouvrirContexte, attacher: attacherContexte, fermer: fermerMenu };
