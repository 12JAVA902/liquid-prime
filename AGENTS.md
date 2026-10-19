# Architecture rules
- Keep Vite as the client build and Vercel rewrites as the SPA deep-link fallback; Lovable hosting handles its own fallback.
- Share online presence through one authenticated app-wide provider and keep call signaling in private participant channels so subscriptions do not multiply across screens.