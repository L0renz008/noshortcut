# NoShortCut — Contexte projet complet

## Vue d'ensemble
App web **mobile-first** de suivi CrossFit/Weightlifting. Remplace un Google Sheets existant.
Coach : Lorenzo. Athlètes : Juju (RX), Carole (Inter), Lucas (RX), Jerome (Inter), Ivo (Elite).
Deux modes prévus : **athlète** (consultation séances + records) / **coach** (création séances + dashboard).

---

## Stack technique
- **Framework** : Next.js 15 (App Router)
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
  date DATE,
  week_number INT,   -- semaine du CYCLE coach, pas semaine ISO, saisie manuelle
  created_at TIMESTAMPTZ DEFAULT now()
)

blocs(
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  title TEXT,
  instructions TEXT,   -- nullable, fallback si pas de bloc_versions
  type TEXT CHECK (type IN ('Warm up','Haltéro','Force','Conditionning','Gym','Accessory')),
  format TEXT CHECK (format IN ('For time','AMRAP','EMOM','Tabata')),  -- nullable, uniquement pour blocs Conditioning
  order_index INT,
  created_at TIMESTAMPTZ DEFAULT now()
)

bloc_versions(
  id UUID PRIMARY KEY,
  bloc_id UUID REFERENCES blocs(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('Elite','RX','Inter','Scaled')) NOT NULL,
  instructions TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
)
-- Logique d'affichage : si bloc_versions existe → dropdown catégorie + affichage version
--                       si vide → afficher blocs.instructions directement

bloc_charges(
  id UUID PRIMARY KEY,
  bloc_id UUID REFERENCES blocs(id),
  user_id UUID REFERENCES users(id),
  set_number_start INT,
  set_number_end INT,
  reps INT,
  movement TEXT,
  percentage_min FLOAT,
  percentage_max FLOAT,
  charge_kg FLOAT,   -- nullable
  created_at TIMESTAMPTZ DEFAULT now()
)
-- Utilisé uniquement pour Haltéro et Force avec pourcentages du PR

