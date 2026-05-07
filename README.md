# Safety Evac

Prototype web connecté à Supabase pour piloter une évacuation, recueillir les réponses en temps réel et signaler un secours à personne.

## Ouvrir l'application

Le prototype est une application statique :

- `index.html`
- `styles.css`
- `app.js`

Pour l'ouvrir localement, double-cliquez sur `index.html`.

Pour obtenir une URL publique depuis GitHub, activez GitHub Pages :

1. Ouvrir les paramètres du dépôt GitHub.
2. Aller dans `Pages`.
3. Source : `Deploy from a branch`.
4. Branche : `main`.
5. Dossier : `/root`.
6. Enregistrer.

L'URL sera généralement : `https://mcdellgod.github.io/safetyevac/`.

Note : le dépôt est actuellement privé. Selon le type de compte GitHub, GitHub Pages depuis un dépôt privé peut nécessiter un plan compatible ou rendre la page publique. Si Pages n'est pas disponible, utilisez Netlify Drop ou Vercel.

## Supabase

Le prototype est relié au projet Supabase :

- URL API : `https://bhqtuqchbmoeezauwvft.supabase.co`
- Tables principales : `alerts`, `evacuation_responses`, `first_aid_reports`, `zones`, `app_events`
- Realtime activé pour les événements opérationnels

## Sécurité

Cette version est une démo connectée. Les politiques RLS sont volontairement ouvertes pour tester sans authentification.

Avant toute utilisation réelle :

- ajouter Supabase Auth,
- créer des profils utilisateurs,
- appliquer des rôles (`admin`, `evacuation_chief`, `guide_file`, `employee`),
- remplacer les politiques ouvertes par des politiques authentifiées,
- ne pas mettre de données personnelles réelles dans cette version.

## Documents

- `cahier-des-charges.md` : cahier des charges fonctionnel
- `mise-en-ligne-supabase.md` : guide de déploiement
- `supabase-schema.sql` : schéma SQL de base
