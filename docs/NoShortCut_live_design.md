# NoShortCut — Design System · Page Live Session

> Ce fichier documente toutes les décisions de design validées pour la page `/sessions/[id]/live`.
> Les mockups correspondants sont disponibles dans la conversation Claude du 9–10 juin 2026.
> Screenshots à placer dans `/docs/mockups/live/` pour référence visuelle.

---

## 1. Structure générale de la page

```
┌─────────────────────────────────┐
│  ✕ Quitter    ● ● ● ○ ○        │  ← Header : bouton quitter + dots progression
├─────────────────────────────────┤
│                                 │
│   [Contenu du bloc actuel]      │  ← Zone principale, scrollable
│                                 │
├─────────────────────────────────┤
│  [ ‹ Préc. ]  [ Bloc suivant › ]│  ← Navigation fixe en bas
└─────────────────────────────────┘
```

**Fond de page** : `#F6F5F1` (même que page aperçu)

---

## 2. Navigation

### Dots de progression
- Un dot par bloc dans la séance
- Dot passé : `background: #999`, taille `7×7px`
- Dot actif : `background: #111`, taille `16×7px`, `border-radius: 99px` (pill allongée)
- Dot à venir : `background: #D4D3CF`, taille `7×7px`
- Gap entre dots : `6px`

### Boutons de navigation
```
[ ‹ Préc. ]        [ Bloc suivant › ]
flex: 1            flex: 2
height: 42px       height: 42px
border-radius: 11px
border: 0.5px solid #E2E1DD   background: #111
background: white              color: white
color: #171717
```
- Le bouton Précédent est **désactivé** sur le premier bloc
- Le bouton Suivant devient **"Terminer la séance"** sur le dernier bloc

### Swipe mobile
- Swipe gauche → bloc suivant
- Swipe droite → bloc précédent

### Bouton Quitter
- Position : haut gauche, `✕ Quitter` ou icône `IconX`
- Style : discret, `font-size: 12px`, `color: #999`
- Au clic → confirmation : *"Quitter la séance ? Ta progression sera perdue."*
- Deux boutons : **Annuler** / **Quitter**
- Si localStorage actif : message alternatif *"Ta progression sera sauvegardée."*

### localStorage
- Clé : `live_session_{sessionId}` → index du bloc actuel
- Clé : `live_pct_{sessionId}_{blocId}_{setId}` → pourcentage modifié
- À la reprise : proposition de continuer là où on en était

---

## 3. Carte de bloc — structure commune

Chaque bloc est affiché dans une card blanche :

```
┌─────────────────────────────────┐
│ [TYPE]              [BADGE?]    │  ← Bandeau coloré (couleurs du design system)
├─────────────────────────────────┤
│ Titre du bloc                   │
│ Sous-titre (sets · timing · PR) │
│                                 │
│ [Contenu spécifique au type]    │
│                                 │
└─────────────────────────────────┘
```

**Border-radius card** : `11px`
**Border** : `0.5px solid #E2E1DD`
**Padding body** : `11px`

### Couleurs par type (inchangées)
| Type         | Couleur     | Hex       |
|--------------|-------------|-----------|
| warm up      | Amber       | `#EF9F27` |
| haltero      | Blue        | `#378ADD` |
| force        | Purple      | `#7F77DD` |
| conditioning | Coral       | `#D85A30` |
| gym          | Coral       | `#D85A30` |
| accessory    | Teal        | `#1D9E75` |

---

## 4. Bloc Force

### Layout des sets
- **Grille 2 colonnes** : quand les sets ont des charges différentes
- **Card pleine largeur** : quand plusieurs sets partagent la même fourchette

### Card set — grille 2 colonnes
```
┌────────────────┐
│ Set 1          │  ← set-label : 9px, #999
│ 5 reps         │  ← set-reps : 9px, #555, font-weight 500
│ 81 kg          │  ← set-weight : 14–15px, #171717, font-weight 700
│ 67,5%          │  ← set-pct : 9px, #888
│ + 2 box jumps  │  ← set-note : 8px, #888, italic (si instruction après set)
└────────────────┘
```
- Background normal : `#F0EFEB`
- Background modifié : `#EBF3FB` + crayon ✎ sur le pourcentage en `#378ADD`

### Card set — pleine largeur (fourchette)
```
┌──────────────────────────────────┐
│ Sets 1–3        52–56 kg         │
│ 2 reps          65–70%           │
└──────────────────────────────────┘
```
Layout horizontal : infos set à gauche, poids/% à droite.

### Fourchettes
- Notation avec tiret : `52–56 kg` / `65–70%`
- Le tiret signifie "au choix dans la fourchette" (≠ flèche qui signifierait progression)

### Modification de pourcentage
- Clic sur la card → input ou modal pour changer le %
- Recalcul automatique du poids affiché
- Indicateur visuel : fond bleu `#EBF3FB` + `✎` après le %
- Lien "Réinitialiser les %" : `10px`, `#378ADD`, aligné à droite, sous la grille
- Modifications stockées en `localStorage` uniquement (pas en BDD)

### Notes du coach
- Bouton "📋 Voir les notes" → popover/bulle
- Popover : `background: #FFFDF5`, `border: 0.5px solid #E8E0C0`, `border-radius: 8px`

### Sous-titre
```
[N] sets · Every [X:XX] · PR : [X] kg
```
- `font-size: 10px`, `color: #999`

