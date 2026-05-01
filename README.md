# Divit AI Portfolio

An interactive Data Scientist and Applied AI Engineer portfolio built with React, Vite, Three.js, GSAP, Framer Motion, and Tailwind CSS.

## Sections

- Hero: animated neural-network entry scene
- About: concise profile and focus areas
- Projects: interactive constellation of selected AI, data, and full-stack systems
- Skills: 3D orbit view of tools and technologies
- Timeline: career and learning path from data foundations to applied AI systems
- Transformer: self-attention inspired working-style visualization
- Contact: animated signal form and social links

## Local Development

```bash
npm install
npm run dev
```

## Production Checks

```bash
npm run lint
npm run build
```

## Deployment

The project is configured for Vercel with SPA rewrites in `vercel.json`.

Before publishing, replace any project `github` or `demo` fields in `src/data/projects.js` that still use `#`. Those links are intentionally rendered as unavailable in the UI until real URLs are added.
