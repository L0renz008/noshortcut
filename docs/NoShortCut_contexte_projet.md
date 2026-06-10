# NoShortCut — Contexte projet complet

## Vue d'ensemble

App web **mobile-first** de suivi CrossFit/Weightlifting. Remplace un Google Sheets existant.
Coach : Lorenzo. Athlètes : Juju (RX), Carole (Inter), Lucas (RX), Jerome (Inter), Ivo (Elite).
Deux modes prévus : **athlète** (consultation séances + records) / **coach** (création séances + dashboard).

---

## Stack technique

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS + Shadcn/ui (thème Luma)
- **Base de données** : Supabase (PostgreSQL + Auth)
- **Déploiement** : Vercel
- **Icônes** : @tabler/icons-react (outline uniquement, jamais -filled)
- **Police** : Geist (next/font)

---

## Conventions de code

- `export default function` pour tous les composants
- Types centralisés dans `types/index.ts`
- Constantes statiques déclarées **hors** des fonctions composants
- `"use client"` uniquement si hooks ou interactivité
- PascalCase pour composants et fichiers, camelCase pour variables
- Les objets `Date` ne survivent pas à la sérialisation Server→Client JSON → toujours passer des `string` (ex: `todayStr: string`)
- BDD : tout en minuscules, le formatage (majuscules, etc.) se gère côté frontend

---

## Schéma BDD Supabase (état actuel — revu en profondeur)

```sql
users(
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  category TEXT CHECK (category IN ('Elite','RX','Inter','Scaled')),
  role TEXT CHECK (role IN ('athlete','coach')),
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT now()
)

sessions(
  id UUID PRIMARY KEY,
  date DATE,
  week_number INT,   -- semaine du CYCLE coach, saisie manuelle
  created_at TIMESTAMPTZ DEFAULT now()
)

movements(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  demo_url TEXT,
  category TEXT,               -- 'weightlifting','powerlifting','mobility','accessory','other' (pas de CHECK, valeurs libres)
  has_record BOOLEAN DEFAULT false,
  base_movement_id UUID REFERENCES movements(id),  -- auto-référentiel, pour hiérarchie snatch → power snatch → high hang power snatch
  created_at TIMESTAMPTZ DEFAULT now()
)

blocs(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  title TEXT,
  type TEXT,                   -- 'warm up','haltero','force','conditioning','gym','accessory'
  format TEXT,                 -- 'For time','AMRAP','EMOM','Tabata' — nullable, pour conditioning
  order_index INT,
  is_optional BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
)
-- Note : colonne instructions supprimée — remplacée par les tables spécialisées

bloc_warmup(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bloc_id UUID NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
  movement_id UUID REFERENCES movements(id),  -- nullable (notes libres sans mouvement)
  reps INT,
  unit TEXT,                   -- 'sec','m','cal' — null implicitement = reps
  order_index INT NOT NULL,
  notes TEXT,
  complex_id INT,              -- même valeur = mouvements enchaînés dans un complexe
  created_at TIMESTAMPTZ DEFAULT now()
)

bloc_strength(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bloc_id UUID NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
  movement_id UUID REFERENCES movements(id),
  set_number_start INT,
  set_number_end INT,
  reps INT,
  percentage_min FLOAT,        -- stocké en décimal : 0.65 = 65%
  percentage_max FLOAT,        -- nullable si un seul pourcentage
  rest_pattern TEXT,           -- 'Every 2:00', 'Every 3:00', 'rest as needed'
  notes TEXT,
  option_number INT,           -- nullable ; 1 ou 2 si sets avec options de programmation
  complex_id INT,              -- même valeur = mouvements en complexe (ex: 2 clean + 1 jerk)
  created_at TIMESTAMPTZ DEFAULT now()
)
-- Remplace bloc_charges. Pas de user_id ni charge_kg : charge calculée dynamiquement
-- côté TypeScript depuis records de l'athlète connecté × percentage

bloc_metcon(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bloc_id UUID NOT NULL REFERENCES blocs(id) ON DELETE CASCADE,
  duration_minutes INT,        -- nullable (calculé si connu : nb_rounds × rest_pattern)
  nb_rounds INT,               -- nullable pour AMRAP
  notes TEXT,                  -- coaching notes, design/intention
  created_at TIMESTAMPTZ DEFAULT now()
)

bloc_metcon_movements(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metcon_id UUID NOT NULL REFERENCES bloc_metcon(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('Elite','RX','Inter','Scaled')),  -- nullable si tout le monde fait pareil
  movement_id UUID REFERENCES movements(id),
  reps FLOAT,
  unit TEXT,                   -- null = reps, sinon 'cal','m','sec'
  load_kg FLOAT,               -- nullable
  order_index INT NOT NULL,
  notes TEXT,
  complex_id INT,
  created_at TIMESTAMPTZ DEFAULT now()
)

records(
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  movement TEXT,
  weight_kg FLOAT,
  date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

### Logique d'affichage par type de bloc

- **Warm up / Accessory** → `bloc_warmup`
- **Haltéro / Force** → `bloc_strength` (charges calculées : `records.weight_kg × percentage`)
- **Conditioning** → `bloc_metcon` + `bloc_metcon_movements` (filtre par `category` pour le dropdown)
- **complex_id** → côté TypeScript, grouper les lignes avec même `complex_id` et joindre avec `" + "`

### Cascade DELETE

Supprimer un `bloc` supprime automatiquement toutes ses lignes dans `bloc_warmup`, `bloc_strength`, `bloc_metcon` (et par cascade `bloc_metcon_movements`).

### Permissions actuelles (temporaires)

GRANT SELECT + policy `USING(true)` sur `users`, `sessions`, `blocs`. À restreindre après auth.

---

## Données de test

- 6 users historiques
- Sessions semaine 3 : 26-29 mai 2026 (`week_number: 3`)
- Sessions semaine 4 : 1, 2, 4 et 5 juin 2026 (`week_number: 4`)
- **Session du 1er juin 2026 entièrement peuplée** dans le nouveau schéma :
  - `warm up snatch` → bloc_warmup (mobilité + complexe snatch)
  - `strength - speed` → bloc_strength (Power Snatch, 12 sets every 2:00, avec option_number 1/2 pour sets 10-12)
  - `absolute strength` → bloc_strength (Back Squat, 6 sets every 3:00)
  - `strength endurance` → bloc_metcon (EMOM 15 min / 10 rounds, DB rows + bench press)
  - `strength accessory` → bloc_warmup (is_optional: true, GHD + side bents + medball slams)
- Table `movements` peuplée avec ~25 mouvements dont hiérarchie complète snatch (snatch → power snatch → high hang power snatch, etc.)

---

## Types TypeScript (`types/index.ts`) — À METTRE À JOUR

Le fichier actuel est **obsolète** — il référence `instructions` et `BlocVersion` qui n'existent plus. À réécrire lors de la prochaine session de code.

```typescript
-- ANCIEN (obsolète)
export type BlocVersion = { ... }  // table supprimée
export type Bloc = {
  instructions: string | null;     // colonne supprimée
  versions: BlocVersion[];         // table supprimée
}

