/* ============================================================
   UQ Search Engine — triage intelligent en temps réel.
   Chaque "moteur" est une source de données ; le moteur
   score et trie les résultats pendant que l'utilisateur tape.
   ============================================================ */

/**
 * Score un résultat face à une requête.
 * @param {string} requete
 * @param {object} item   { titre, sous_titre?, description?, tags?[] }
 * @returns {number} 0..100
 */
export function scorer(requete, item) {
  const q = requete.trim().toLowerCase();
  if (!q) return 50;
  const mots = q.split(/\s+/).filter(Boolean);
  const titre = (item.titre || '').toLowerCase();
  const sub = (item.sous_titre || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const tags = (item.tags || []).join(' ').toLowerCase();
  const corpus = titre + ' ' + sub + ' ' + tags + ' ' + desc;

  let score = 0;
  // Correspondance exacte du titre : très fort
  if (titre === q) score += 50;
  else if (titre.startsWith(q)) score += 34;
  else if (titre.includes(q)) score += 24;

  // Chaque mot de la requête trouvé quelque part
  let trouves = 0;
  for (const m of mots) {
    if (corpus.includes(m)) {
      trouves++;
      if (titre.includes(m)) score += 12;
      else if (sub.includes(m) || tags.includes(m)) score += 7;
      else score += 3;
    }
  }
  score += Math.round((trouves / mots.length) * 20); // couverture des mots

  // Préfixe de mot (ex: "bor" → "BORB")
  const motsTitre = titre.split(/\s+/);
  for (const m of mots) {
    if (motsTitre.some((w) => w.startsWith(m))) score += 6;
  }
  return Math.min(100, score);
}

/**
 * Trie une liste de résultats pour une requête, en temps réel.
 * @param {Array} items
 * @param {string} requete
 * @param {object} opts { seuil=10, max=20 }
 * @returns {Array} items annotés { score, _tri }
 */
export function trier(items, requete, { seuil = 10, max = 20 } = {}) {
  return items
    .map((it) => ({ ...it, score: scorer(requete, it) }))
    .filter((it) => it.score >= seuil || !requete.trim())
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}

/**
 * Moteur de recherche UQ : agrège plusieurs sources et re-trie.
 * Une "source" = { nom, icone?, chercher: async (q) => items[] }
 * ou une fonction sync. Le moteur fusionne et trie en continu.
 */
export class MoteurUQ {
  constructor(sources = []) {
    this.sources = sources; // [{ nom, icone, chercher }]
  }

  ajouter(source) { this.sources.push(source); }

  /**
   * Recherche multi-sources. Retourne les items triés avec
   * la source d'origine préservée.
   */
  async chercher(requete, { max = 30 } = {}) {
    const q = requete.trim();
    const resultats = [];
    await Promise.all(
      this.sources.map(async (src) => {
        try {
          const items = await src.chercher(q);
          for (const it of items) resultats.push({ ...it, _source: src.nom });
        } catch { /* une source en panne ne bloque pas les autres */ }
      }),
    );
    return trier(resultats, q, { max });
  }

  /** Suggestions rapides (titres seuls) pendant la frappe. */
  async suggerer(requete, { max = 6 } = {}) {
    const q = requete.trim();
    if (q.length < 2) return [];
    const items = await this.chercher(q, { max: max * 3 });
    // Déduplique par titre
    const vus = new Set();
    return items.filter((it) => {
      const k = it.titre.toLowerCase();
      if (vus.has(k)) return false;
      vus.add(k);
      return true;
    }).slice(0, max);
  }
}