### Charges indicatives
- Badge centré : `"* Charges indicatives"` en italique, `9px`, `#999`

---

## 5. Bloc Haltéro

Même base que Force avec ces différences :

### Titre de groupe = nom du mouvement
```
HIGH HANG POWER SNATCH · 2 REPS        ← mvt-group-title
```
- `font-size: 10px`, `font-weight: 700`, `color: #378ADD`
- `text-transform: uppercase`, `letter-spacing: 0.04em`
- Séparé par `divider-soft` (`0.5px solid #F0EFEB`) entre chaque mouvement

### Complexe
- Tag "Complexe — enchaîner sans poser" si `complex_id` identique
- Reps notées : `3+3 reps`, `2+2 reps`, `1+1 rep`

### Options (piloté par `option_number` en BDD)
```
[Option A — Speed Strength]     ← background: #FFF4E0, color: #C07A00
  Snatch Pull · 2 (1.1)
  [cards sets]

[Option B — Speed Endurance]    ← background: #F0EEFF, color: #7F77DD
  Power Snatch drop and go
  [cards sets]
```

### Sous-parties a / b / c
- Tag gris neutre : `background: #F0EFEB`, `color: #555`, `font-size: 10px`
- Chaque sous-partie a son propre timing affiché dans le tag
- Ex : `a. Activation — 3 sets · Every 1:30`

### Montée libre (pas de sets définis)
- "Free card" en pointillés : `border: 0.5px dashed #D4D3CF`, `background: #F6F5F1`
- Label : `"Charge libre — augmenter si reps parfaites"`
- Suggestion si disponible : `"Suggestion : 40 / 50 / 60 kg"`
- Badge RPE si renseigné : `background: #111`, `color: white`

---

## 6. Bloc Conditioning

### Sélecteur de catégorie
- **Pills** (pas dropdown) : Elite / RX / Inter / Scaled
- Pill active : `background: couleur du bloc`, `color: white`
- Pill inactive : `background: #F0EFEB`, `color: #555`
- Par défaut : catégorie du profil de l'athlète

### Format EMOM
```
Min. 1      10 Push Press          50 kg
Min. 2–3    8 Pull-ups             —
Min. 4      15 Box Jumps           60 cm
```
- Structure : `Min. X` à gauche | nom + reps au centre | charge à droite
- Format ligne : `[N] [Mouvement]` à gauche, charge à droite
- `—` si pas de charge

### Format AMRAP / For time
```
Set 1 · AMRAP 1:00    Max Power Snatch    85% du 3RM
```

### Informations affichées
- Durée totale + format (ex : `10 min · Every minute on the minute`)
- Nombre de rounds si AMRAP : `X rounds`

---

## 7. Écran de fin

```
┌─────────────────────────┐
│  ● ● ● ● ●  (tous done) │
│                         │
│        🏆               │
│   Séance terminée !     │
│  Beau travail aujourd'  │
│  hui. Repose-toi bien.  │
│                         │
│  [ Retour aux séances ] │
└─────────────────────────┘
```
- Icône trophée dans cercle noir `64×64px`
- Titre : `22px`, `font-weight: 700`
- Sous-titre : `14px`, `color: #888`
- Bouton : pleine largeur, `background: #111`, `height: 52px`, `border-radius: 16px`

---

## 8. Architecture des composants

```
app/sessions/[id]/live/
  page.tsx                ← Server Component
                            Query Supabase complète (tous les détails)
                            Passe Session à LiveClient

components/
  LiveClient.tsx          ← Client Component
                            useState : index bloc actuel
                            useState : modifications pourcentages
                            localStorage : progression + %
                            Gestion swipe + navigation + quitter

  LiveBlocWarmup.tsx      ← Rendu warm up (le plus simple)
  LiveBlocForce.tsx       ← Rendu force (grille sets, fourchettes, %)
  LiveBlocHaltero.tsx     ← Rendu haltéro (groupes mvt, complexes, options)
  LiveBlocCondi.tsx       ← Rendu conditioning (pills catégorie, EMOM/AMRAP)
  LiveBlocAccessory.tsx   ← Rendu accessory (similaire force, simplifié)
```

### Props LiveClient
```typescript
type LiveClientProps = {
  session: Session  // objet complet avec tous les blocs et détails
}
```

### Ordre de développement
1. `page.tsx` — fetch complet
2. `LiveClient.tsx` — navigation de base (dots + boutons + quitter)
3. `LiveBlocWarmup.tsx` — le plus simple
4. `LiveBlocForce.tsx` — sets + pourcentages
5. `LiveBlocHaltero.tsx` — groupes + complexes + options
6. `LiveBlocCondi.tsx` — pills + EMOM/AMRAP
7. `LiveBlocAccessory.tsx`

---

## 9. Cas particuliers validés

| Situation | Traitement |
|-----------|-----------|
| Sets avec même fourchette | Card pleine largeur |
| Instruction après chaque set | `set-note` en italique dans la card |
| Notes longues coach | Bouton "Voir les notes" → popover |
| Sous-parties a/b/c | Tags gris avec timing |
| Options A/B (limitant) | Tags colorés orange/violet |
| Montée libre sans sets | Free card en pointillés |
| AMRAP basé sur 3RM | `"X% du 3RM"` à droite |
| Pas de PR renseigné | Message + invitation à saisir |
| Complexe (complex_id) | Mouvements regroupés + tag "Complexe" |
