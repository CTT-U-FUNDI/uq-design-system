# @uq/design-system

Design system officiel UQ — **une seule source de vérité** pour toutes les
interfaces : site UQ Platform, wallet BORB, apps Android/iOS, sites partenaires.

## Contenu

| Fichier | Usage |
|---|---|
| `css/uq-glass.css` | **Point d'entrée unique** — assemble tout |
| `css/uq-root.css` | Tokens + base (body, boutons, inputs) |
| `css/uq-glass.css` | Composants glass (cartes, boutons, formulaires) |
| `css/uq-borders.css` | Bordures fines colorées, glows, chips, dégradés |
| `css/uq-animations.css` | Keyframes : aurora, float, pulse, shimmer, pop |
| `css/uq-backgrounds.css` | Thèmes `.uq-theme-dark` / `.uq-theme-light` — fonds animés, arcs, fumée |
| `icons/uq-icons.svg` | Sprite SVG `<symbol>` — usage `<use href="#uq-home">` |
| `tokens/uq-tokens.css` | Variables CSS seules (`--uq-*`) |
| `tokens/uq-tokens.json` | Tokens pour React Native / Swift / Android natif |
| `react/UqIcon.tsx` | Icônes React — 72 icônes, tons colorés + style 3D |
| `react-native/uq-icons.ts` | Mêmes paths pour `react-native-svg` |
| `react/UqNotify.tsx` | Popups système centrés + toasts (React) |
| `react/UqWizard.tsx` | Wizard écrans numérotés — max 3 champs/écran |
| `js/uq-messages.js` | Banque de messages par catégorie/ton |
| `css/uq-motion.css` | Springs M3 Expressive + durées Fluent 2 + reduced-motion |
| `css/uq-materials.css` | Mica / Acrylic / Smoke + prefers-contrast |
| `css/uq-components2.css` | Loader, button-group, split-button, FAB menu, badges, typo |
| `css/uq-search.css` | Barre pill + suggestions + icône IA animée + écran recherche |
| `js/uq-search.js` | Moteur de triage intelligent multi-sources (scorer/trier/MoteurUQ) |
| `react/UqSearch.tsx` | UqSearchBar, UqResultCard, UqSearchScreen, UqIA |
| `css/uq-context.css` | Menu contextuel glass + sliders + voile shield |
| `js/uq-context.js` | Menu contextuel intelligent (clic droit + appui long) |
| `js/uq-shield.js` | Moteur anti-capture / anti-copier / lecture seule |
| `js/uq-device.js` | Anti-appareil : root/jailbreak/ADB/SSH/webdriver + autorisation |
| `js/uq-notify.js` | Moteur de notifications vanilla JS |

## Identité visuelle

- Fond noir profond `#07080d` + halos animés
- Glassmorphism : `backdrop-filter: blur(22px)`, cartes translucides
- Dégradé signature : **rouge `#ff4d6d` → bleu `#4d7cff` → violet `#8b5cf6`**
- Accent or `#f5b942` pour la finance
- Cibles tactiles ≥ 44 px (boutons 54 px, inputs 54 px, nav 56 px)
- Feedback press : scale + liseré violet
- Icônes : contours fins 1.8px, fond transparent, tons rouge/bleu/violet/or
  ou dégradé signature — variantes "3D" (cube, pièce, carte, gemme, fusée)
- Bordures : hairlines colorées 1px sans fond + liserés dégradés

## Utilisation — Web (Vite/React)

```tsx
// styles.css ou main.tsx
import '@uq/design-system/css/uq-glass.css';

// Composants
import { Icon, UqIcon } from '@uq/design-system/react/UqIcon';
```

## Utilisation — site statique / vanilla

```html
<link rel="stylesheet" href="uq-glass.css">
```

## Utilisation — mobile (React Native)

Importer `tokens/uq-tokens.json` et mapper les couleurs en `StyleSheet`.
Les icônes SVG (`UqIcon.tsx`) sont compatibles `react-native-svg` —
reprendre les paths `PATHS` tels quels.

## Règles

1. **Jamais d'emoji** dans l'UI — icônes SVG uniquement.
2. Toute nouvelle icôgle va dans `react/UqIcon.tsx` (source unique).
3. Les apps consomment ce package — ne pas dupliquer les styles.
4. Modifier ici = modifier partout après mise à jour des apps.
