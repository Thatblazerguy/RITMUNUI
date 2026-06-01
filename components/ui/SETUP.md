# Liquid Glass Component — React / shadcn / TypeScript Setup Guide

This document explains how to set up the project to run the `liquid-glass.tsx` and `demo.tsx` React components in a proper shadcn-compatible environment.

---

## Why `/components/ui`?

The `/components/ui` path is the **shadcn standard**. When you run `npx shadcn@latest add <component>`, the CLI automatically installs component files into this directory. Keeping your primitive, reusable UI blocks here means:

- The shadcn CLI can manage and update them.
- Your custom components like `liquid-glass.tsx` live alongside generated ones consistently.
- `@/components/ui` aliased imports work automatically with the default tsconfig path mapping.

---

## 1. Initialize a shadcn Project (from scratch)

```bash
# Create a new Next.js 14+ app
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Then initialize shadcn
npx shadcn@latest init
```

When prompted, select:
- Style: **Default**
- Base color: **Slate** (or your preference)
- CSS variables: **Yes**

This generates `components.json` which configures the component path.

---

## 2. Verify `/components/ui` Path in `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

> **Important**: The `"ui": "@/components/ui"` alias is what allows `import { Component } from "@/components/ui/liquid-glass"` to resolve correctly. Do NOT change this path.

---

## 3. Tailwind CSS Config

Ensure `tailwind.config.ts` includes the animation utilities needed:

```ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        moveBackground: {
          from: { backgroundPosition: "0% 0%" },
          to: { backgroundPosition: "0% -1000%" },
        },
      },
      animation: {
        "move-bg": "moveBackground 60s linear infinite",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
}
export default config
```

---

## 4. TypeScript Config (`tsconfig.json`)

Ensure path aliases are set up so `@/` resolves to your source root:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  }
}
```

---

## 5. Using the Component

After setup, copy `liquid-glass.tsx` into `src/components/ui/` and use it in any page:

```tsx
// src/app/page.tsx
import { Component } from "@/components/ui/liquid-glass";

export default function Home() {
  return <Component />;
}
```

Or use the demo wrapper:

```tsx
// src/app/demo/page.tsx
import { DemoOne } from "@/components/ui/demo";

export default function DemoPage() {
  return <DemoOne />;
}
```

---

## 6. Required Global CSS

Add the background animation keyframe to `src/app/globals.css`:

```css
@keyframes moveBackground {
  from { background-position: 0% 0%; }
  to   { background-position: 0% -1000%; }
}
```

---

## 7. SVG Filter Requirement

The `GlassEffect` component relies on `filter: url(#glass-distortion)`. The `GlassFilter` component must be rendered somewhere in the component tree **before** any `GlassEffect` wrapper is mounted. In the demo's `Component`, `<GlassFilter />` is already included at the top of the return tree.

If you use `GlassEffect` or `GlassDock` independently, add this to your layout:

```tsx
import { GlassFilter } from "@/components/ui/liquid-glass";

// In your root layout or page:
<GlassFilter />
```

---

## Current File Locations

| File | Purpose |
|------|---------|
| [`components/ui/liquid-glass.tsx`](./liquid-glass.tsx) | Core glass effect components: `GlassEffect`, `GlassDock`, `GlassButton`, `GlassFilter` |
| [`components/ui/demo.tsx`](./demo.tsx) | Demo wrapper exporting `DemoOne` for quick preview |
