# Guide d'intégration

## React + Vite

```bash
npm install @uq/design-system
```

`src/styles.css` :
```css
@import '@uq/design-system/css/uq-glass.css';
```

`Icon.tsx` local (si besoin d'alias) :
```tsx
export { Icon, UqIcon } from '@uq/design-system/react/UqIcon';
```

## Site statique

Copier `css/uq-glass.css` + `<link>` dans le HTML.

## Android / iOS natif

- Couleurs : `tokens/uq-tokens.json`
- Icônes : reprendre les `PATHS` de `react/UqIcon.tsx` dans
  `react-native-svg` ou SF Symbols équivalents.
- Touch targets : respecter `metrics.touchMin = 44`.

## Checklist avant de livrer une UI

- [ ] Glassmorphism cohérent (blur + liseré dégradé)
- [ ] Boutons ≥ 54 px de haut, retour visuel au press
- [ ] Inputs ≥ 54 px
- [ ] Aucune emoji — SVG only
- [ ] Dégradé rouge/bleu/violet sur les actions principales
- [ ] Safe-area respectée en bas (nav mobile)
