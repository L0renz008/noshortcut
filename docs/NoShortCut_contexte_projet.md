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
- **Animation** : framer-motion (installé, utilisé dans LiveClient)

---

## Conventions de code

- `export default function` pour tous les composants
- Types centralisés dans `types/index.ts`
- Constantes statiques déclarées **hors** des fonctions composants
- `"use client"` uniquement si hooks ou interactivité
- PascalCase pour composants et fichiers, camelCase pour variables
- Les objets `Date` ne survivent pas à la sérialisation Server→Client JSON → toujours passer des `string`
- Fonctions utilitaires dans `utilityFunctions/utilityFunctions.ts`
- Navigation programmatique via `useRouter().push()`, pas de `<Link>` dans les handlers
- `useRef` pour les valeurs qui n'impactent pas le rendu (ex: touchStartX, direction)
- `useTransition` pour les navigations avec feedback de chargement

---

## Schéma BDD Supabase (état actuel)

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
  date DATE NOT NULL,
  week_number INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
)

blocs(
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('warm up','haltero','force','conditioning','gym','accessory')),
  format TEXT CHECK (format IN ('For time','AMRAP','EMOM')),  -- nullable
  order_index INT NOT NULL,
  is_optional BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
)

movements(
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  demo_url TEXT,
  category TEXT,
  has_record BOOLEAN DEFAULT false,
  base_movement_id UUID REFERENCES movements(id),  -- auto-référence pour variations
  created_at TIMESTAMPTZ DEFAULT now()
)

bloc_warmup(
  id UUID PRIMARY KEY,
  bloc_id UUID REFERENCES blocs(id) ON DELETE CASCADE,
  movement_id UUID REFERENCES movements(id),
  reps DOUBLE PRECISION,
  unit TEXT,
  order_index INT NOT NULL,
  notes TEXT,
  complex_id INT,
  created_at TIMESTAMPTZ DEFAULT now()
)

bloc_strength(
  id UUID PRIMARY KEY,
  bloc_id UUID REFERENCES blocs(id) ON DELETE CASCADE,
  movement_id UUID REFERENCES movements(id),
  set_number_start INT,
  set_number_end INT,
  reps INT,
  percentage_min DOUBLE PRECISION,
  percentage_max DOUBLE PRECISION,
  rest_pattern TEXT,
  notes TEXT,
  option_number INT,   -- null = pas d'option, 1 = option A, 2 = option B
  complex_id INT,
  created_at TIMESTAMPTZ DEFAULT now()
)