-- À réécrire avec : BlocWarmup, BlocStrength, BlocMetcon, BlocMetconMovement
```

---

## Architecture de l'app

### Routing prévu

```
/                       → home (semaine + séance du jour)
/sessions/[id]          → aperçu séance + blocs (page en cours de design)
/sessions/[id]/live     → mode séance en cours, bloc par bloc
/athletes               → liste athlètes (coach only)
/athletes/[id]          → profil + records d'un athlète
/records                → records de l'athlète connecté
```

### Pattern Server / Client systématique

```
page.tsx (Server Component)
  → fetch Supabase
  → passe données + todayStr (string) à HomeClient

HomeClient.tsx (Client Component)
  → useState pour l'état local
  → passe données + callbacks aux composants enfants
```

---

## Composants existants

### `app/layout.tsx`

Geist, `max-w-md mx-auto`, `pb-20`, BottomNav inclus.

### `components/BottomNav.tsx`

`"use client"`, usePathname, tabs : [Séances /, Records /records, Profil /profil], Link.

### `components/Header.tsx`

Pas de "use client". Mois formaté FR. User mocké `{name:'Lorenzo'}`. Avatar + IconBell.

### `components/WeekStrip.tsx`

Props : `today: Date`, `sessionDates: string[]`, `selectedDate: string`, `onDaySelect: (date:string)=>void`.
Calcul lundi, 7 jours, point sous les jours avec session, `<hr>` intégré.

### `components/SessionCard.tsx`

Props : `session: Session | undefined`. Si undefined → message vide. Sinon → card noire, pills types blocs, Link vers `/sessions/${session.id}`.

### `components/HomeClient.tsx`

`"use client"`, useState(todayStr) → selectedDate. Rend Header + WeekStrip + SessionCard.

### `app/page.tsx`

Server Component. Fetch sessions + blocs de la semaine. Passe à HomeClient.

### `app/sessions/[id]/page.tsx`

**État actuel : partiellement cassé** — la query sélectionne `instructions` qui n'existe plus.

- Structure page OK : retour /, date formatée FR, "Semaine X · N blocs"
- Cartes colorées par type via `BLOC_TYPE_COLORS` (constante hors composant)
- Query à mettre à jour : retirer `instructions`, ajouter les tables spécialisées
- Bouton "Commencer la séance" → `/sessions/[id]/live` (pas encore codé)

---

## Design system — Couleurs par type de bloc

| Type         | Couleur   | Usage       |
| ------------ | --------- | ----------- |
| warm up      | `#EF9F27` | Header band |
| haltero      | `#378ADD` | Header band |
| force        | `#7F77DD` | Header band |
| conditioning | `#D85A30` | Header band |
| gym          | `#D85A30` | Header band |
| accessory    | `#1D9E75` | Header band |

