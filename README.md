# @uq/design-system

Design system officiel UQ — **une seule source de vérité** pour toutes les
interfaces : site UQ Platform, wallet BORB, apps Android/iOS, sites partenaires.

## Contenu

| Fichier | Usage |
|---|---|
| `css/uq-glass.css` | Thème complet glassmorphism noir (tokens + composants) |
| `tokens/uq-tokens.css` | Variables CSS seules (`--uq-*`) |
| `tokens/uq-tokens.json` | Tokens pour React Native / Swift / Android natif |
| `react/UqIcon.tsx` | Bibliothèque d'icônes SVG inline (aucun emoji) |

## Identité visuelle

- Fond noir profond `#07080d` + halos animés
- Glassmorphism : `backdrop-filter: blur(22px)`, cartes translucides
- Dégradé signature : **rouge `#ff4d6d` → bleu `#4d7cff` → violet `#8b5cf6`**
- Accent or `#f5b942` pour la finance
- Cibles tactiles ≥ 44 px (boutons 54 px, inputs 54 px, nav 56 px)
- Feedback press : scale + liseré violet

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
