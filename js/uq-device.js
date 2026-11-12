/* ============================================================
   UQ Device — moteur anti-appareil / anti-triche.
   Détecte : émulateur, root Android, jailbreak iOS, ADB,
   SSH actif, mode développeur, Frida/Xposed, devtools,
   webdriver, UA falsifié.

   RÈGLE D'OR : un appareil "à risque" n'est PAS banni — il
   exige une AUTORISATION EXPLICITE de l'application
   (UQDevice.autoriser) sinon les fonctions sensibles sont
   refusées. L'utilisateur garde la main.

   Usage :
     const r = UQDevice.analyser();
     if (!r.sain && !UQDevice.estAutorise()) {
       UQNotify.danger('Appareil non certifié', ...);
     }
     UQDevice.exiger();          // lève si non autorisé
     UQDevice.autoriser('sms');  // autorise une session
   ============================================================ */

const SEUIL_BLOQUANT = 60; // score >= → exige autorisation

// Globals injectés par les frameworks de triche (quand accessibles)
const GLOBALS_TRICHE = [
  'Frida', 'frida', 'Cydia', 'cydia', 'substrate', 'Substrate',
  'xposed', 'XposedBridge', 'magisk', 'Magisk', 'supersu',
  'Superuser', 'SuperSU', 'busybox', 'SSHD', 'Dropbear',
  '__REACT_DEVTOOLS_GLOBAL_HOOK__', // devtools React
];

const UA = navigator.userAgent || '';

function plateforme() {
  if (/android/i.test(UA)) return 'android';
  if (/iphone|ipad|ipod/i.test(UA)) return 'ios';
  if (/windows/i.test(UA)) return 'windows';
  if (/mac os/i.test(UA)) return 'macos';
  if (/linux/i.test(UA)) return 'linux';
  return 'inconnu';
}

/** Détecte les indices de triche côté navigateur. */
export function analyser() {
  const risques = [];
  let score = 0;
  const pf = plateforme();

  // --- Automatisation / webdriver ---
  if (navigator.webdriver) {
    risques.push({ code: 'WEBDRIVER', gravite: 'haute', detail: 'Navigateur piloté par automation (Selenium/WebDriver)' });
    score += 50;
  }

  // --- Headless / émulateur navigateur ---
  const headless = /HeadlessChrome|PhantomJS|SlimerJS/i.test(UA)
    || (!navigator.languages?.length)
    || (navigator.plugins?.length === 0 && pf === 'inconnu');
  if (headless) {
    risques.push({ code: 'HEADLESS', gravite: 'haute', detail: 'Navigateur headless ou sans plugins' });
    score += 45;
  }

  // --- Devtools ouvert (timing debugger) ---
  try {
    const t0 = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    const dt = performance.now() - t0;
    if (dt > 100) {
      risques.push({ code: 'DEVTOOLS', gravite: 'moyenne', detail: 'Console développeur ouverte' });
      score += 20;
    }
  } catch {}

  // --- Globals de triche injectés ---
  for (const g of GLOBALS_TRICHE) {
    try {
      if (window[g] !== undefined) {
        risques.push({ code: 'INJECTION_' + g.toUpperCase(), gravite: 'critique', detail: `Hook détecté : ${g}` });
        score += 55;
      }
    } catch {}
  }

  // --- Android : indices root/émulateur limités côté web ---
  if (pf === 'android') {
    // Émulateur : UA générique ou absence de modèle
    if (/sdk|emulator|generic/i.test(UA)) {
      risques.push({ code: 'EMU_ANDROID', gravite: 'moyenne', detail: 'UA Android générique (émulateur possible)' });
      score += 25;
    }
    // Impossible de lire /system ou su depuis le navigateur :
    // on marque explicitement comme "non vérifiable".
    risques.push({ code: 'ROOT_NON_VERIFIABLE', gravite: 'info', detail: 'Root Android non vérifiable en web — attestation native requise' });
  }

  // --- iOS : jailbreak non vérifiable côté web ---
  if (pf === 'ios') {
    risques.push({ code: 'JAILBREAK_NON_VERIFIABLE', gravite: 'info', detail: 'Jailbreak iOS non vérifiable en web — attestation native requise' });
  }

  // --- ADB / SSH / mode développeur : non accessibles depuis le navigateur ---
  risques.push({ code: 'ADB_SSH_NON_VERIFIABLE', gravite: 'info', detail: 'ADB/SSH/mode dev non détectables en web — nécessite module natif' });

  // --- UA incohérent (usurpation) ---
  const uaMobile = /mobile|android|iphone/i.test(UA);
  const ecran = Math.min(screen.width, screen.height);
  if (uaMobile && ecran > 1200) {
    risques.push({ code: 'UA_USURPE', gravite: 'moyenne', detail: 'UA mobile sur grand écran — usurpation possible' });
    score += 15;
  }
  if (!uaMobile && ecran < 500 && pf === 'inconnu') {
    risques.push({ code: 'UA_USURPE', gravite: 'faible', detail: 'Petit écran sans UA mobile' });
    score += 10;
  }

  // --- Permissions suspectes : popup bloquées = headless-like ---
  try {
    const perm = navigator.permissions?.query ? 'ok' : 'absent';
    if (perm === 'absent') score += 5;
  } catch {}

  score = Math.min(100, score);
  const sain = score < SEUIL_BLOQUANT && !risques.some((r) => r.gravite === 'critique');

  return {
    plateforme: pf,
    score,
    sain,
    exige_autorisation: !sain,
    risques,
    timestamp: Date.now(),
    note: 'Détection web best-effort — root/ADB/SSH exigent un module natif (Play Integrity / App Attest).',
  };
}

