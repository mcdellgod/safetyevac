# Mise en ligne avec Supabase

## État actuel

Le prototype local est maintenant relié au projet Supabase :

- Projet : `mcdellgod's Project`
- Région : `eu-west-3`
- URL API : `https://bhqtuqchbmoeezauwvft.supabase.co`
- Tables créées : `organizations`, `sites`, `buildings`, `zones`, `alerts`, `evacuation_responses`, `first_aid_reports`, `app_events`
- Realtime activé sur : `alerts`, `evacuation_responses`, `first_aid_reports`, `app_events`

Les fichiers `index.html`, `styles.css` et `app.js` peuvent être publiés sur un hébergeur statique.

## Déploiement simple

### Option recommandée pour tester vite : Netlify Drop

1. Aller sur `https://app.netlify.com/drop`
2. Glisser-déposer le dossier contenant :
   - `index.html`
   - `styles.css`
   - `app.js`
3. Netlify donne une URL publique immédiatement.

### Option propre pour travailler ensuite : GitHub + Vercel

1. Créer un dépôt GitHub.
2. Ajouter les fichiers du prototype.
3. Importer le dépôt dans Vercel.
4. Déployer.
5. Chaque modification poussée sur GitHub redéploie automatiquement.

## Important : sécurité

La version actuelle est une démo connectée. Les politiques RLS sont ouvertes pour permettre une utilisation sans login :

- lecture publique,
- insertion publique,
- modification publique sur les tables opérationnelles.

Ce mode est pratique pour valider le prototype, mais il ne faut pas y mettre de vraies données personnelles.

Avant une mise en production, il faut :

1. Ajouter Supabase Auth.
2. Créer une table `profiles` liée à `auth.users`.
3. Associer chaque utilisateur à une organisation et à un rôle.
4. Remplacer les politiques RLS ouvertes par des politiques `authenticated`.
5. Limiter les actions critiques aux rôles `admin` et `evacuation_chief`.
6. Déplacer les actions sensibles vers des Edge Functions si nécessaire.
7. Activer les vraies notifications email/SMS/push.

## Étapes de production proposées

### Phase 1 - Démo en ligne

- Publier les fichiers statiques.
- Tester à plusieurs depuis différents appareils.
- Valider les parcours : déclenchement, réponse employé, guide-file, secours.

### Phase 2 - Authentification

- Ajouter un écran de connexion Supabase.
- Créer les profils et rôles.
- Restreindre les accès par organisation.

### Phase 3 - Produit utilisable

- Ajouter imports CSV utilisateurs.
- Ajouter génération QR codes.
- Ajouter exports PDF/CSV réels.
- Ajouter notifications.
- Ajouter audit et clôture d'alerte.

## Vérification Supabase effectuée

La base contient actuellement :

- 1 alerte active
- 4 réponses
- 4 zones
- 4 événements
- 0 signalement secours initial

Le linter Supabase signale les politiques RLS ouvertes, ce qui est attendu pour cette démo. Ces warnings devront être corrigés avant production.