bloc_metcon(
  id UUID PRIMARY KEY,
  bloc_id UUID REFERENCES blocs(id) ON DELETE CASCADE,
  duration_minutes INT,
  nb_rounds INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

bloc_metcon_movements(
  id UUID PRIMARY KEY,
  metcon_id UUID REFERENCES bloc_metcon(id) ON DELETE CASCADE,
  movement_id UUID REFERENCES movements(id),
  category TEXT CHECK (category IN ('Elite','RX','Inter','Scaled')),
  reps DOUBLE PRECISION,
  unit TEXT,
  load_kg DOUBLE PRECISION,
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

**Permissions** : GRANT SELECT + policies `USING(true)` sur toutes les tables. À restreindre après auth.

**Données de test** :

- Sessions semaines 3 et 4 (mai–juin 2026)
- Session du 17 juin 2026 peuplée avec 5 blocs complets : warm up snatch, haltero strength-speed, force absolute strength, accessory strength endurance, accessory strength accessory (optional)

---

## Types TypeScript (`types/index.ts`)

```typescript
export type Movement = {
  id: string;
  name: string;
  demo_url: string | null;
  category: string | null;
  has_record: boolean | null;
  base_movement_id: string | null;
};

export type BlocWarmup = {
  id: string;
  reps: number | null;
  unit: string | null;
  order_index: number;
  notes: string | null;
  complex_id: number | null;
  movement: Movement | null;
};

export type BlocStrength = {
  id: string;
  set_number_start: number | null;
  set_number_end: number | null;
  reps: number | null;
  percentage_min: number | null;
  percentage_max: number | null;
  rest_pattern: string | null;
  notes: string | null;
  option_number: number | null;
  complex_id: number | null;
  movement: Movement | null;
};

export type BlocMetconMovement = {
  id: string;
  category: "Elite" | "RX" | "Inter" | "Scaled" | null;
  movement: Movement | null;
  reps: number | null;
  unit: string | null;
  load_kg: number | null;
  order_index: number;
  notes: string | null;
  complex_id: number | null;
};

export type BlocMetcon = {
  id: string;
  duration_minutes: number | null;
  nb_rounds: number | null;
  notes: string | null;
  bloc_metcon_movements: BlocMetconMovement[] | null;
};

export type Bloc = {
  id: string;
  title: string;
  type: "warm up" | "haltero" | "force" | "conditioning" | "gym" | "accessory";
  format: "For time" | "AMRAP" | "EMOM" | null;
  order_index: number;
  is_optional: boolean | null;
  bloc_warmup: BlocWarmup[] | null;
  bloc_strength: BlocStrength[] | null;
  bloc_metcon: BlocMetcon[] | null;
};

export type Session = {
  id: string;
  date: string;
  week_number: number;
  blocs: Bloc[];
};
```

---

## Architecture de l'app

### Routing

```
/                          → home (semaine + séance du jour)
/sessions/[id]             → aperçu séance + blocs ✅ FAIT
/sessions/[id]/live        → mode séance en cours, bloc par bloc 🚧 EN COURS
/athletes                  → liste athlètes (coach only)
/athletes/[id]             → profil + records d'un athlète
/records                   → records de l'athlète connecté
```

### Pattern Server / Client systématique

```
page.tsx (Server Component)
  → fetch Supabase
  → passe données sérialisées (strings, pas Date) au Client Component

XxxClient.tsx (Client Component)
  → useState pour l'état local
  → hooks (useRouter, useTransition, useRef...)
```

---

## Composants existants

### `app/layout.tsx`

Geist, `max-w-md mx-auto`, `pb-20`, BottomNav inclus.

### `components/BottomNav.tsx`

Tabs : [Séances /, Records /records, Profil /profil]. Actif = `pathname === href`.

### `components/Header.tsx`

Mois en français majuscule. User mocké `{name:'Lorenzo'}`. Avatar rond initiale + IconBell.

### `components/WeekStrip.tsx`

Semaine courante, 7 jours, point sous les jours avec session, `<hr>` intégré.

### `components/SessionCard.tsx`

Card noire, date formatée, pills types blocs dédupliqués via `Set` + `Array.from()`.
`key={type}` sur les pills (plus sémantique que `key={index}`).

### `components/HomeClient.tsx`

`useState(todayStr)` → selectedDate. Pattern Server/Client standard.

### `components/BlocCard.tsx`

Card blanche avec bandeau coloré par type, titre, chevron, badges format/optionnel.
`BLOC_TYPE_COLORS` déclaré hors composant. `capitalizeFirstLetter` pour le type.

### `components/DotPagination.tsx`

`Array.from({ length: total }, (_, i) => i).map(...)`.
Trois états : done (gris foncé), active (pill allongée noire), à venir (gris clair).
`transition-all duration-300` sur tous les dots.

### `components/LiveClient.tsx`

Client Component principal pour `/sessions/[id]/live`.

- `useState(0)` → currentIndex
- `useRef` → touchStartX, direction
- `useTransition` → isPending pour navigation quitter
- `useRouter` → navigation programmatique
- Swipe tactile : `onTouchStart` / `onTouchEnd`, seuil 50px
- `AlertDialog` Shadcn pour confirmation quitter
- `Spinner` Shadcn pendant isPending
- `framer-motion` installé mais animation carrousel abandonnée (trop de contraintes)
- Switch sur `bloc.type` prévu pour router vers les bons composants de blocs

### `app/sessions/[id]/page.tsx`

Query légère (sans détails des blocs). Tri par `order_index`. Utilise `BlocCard`.

### `app/sessions/[id]/live/page.tsx`

Query complète avec jointures imbriquées et alias `movement:movements(...)`.

---

## Queries Supabase

### Page aperçu `/sessions/[id]`

```typescript
.select(`id, date, week_number,
  blocs (id, title, type, order_index, format, is_optional)`)
.eq("id", id).single()
```

### Page live `/sessions/[id]/live`

```typescript
.select(`id, date, week_number,
  blocs (id, title, type, order_index, format, is_optional,
    bloc_warmup(bloc_id, reps, unit, order_index, notes, complex_id,
      movement:movements(id, name, demo_url, category, has_record)),
    bloc_strength(id, set_number_start, set_number_end, reps,
      percentage_min, percentage_max, rest_pattern, notes,
      option_number, complex_id,
      movement:movements(id, name, demo_url, category, has_record)),
    bloc_metcon(id, duration_minutes, nb_rounds, notes,
      bloc_metcon_movements(id, category, reps, unit, load_kg,
        order_index, notes, complex_id,
        movement:movements(id, name, demo_url, category, has_record))))`)
.eq("id", id).single()
```

**Note** : alias `movement:movements(...)` pour que le nom retourné corresponde aux types TS.

---

## Design system — Couleurs par type de bloc

| Type         | Couleur | Hex       |
| ------------ | ------- | --------- |
| warm up      | Amber   | `#EF9F27` |
| haltero      | Blue    | `#378ADD` |
| force        | Purple  | `#7F77DD` |
| conditioning | Coral   | `#D85A30` |
| gym          | Coral   | `#D85A30` |
| accessory    | Teal    | `#1D9E75` |

Badge semi-transparent sur header coloré : `background: rgba(0,0,0,0.18)`

---

## Décisions techniques figées

1. `week_number` = semaine cycle coach, saisie manuelle
2. `bloc_strength` utilisé pour Force **et** Haltéro (même structure)
3. `option_number` dans `bloc_strength` : null = pas d'option, 1 = option A, 2 = option B
4. `complex_id` dans les tables de détail : même valeur = mouvements à enchaîner
5. Alias Supabase `movement:movements(...)` pour les jointures vers la table `movements`
6. `as Session` assertion de type acceptée comme tradeoff pragmatique
7. Modifications de pourcentages en live → `localStorage` uniquement, pas en BDD
8. Swipe mobile : seuil 50px, `useRef` pour touchStartX et direction
9. Navigation quitter : `AlertDialog` + `useTransition` + `router.push()`
10. Animation carrousel framer-motion : **abandonnée** pour l'instant (trop de contraintes layout)
11. `allowedDevOrigins` dans `next.config.ts` pour tests mobile sur réseau local

---

## Tâches — Ordre de priorité

1. **`LiveBlocWarmup.tsx`** — affichage warm up avec complexes
2. **`LiveBlocForce.tsx`** — grille sets, fourchettes, modification %
3. **`LiveBlocHaltero.tsx`** — groupes mvt, complexes, options A/B
4. **`LiveBlocCondi.tsx`** — pills catégorie, EMOM/AMRAP
5. **`LiveBlocAccessory.tsx`** — similaire force, simplifié
6. **Écran de fin** dans LiveClient
7. **localStorage** — progression + pourcentages modifiés
8. **Supabase Auth** — connexion athlètes + coach
9. **Policies RLS** par utilisateur
10. **Page `/records`**
11. **Mode coach** — dashboard + création séance
12. **Déploiement Vercel**

---

## Profil apprenant

Niveau : débutant/intermédiaire — Mac Apple Silicon, VS Code, Git + terminal.

### Concepts maîtrisés

Props, déstructuration, `export default`, `"use client"`, Server vs Client Components,
sérialisation JSON Server→Client, `useState`, `useEffect`, `useRef`, `useTransition`,
`usePathname`, `useRouter`, `router.push()`, `.map()/.find()/.includes()`, ternaire,
`??`, types TS (type, cast `as`, union types, `Record<string,string>`),
`Array.from()`, `Set` pour déduplication, algorithme calcul lundi semaine,
manipulation Date JS, jointures + filtres Supabase, alias Supabase,
GRANT + RLS policies, routes dynamiques `[id]`, `params` async,
passage de fonctions en props, `Link` vs `router.push`,
framer-motion (AnimatePresence, motion.div, initial/animate/exit),
touch events (onTouchStart, onTouchEnd), AlertDialog Shadcn, Spinner Shadcn.

### Pas encore enseigné

`useParams`, `useSearchParams`, Supabase Auth, RLS avancée,
gestion formulaires, optimistic updates, `localStorage`, `useContext`,
déploiement Vercel, `useCallback`, `useMemo`.

### Instructions pédagogiques

- Toujours expliquer **avant** de coder
- Le faire coder lui-même — donner des indications, pas le code complet
- Valider ce qui est bien avant de corriger
- Poser une question de réflexion avant chaque nouveau concept
- Corriger avec précision quand il partage son code
- Il anticipe bien les problèmes, pose de bonnes questions
- Aime : le "pourquoi", les schémas textuels, voir le résultat visuel, les mockups
- Garde parfois du code de test — vérifier propreté du code