// ---------- Autorisation explicite ----------
const CLE_AUTO = 'uq_device_auth';

/**
 * L'application accorde une autorisation pour cet appareil.
 * @param {string} motif  pourquoi (ex: 'sms', 'wallet', 'kyc')
 * @param {number} dureeMinutes  durée de validité (défaut 480 = 8h)
 */
export function autoriser(motif = 'usage', dureeMinutes = 480) {
  const autorisation = {
    motif,
    debut: Date.now(),
    expire: Date.now() + dureeMinutes * 60_000,
    appareil: plateforme(),
    score: analyser().score,
  };
  try {
    sessionStorage.setItem(CLE_AUTO, JSON.stringify(autorisation));
  } catch {}
  // Journal local d'audit
  journaliser('autorisation', autorisation);
  return autorisation;
}

/** Vérifie si l'appareil est actuellement autorisé. */
export function estAutorise() {
  try {
    const a = JSON.parse(sessionStorage.getItem(CLE_AUTO) || 'null');
    return !!a && a.expire > Date.now();
  } catch { return false; }
}

/** Récupère l'autorisation courante (ou null). */
export function autorisation() {
  try {
    const a = JSON.parse(sessionStorage.getItem(CLE_AUTO) || 'null');
    return a && a.expire > Date.now() ? a : null;
  } catch { return null; }
}

/** Révoque l'autorisation. */
export function revoquer() {
  try { sessionStorage.removeItem(CLE_AUTO); } catch {}
  journaliser('revocation', { ts: Date.now() });
}

// ---------- Journal d'audit local ----------
const CLE_JOURNAL = 'uq_device_journal';
function journaliser(type, data) {
  try {
    const j = JSON.parse(localStorage.getItem(CLE_JOURNAL) || '[]');
    j.push({ type, ...data, ts: Date.now() });
    localStorage.setItem(CLE_JOURNAL, JSON.stringify(j.slice(-50)));
  } catch {}
}

/** Exige un appareil sain OU autorisé — sinon retourne le rapport. */
export function verifier() {
  const r = analyser();
  journaliser('analyse', { score: r.score, sain: r.sain });
  if (r.sain || estAutorise()) return { ok: true, rapport: r };
  return { ok: false, rapport: r };
}

/** Lève une erreur si non autorisé — pour bloquer les actions sensibles. */
export function exiger() {
  const v = verifier();
  if (!v.ok) {
    const err = new Error(
      `Appareil non certifié (score ${v.rapport.score}) — autorisation requise.`,
    );
    err.rapport = v.rapport;
    throw err;
  }
  return v.rapport;
}

/** Résumé lisible des risques pour affichage. */
export function resume(r = analyser()) {
  const critiques = r.risques.filter((x) => x.gravite === 'critique');
  const hautes = r.risques.filter((x) => x.gravite === 'haute');
  const autres = r.risques.filter((x) => !['critique', 'haute'].includes(x.gravite));
  return { critiques, hautes, autres, score: r.score, sain: r.sain };
}

export const UQDevice = {
  analyser, verifier, exiger, autoriser, revoquer,
  estAutorise, autorisation, resume,
};

window.UQDevice = UQDevice;
