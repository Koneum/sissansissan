# Guide d'Implémentation du Dark/Light Mode avec Détection Système

## Objectif

Implémenter un système de thème qui :
1. ✅ Détecte automatiquement le thème du système (OS)
2. ✅ Permet à l'utilisateur de choisir manuellement (Light/Dark/System)
3. ✅ Persiste le choix de l'utilisateur
4. ✅ Fonctionne avec Tailwind CSS

---

## Étape 1: Installation de next-themes

```bash
npm install next-themes
```

---

## Étape 2: Créer le ThemeProvider

Créer `components/theme-provider.tsx` :

```tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

---

## Étape 3: Modifier app/layout.tsx

```tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Options expliquées

- `attribute="class"` : Utilise la classe `.dark` sur `<html>`
- `defaultTheme="system"` : Par défaut, suit le système
- `enableSystem` : Active la détection du thème système
- `disableTransitionOnChange` : Évite les animations lors du changement

---

## Étape 4: Créer le Toggle de Thème

Créer `components/theme-toggle.tsx` :

```tsx
"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## Étape 5: Ajouter le Toggle au Header

Dans `components/header.tsx` ou `components/navbar.tsx` :

```tsx
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16">
        <div>Logo</div>
        <nav>Navigation</nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {/* Autres boutons */}
        </div>
      </div>
    </header>
  )
}
```

---

## Étape 6: Vérifier les Couleurs Tailwind

Vos couleurs dans `app/globals.css` sont déjà configurées pour le dark mode :

```css
:root {
  --background: oklch(1 0 0);  /* Blanc */
  --foreground: oklch(0.145 0 0);  /* Noir */
  /* ... */
}

.dark {
  --background: oklch(0.145 0 0);  /* Noir */
  --foreground: oklch(0.985 0 0);  /* Blanc */
  /* ... */
}
```

✅ **Déjà configuré !** Pas besoin de modifications.

---

## Étape 7: Utiliser les Classes Dark Mode

Tailwind supporte automatiquement le dark mode avec le préfixe `dark:` :

```tsx
// Texte qui change de couleur
<p className="text-gray-900 dark:text-white">
  Texte adaptatif
</p>

// Background qui change
<div className="bg-white dark:bg-slate-900">
  Contenu
</div>

// Border qui change
<div className="border-gray-200 dark:border-slate-800">
  Contenu
</div>
```

---

## Exemples de Conversion

### Exemple 1: Card

```tsx
// ❌ AVANT
<div className="bg-white border border-gray-200 p-6 rounded-lg">
  <h3 className="text-gray-900 text-xl font-bold">Titre</h3>
  <p className="text-gray-600">Description</p>
</div>

// ✅ APRÈS
<div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-lg">
  <h3 className="text-gray-900 dark:text-white text-xl font-bold">Titre</h3>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

### Exemple 2: Button

```tsx
// ❌ AVANT
<button className="bg-blue-600 text-white hover:bg-blue-700">
  Click me
</button>

// ✅ APRÈS
<button className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600">
  Click me
</button>
```

### Exemple 3: Input

```tsx
// ❌ AVANT
<input className="border border-gray-300 bg-white text-gray-900" />

// ✅ APRÈS
<input className="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white" />
```

---

## Classes Utilitaires Communes

| Élément | Light | Dark |
|---------|-------|------|
| Background principal | `bg-white` | `dark:bg-slate-900` |
| Background secondaire | `bg-gray-50` | `dark:bg-slate-800` |
| Texte principal | `text-gray-900` | `dark:text-white` |
| Texte secondaire | `text-gray-600` | `dark:text-gray-400` |
| Border | `border-gray-200` | `dark:border-slate-800` |
| Hover background | `hover:bg-gray-100` | `dark:hover:bg-slate-800` |

---

## Composants UI à Vérifier

### 1. Composants Radix UI

Les composants de `components/ui/*` utilisent déjà les variables CSS :

```tsx
// ✅ Déjà configuré dans globals.css
<Button className="bg-primary text-primary-foreground">
  Button
</Button>
```

Les variables `--primary`, `--background`, etc. changent automatiquement avec `.dark`.

### 2. Composants Custom

Pour vos composants custom, ajoutez les classes `dark:` :

```tsx
<div className="bg-white dark:bg-slate-900">
  <h1 className="text-gray-900 dark:text-white">Titre</h1>
</div>
```

---

## Test du Dark Mode

### 1. Test Manuel

1. Cliquer sur le toggle de thème
2. Sélectionner "Light" → Vérifier l'apparence
3. Sélectionner "Dark" → Vérifier l'apparence
4. Sélectionner "System" → Changer le thème de votre OS

### 2. Test Système

**Windows 11** :
1. Paramètres → Personnalisation → Couleurs
2. Changer "Choisir votre mode" entre Clair/Sombre
3. L'app doit suivre automatiquement

**macOS** :
1. Préférences Système → Général → Apparence
2. Changer entre Clair/Sombre
3. L'app doit suivre automatiquement

### 3. Test Persistance

1. Choisir un thème (ex: Dark)
2. Rafraîchir la page (F5)
3. Le thème doit rester Dark

---

## Checklist de Migration

- [ ] Installer `next-themes`
- [ ] Créer `ThemeProvider`
- [ ] Modifier `app/layout.tsx`
- [ ] Créer `ThemeToggle`
- [ ] Ajouter le toggle au header
- [ ] Vérifier tous les composants UI
- [ ] Ajouter `dark:` aux composants custom
- [ ] Tester Light/Dark/System
- [ ] Tester la persistance
- [ ] Tester sur différents navigateurs

---

## Dépannage

### Le thème ne change pas

1. Vérifier que `suppressHydrationWarning` est sur `<html>`
2. Vérifier que `ThemeProvider` entoure tout le contenu
3. Vérifier que `attribute="class"` est défini

### Flash de contenu au chargement

Ajouter dans `app/layout.tsx` :

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      try {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      } catch (_) {}
    `,
  }}
/>
```

### Les couleurs ne changent pas

Vérifier que les variables CSS sont bien définies dans `globals.css` pour `:root` et `.dark`.

---

## Ressources

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