records(
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  movement TEXT,
  weight_kg FLOAT,
  date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

**Permissions actuelles (temporaires)** : GRANT SELECT + policy `USING(true)` sur `users`, `sessions`, `blocs`. À restreindre après auth.

**Données de test** : 6 users + 4 sessions semaine 22 (26-29 mai 2026, week_number: 3) + blocs associés.

---

## Types TypeScript (`types/index.ts`)

```typescript
export type BlocVersion = {
  id: string;
  bloc_id: string;
  category: "Elite" | "RX" | "Inter" | "Scaled";
  instructions: string;
};

export type Bloc = {
  id: string;
  title: string;
  type: string;
  format: "For time" | "AMRAP" | "EMOM" | "Tabata" | null;
  instructions: string | null;
  order_index: number;
  versions: BlocVersion[];
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
```
"use client"
usePathname + useRouter depuis next/navigation
Tabs : [Séances /, Records /records, Profil /profil]
Actif = pathname === href
onClick sur chaque tab : if (pathname === tab.href) router.push(tab.href)
  → force remontage du composant et reset useState
```

### `components/Header.tsx`
Pas de "use client". Mois = `new Date().toLocaleDateString('fr-FR', {month:'long', year:'numeric'}).toUpperCase()`. User mocké `{name:'Lorenzo'}`. Avatar rond initiale + IconBell.

### `components/WeekStrip.tsx`
```typescript
type WeekStripProps = {
  today: Date;
  sessionDates: string[];
  selectedDate: string;
  onDaySelect: (date: string) => void;
}
const JOURS = ["D","L","M","M","J","V","S"] // hors composant

// Calcul lundi : diff = day===0 ? -6 : 1-day
// Génère 7 jours via boucle for
// isSelected = dateStr === selectedDate  (style actif)
// onClick={() => onDaySelect(dateStr)} sur chaque jour
// Point sous le chiffre si hasSession
// <hr> intégré en fin de composant
```

### `components/SessionCard.tsx`
```typescript
type SessionCardProps = { session: Session | undefined }
// Si undefined → "Rien de planifié aujourd'hui"
// Sinon → card noire, date formatée, pills types blocs
// Enveloppée dans <Link href={`/sessions/${session.id}`}>
```

### `components/HomeClient.tsx`
```
"use client"
useState(todayStr) → selectedDate
selectedSession = sessions.find(s => s.date === selectedDate)
sessionDates = sessions.map(s => s.date)
Rend : <Header/> <WeekStrip/> <SessionCard/>
```

### `app/page.tsx`
```
Server Component async
Calcule lundi/dimanche → fetch sessions+blocs sur la semaine
Passe sessions[] + todayStr à HomeClient
```

### `app/sessions/[id]/page.tsx`
Route dynamique créée. Récupère l'id via :
```typescript
export default async function SessionPage({ params }: { params: { id: string } }) {
  const { id } = await params
  // fetch à venir
}
```

---

## Design system — Couleurs par type de bloc

| Type | Couleur principale | Usage |
|------|-------------------|-------|
| Warm up | `#EF9F27` (amber) | Header band |
| Haltéro | `#378ADD` (blue) | Header band |
| Force | `#7F77DD` (purple) | Header band |
| Conditioning | `#D85A30` (coral) | Header band |
| Gym | `#D85A30` (coral) | Header band |
| Accessory | `#1D9E75` (teal) | Header band |

Badge semi-transparent sur header coloré : `background: rgba(0,0,0,0.18)`

---

## Design décidé — Page `/sessions/[id]` (aperçu)

**Direction visuelle** : Fusion Option 1 (épurée) + Option 3 (sections colorées)

Chaque carte de bloc :
- **Header coloré** (couleur selon type) avec nom du type en blanc + badge optionnel (EMOM / For time / Optionnel)
- **Corps blanc** avec titre du bloc + résumé gris petit + chevron →
- Border radius : 11px, border : 0.5px solid #E8E8E4

Structure globale de la page :
```
← Séances (retour)

[Date grande]
[Semaine X · N blocs]

[Card Warm up]
[Card Haltéro]
[Card Force]
[Card Conditioning + badge EMOM]
[Card Accessory + badge Optionnel]

[Bouton noir "Commencer la séance" →]
```

---

## Vision — Mode live `/sessions/[id]/live`

Navigation bloc par bloc avec :
- Barre de progression en haut (2/5, etc.)
- Affichage d'un seul bloc à la fois
- Bouton "Bloc suivant" en bas
- Message de fin quand tous les blocs sont passés
- **Blocs Force/Haltéro** : tableau des sets avec charges calculées depuis le PR de l'athlète + pourcentages
- **Blocs Conditioning** : dropdown catégorie (Elite/RX/Inter/Scaled) si bloc_versions existe
- **Modification des pourcentages** : ajustement local/visuel uniquement (localStorage), ne modifie pas la BDD
- **Mémorisation de la progression** : localStorage pour reprendre où on en était

---

## Décisions techniques figées

1. `week_number` = semaine cycle coach, saisie manuelle
2. `instructions` nullable dans blocs (fallback si pas de bloc_versions)
3. `bloc_charges` uniquement pour Haltéro/Force avec % — charges fixes dans `blocs.instructions`
4. `<hr>` séparateur intégré dans WeekStrip
5. `"Semaine X"` : `px-4` sur `<p>` uniquement
6. Server Component fetch + Client Component état = pattern systématique
7. `bloc_versions` pour gérer les versions par catégorie (Elite/RX/Inter/Scaled) des blocs Conditioning
8. `format` dans blocs pour typer les WODs ('For time', 'AMRAP', 'EMOM', 'Tabata')
9. Couleurs par type de bloc définies et figées (voir tableau ci-dessus)

---

## Tâches — Ordre de priorité

1. **Coder `/sessions/[id]`** (aperçu) — design validé ✓
2. **Peupler la BDD** avec de vraies séances
3. **Coder `/sessions/[id]/live`** — mode séance bloc par bloc
4. **Supabase Auth** — connexion athlètes + coach
5. **Policies RLS** par utilisateur
6. **Page `/records`**
7. **Mode coach** — dashboard + création séance
8. **Déploiement Vercel**

---

## Profil apprenant

Niveau : débutant/intermédiaire — Mac Apple Silicon, VS Code, Git + terminal.

### Concepts maîtrisés
Props, déstructuration, `export default`, `"use client"`, Server vs Client Components, sérialisation JSON Server→Client, `useState` (théorie + pratique), `useEffect`, `usePathname`, `useRouter`, `router.push()`, `.map()/.find()/.includes()`, ternaire, `??`, types TS (`type`, cast `as`, `|undefined`, union types), algorithme calcul lundi semaine, manipulation Date JS, jointures + filtres Supabase, GRANT + RLS, `next/font`, routes dynamiques `[id]`, `params` dans Server Components, passage de fonctions en props (`onDaySelect: (date:string)=>void`), `Link` vs `router.push`.

### Pas encore enseigné
`useParams`, `useSearchParams`, Supabase Auth, RLS avancée, gestion formulaires, optimistic updates, `localStorage`, `useContext`, déploiement Vercel.

### Instructions pédagogiques
- Toujours expliquer **avant** de coder
- Le faire coder lui-même — donner des indications, pas le code complet
- Valider ce qui est bien avant de corriger
- Poser une question de réflexion avant chaque nouveau concept
- Corriger avec précision quand il partage son code
- Il anticipe bien les problèmes, pose de bonnes questions
- Attention : garde parfois du code de test — vérifier propreté du code
- Aime : le "pourquoi", les schémas textuels, voir le résultat visuel, les mockups