Badge semi-transparent sur header coloré : `background: rgba(0,0,0,0.18)`

---

## Design décidé — Page `/sessions/[id]` (aperçu)

Chaque carte de bloc :

- Header coloré (couleur selon type) + badge optionnel (format ou "Optionnel")
- Corps blanc : titre + résumé gris + chevron →
- Border radius 11px, border 0.5px solid #E8E8E4

Résumés à calculer côté TypeScript :

- **warm up** : `"${bloc_warmup.length} mouvements"`
- **haltero/force** : `"${nb_sets} sets · ${rest_pattern}"` (nb_sets = nb lignes bloc_strength)
- **conditioning** : `"${duration_minutes} min · ${nb_mouvements} mouvements"`
- **accessory** : `"${bloc_warmup.length} exercices"`

Bouton noir "Commencer la séance →" en bas de page.

---

## Vision — Mode live `/sessions/[id]/live`

- Barre de progression (2/5 etc.)
- Un bloc à la fois, bouton "Bloc suivant"
- **Haltéro/Force** : tableau sets avec charges calculées (`records × percentage`)
- **Conditioning** : dropdown catégorie si plusieurs versions (category dans bloc_metcon_movements)
- **Ajustement pourcentages** : local uniquement via localStorage, ne modifie pas la BDD
- **Progression** : mémorisée en localStorage

---

## Prochaines tâches (ordre de priorité)

1. **Mettre à jour `types/index.ts`** — nouveaux types pour le schéma revu
2. **Mettre à jour la query dans `app/sessions/[id]/page.tsx`** — retirer instructions, ajouter tables spécialisées
3. **Finir le design de la page `/sessions/[id]`** — résumés calculés, bouton commencer
4. **Coder `/sessions/[id]/live`** — mode séance bloc par bloc
5. **Peupler d'autres séances de test** (semaine 3 et autres jours semaine 4)
6. **Supabase Auth** — connexion athlètes + coach
7. **RLS policies** par utilisateur
8. **Page `/records`**
9. **Mode coach** — dashboard + création séance (inclut UI pour option_number)
10. **Déploiement Vercel**

---

## Concepts maîtrisés (à jour)

Props, déstructuration, `export default`, `"use client"`, Server vs Client Components, sérialisation JSON Server→Client, `useState`, `useEffect`, `usePathname`, `useRouter`, `.map()/.find()/.includes()`, ternaire, `??`, types TS, routes dynamiques `[id]`, `params`, passage de fonctions en props, `Link` vs `router.push`, styles inline couleurs dynamiques, jointures Supabase imbriquées, GRANT + RLS, **normalisation BDD**, **tables de référence**, **intégrité référentielle + CASCADE**, **ALTER TABLE**, **subqueries imbriquées**, **UPDATE en masse**, **relation auto-référentielle**, **JSON vs relationnel**, **séparation des responsabilités**.

## Pas encore enseigné

`useParams`, `useSearchParams`, Supabase Auth, RLS avancée, gestion formulaires, optimistic updates, `localStorage`, `useContext`, déploiement Vercel.

## Instructions pédagogiques

- Toujours expliquer **avant** de coder
- Faire coder Lorenzo lui-même — indications, pas code complet
- Valider avant de corriger
- Question de réflexion avant chaque nouveau concept
- Il anticipe bien, pose de bonnes questions, a une vraie vision produit
- Attention : garde parfois du code de test — vérifier propreté
- Aime : le "pourquoi", les schémas textuels, les mockups, voir le résultat visuel
