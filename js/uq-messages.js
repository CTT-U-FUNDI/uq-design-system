/* ============================================================
   UQ Messages — banque de messages par défaut
   Catégories : familier, amical, technique, scientifique,
   entreprise, commercial.
   Tons : succes, info, patience, attention, danger, service.
   Chaque appel pioche une variante — jamais le même message
   deux fois de suite pour un même contexte.
   ============================================================ */

const BANQUE = {
  // ---- familier : ton proche, phrases simples ----
  familier: {
    succes: [
      'C\u2019est bon, c\u2019est fait !',
      'Parfait, tout est en ordre.',
      'Voilà, c\u2019est réglé.',
      'Nickel, on peut continuer.',
    ],
    info: [
      'Petit point rapide avant de continuer.',
      'On avance doucement, pas de souci.',
      'Voici où on en est.',
    ],
    patience: [
      'On patiente deux secondes, ça arrive.',
      'Ça charge, respire un coup.',
      'Presque, encore un tout petit effort.',
    ],
    attention: [
      'Attention ici, on vérifie bien.',
      'Un détail à ne pas rater.',
      'Stop un instant — relis ça.',
    ],
    danger: [
      'Oups, quelque chose cloche.',
      'Là ça coince, on regarde ensemble.',
      'Pas glop — cette action est refusée.',
    ],
    service: [
      'On s\u2019occupe de tout, t\u2019inquiète.',
      'C\u2019est notre boulot, on gère.',
      'On est là pour ça.',
    ],
  },

  // ---- amical : chaleureux, encourageant ----
  amical: {
    succes: [
      'Bravo, étape validée !',
      'Super, on avance bien.',
      'Bien joué, continue comme ça.',
      'Tout est parfait de ton côté.',
    ],
    info: [
      'Petit rappel au passage.',
      'On y est presque, courage.',
      'Voici l\u2019étape suivante.',
    ],
    patience: [
      'On prend le temps de bien faire.',
      'Un peu de patience, ça vaut le coup.',
      'Le serveur réfléchit, on attend gentiment.',
    ],
    attention: [
      'Petite vigilance de rigueur.',
      'Avant de cliquer, vérifie ça.',
      'On reste prudents, c\u2019est mieux.',
    ],
    danger: [
      'Hmm, cette fois ça résiste.',
      'On a un pépin — on regarde ça ensemble.',
      'Refusé pour ta sécurité, désolé.',
    ],
    service: [
      'On est là si tu bloques.',
      'N\u2019hésite pas, on t\u2019aide.',
      'Besoin d\u2019un coup de main ? On est là.',
    ],
  },

  // ---- technique : précis, sobre ----
  technique: {
    succes: [
      'Opération confirmée.',
      'Requête traitée avec succès.',
      'État : OK.',
    ],
    info: [
      'Traitement en cours.',
      'État système nominal.',
      'Paramètre appliqué.',
    ],
    patience: [
      'Latence réseau détectée — nouvelle tentative.',
      'File d\u2019attente : traitement différé.',
      'Timeout approaching — please wait.',
    ],
    attention: [
      'Valeur hors plage attendue.',
      'Entrée non conforme au schéma.',
      'Session proche de l\u2019expiration.',
    ],
    danger: [
      'Erreur interne — code journalisé.',
      'Requête rejetée par le garde-fou.',
      'Intégrité compromise : accès refusé.',
    ],
    service: [
      'Correctif appliqué côté serveur.',
      'Support technique notifié.',
      'Repli automatique activé.',
    ],
  },

  // ---- scientifique : neutre, factuel ----
  scientifique: {
    succes: [
      'Résultat conforme aux attentes.',
      'Mesure enregistrée.',
      'Hypothèse validée.',
    ],
    info: [
      'Observation : état stable.',
      'Donnée acquise avec succès.',
      'Paramètre dans la plage nominale.',
    ],
    patience: [
      'Échantillonnage en cours.',
      'Convergence du calcul…',
      'Latence de mesure — nouvelle passe.',
    ],
    attention: [
      'Écart-type anormal détecté.',
      'Valeur à la limite du seuil.',
      'Anomalie statistique signalée.',
    ],
    danger: [
      'Hypothèse rejetée.',
      'Divergence détectée — arrêt préventif.',
      'Condition d\u2019erreur : rollback engagé.',
    ],
    service: [
      'Calibration appliquée.',
      'Compensation automatique activée.',
      'Étalonnage terminé.',
    ],
  },

  // ---- entreprise : institutionnel, fiable ----
  entreprise: {
    succes: [
      'Votre demande a été enregistrée.',
      'Opération complétée avec succès.',
      'Dossier validé et archivé.',
    ],
    info: [
      'Votre dossier est en cours de traitement.',
      'Information mise à jour avec succès.',
      'Statut actuel : conforme.',
    ],
    patience: [
      'Traitement en cours — délai estimé sous peu.',
      'Votre demande est en file d\u2019attente prioritaire.',
      'Veuillez patienter, votre dossier avance.',
    ],
    attention: [
      'Vérification requise avant poursuite.',
      'Attention : pièce justificative manquante.',
      'Ce point nécessite une validation.',
    ],
    danger: [
      'Demande refusée — motif communiqué.',
      'Conformité : accès non autorisé.',
      'Votre compte est temporairement restreint.',
    ],
    service: [
      'Notre équipe traite votre demande.',
      'Support client mobilisé pour vous.',
      'Un conseiller prend le relais.',
    ],
  },

  // ---- commercial : valorisant, orienté offre ----
  commercial: {
    succes: [
      'Excellente nouvelle ! C\u2019est confirmé.',
      'Parfait — votre accès est activé.',
      'Félicitations, tout est prêt.',
    ],
    info: [
      'Découvrez ce qui vous attend.',
      'Une opportunité s\u2019ouvre à vous.',
      'Voici ce qui vient de se passer.',
    ],
    patience: [
      'Un instant, on prépare quelque chose de bien.',
      'Encore un tout petit effort…',
      'Ça charge, mais ça en vaut la peine.',
    ],
    attention: [
      'Offre à durée limitée.',
      'Vérifiez avant de valider.',
      'Cette option a des conditions.',
    ],
    danger: [
      'Hmm, cette option n\u2019est pas disponible.',
      'Impossible pour le moment — réessayez.',
      'Refusé : cette action est verrouillée.',
    ],
    service: [
      'Profitez-en, on s\u2019occupe de tout.',
      'Votre satisfaction est notre priorité.',
      'On vous facilite la vie, toujours.',
    ],
  },
};

// Historique pour éviter les répétitions
const _dernier = new Map();

/**
 * Message aléatoire pour (catégorie, ton).
 * @param {'familier'|'amical'|'technique'|'scientifique'|'entreprise'|'commercial'} categorie
 * @param {'succes'|'info'|'patience'|'attention'|'danger'|'service'} ton
 */
export function messageUQ(categorie, ton) {
  const cat = BANQUE[categorie] || BANQUE.amical;
  const liste = cat[ton] || cat.info;
  const cle = categorie + ':' + ton;
  let i;
  do { i = Math.floor(Math.random() * liste.length); }
  while (liste.length > 1 && liste[i] === _dernier.get(cle));
  _dernier.set(cle, liste[i]);
  return liste[i];
}

/** Alias court : messageUQ('amical','succes') → 'Bravo, étape validée !' */
export const UQ_MESSAGES = BANQUE;
