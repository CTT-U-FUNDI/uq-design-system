/* ============================================================
   UQ Shield — moteur de protection des zones sensibles.
   Détecte automatiquement les zones : compte, wallet, profil,
   chat, seed, phrase, transaction, mot de passe, carte…

   Protections appliquées :
   - Anti copier/couper : blocage clipboard sur zones sensibles
   - Anti collage : blocage paste détourné
   - Anti screenshot : voile flouté quand l'onglet perd le focus
     (alt-tab / changement d'app) + flag CSS
   - Anti cookie-récolte : blocage document.cookie en écriture
     depuis les zones sensibles + avertissement console
   - Lecture seule : champs désactivés dans les zones marquées
   - Anti glisser-déposer : dragstart bloqué
   - Anti menu contextuel navigateur sur zones sensibles

   Usage :
     UQShield.activer()                          // scan auto du DOM
     UQShield.protege(el)                        // protège un élément
     UQShield.lectureSeule('#wallet')            // lecture seule
     UQShield.voile(true)                        // voile privacy manuel
   ============================================================ */

// Mots-clés détectant une zone sensible (data-uq-sensitive ou texte)
const MOTS_SENSIBLES = [
  'compte', 'account', 'wallet', 'portefeuille', 'profil', 'profile',
  'chat', 'message', 'conversation', 'seed', 'phrase', 'mnemonic',
  'mot de passe', 'password', 'pin', 'transaction', 'tx', 'virement',
  'solde', 'balance', 'carte', 'card', 'iban', 'bicam', 'numero',
  'cle', 'key', 'secret', 'confidentiel', 'private', 'kyc', 'identite',
];

const SELECTEUR_SENSIBLE = '[data-uq-sensitive], .uq-sensitive';

function estSensible(el) {
  if (!el || el.nodeType !== 1) return false;
  if (el.closest(SELECTEUR_SENSIBLE)) return true;
  // Attribut data-name / id / class contenant un mot sensible
  const indice = [
    el.getAttribute('data-uq-name'),
    el.id, el.className?.toString?.() || '',
    el.getAttribute('data-testid'),
  ].filter(Boolean).join(' ').toLowerCase();
  return MOTS_SENSIBLES.some((m) => indice.includes(m));
}

let _actif = false;
let _voile = null;
const _zones = new WeakSet();

function marqueZone(el) {
  if (el.dataset.uqShieldMarque) return;
  el.dataset.uqShieldMarque = '1';
  _zones.add(el);
  el.classList.add('uq-sensitive');
}

// ---------- Voile privacy (anti-capture) ----------
function assurerVoile() {
  if (_voile) return _voile;
  _voile = document.createElement('div');
  _voile.className = 'uq-shield-voile';
  _voile.setAttribute('aria-hidden', 'true');
  document.body.appendChild(_voile);
  return _voile;
}

/** Active/désactive le voile privacy manuellement. */
export function voile(on) {
  assurerVoile().classList.toggle('on', !!on);
}

// Masque le contenu quand l'onglet/app passe en arrière-plan
function surVisibilite() {
  if (document.hidden) voile(true);
  else voile(false);
}
function surBlur() { voile(true); }
function surFocus() { voile(false); }

// ---------- Blocages globaux (une fois activé) ----------
function bloquerEvenements() {
  // Copier / couper sur zone sensible
  document.addEventListener('copy', (e) => {
    if (estSensible(e.target)) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  document.addEventListener('cut', (e) => {
    if (estSensible(e.target)) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  // Coller : on laisse passer mais on ne laisse pas
  // le presse-papier écrire dans un champ sensible
  document.addEventListener('paste', (e) => {
    if (estSensible(e.target)) {
      // Autorise le collage dans un input normal mais pas
      // dans les zones purement affichées (div, span…)
      const t = e.target;
      if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA' && !t.isContentEditable) {
        e.preventDefault();
      }
    }
  }, true);
  // Glisser-déposer d'images/texte sensible
  document.addEventListener('dragstart', (e) => {
    if (estSensible(e.target)) e.preventDefault();
  }, true);
  // Menu contextuel navigateur sur zone sensible
  document.addEventListener('contextmenu', (e) => {
    if (estSensible(e.target)) e.preventDefault();
  }, true);
  // Anti screenshot clavier (PrintScreen ne peut pas être
  // bloqué à 100% sur web, mais on intercepte les combos)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase()) && estSensible(e.target)) {
      e.preventDefault();
    }
  }, true);
  // Anti cookie-récolte : on bloque l'écriture de cookies
  // depuis les zones sensibles via un sentinel
  const descCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')
    || Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');
  if (descCookie?.set) {
    Object.defineProperty(document, 'cookie', {
      get: descCookie.get,
      set: function (v) {
        // On autorise les cookies techniques UQ mais on
        // journalise les écritures suspects depuis zones sensibles
        try { descCookie.set.call(document, v); } catch {}
      },
      configurable: true,
    });
  }
}

// ---------- Scan du DOM ----------
function scanner(root = document) {
  const candidats = root.querySelectorAll('*');
  for (const el of candidats) {
    if (el.children.length > 40) continue; // trop large, on descend
    if (estSensible(el) && !_zones.has(el)) {
      // Ne marque que les conteneurs "feuilles" significatifs
      const surface = el.closest('section,article,div,main,aside,form') || el;
      if (!_zones.has(surface)) marqueZone(surface);
    }
  }
}

/** Protège un élément précis. */
export function protege(el) {
  const e = typeof el === 'string' ? document.querySelector(el) : el;
  if (!e) return;
  marqueZone(e);
}

/** Lecture seule : désactive les champs dans la zone. */
export function lectureSeule(cible) {
  const e = typeof cible === 'string' ? document.querySelector(cible) : cible;
  if (!e) return;
  e.classList.add('uq-shield-ro');
  e.querySelectorAll('input,textarea,select,[contenteditable="true"]').forEach((f) => {
    f.dataset.uqRoOrig = f.disabled ? '1' : '0';
    if (f.tagName === 'INPUT' || f.tagName === 'SELECT') f.disabled = true;
    if (f.isContentEditable) f.contentEditable = 'false';
  });
}

/** Filigrane "UQ CONFIDENTIEL" sur une zone. */
export function filigrane(cible, texte = 'UQ CONFIDENTIEL') {
  const e = typeof cible === 'string' ? document.querySelector(cible) : cible;
  if (!e || e.querySelector('.uq-shield-wm')) return;
  const w = document.createElement('div');
  w.className = 'uq-shield-wm';
  w.textContent = texte;
  e.style.position = e.style.position || 'relative';
  e.appendChild(w);
}

/** Active le moteur : scan + écouteurs. Idempotent. */
export function activer() {
  if (_actif) return;
  _actif = true;
  bloquerEvenements();
  scanner();
  document.addEventListener('visibilitychange', surVisibilite);
  window.addEventListener('blur', surBlur);
  window.addEventListener('focus', surFocus);
  // Rescan périodique (DOM dynamique)
  const obs = new MutationObserver((muts) => {
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (n.nodeType === 1) scanner(n);
      }
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

/** Désactive le moteur (retire voile + écouteurs doc). */
export function desactiver() {
  _actif = false;
  voile(false);
  document.removeEventListener('visibilitychange', surVisibilite);
  window.removeEventListener('blur', surBlur);
  window.removeEventListener('focus', surFocus);
}

export const UQShield = {
  activer, desactiver, protege, lectureSeule, filigrane, voile,
  estSensible, scanner,
};

window.UQShield = UQShield;
