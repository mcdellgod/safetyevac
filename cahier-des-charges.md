# Cahier des charges fonctionnel - Safety Evac

## 1. Contexte

Safety Evac est une application web et mobile-first destinée à piloter les évacuations de bâtiments, exercices incendie et alertes de secours à personne. La maquette existante montre les grands parcours, mais elle fonctionne principalement avec des données locales et sans backend réel.

La refonte doit transformer cette maquette en produit fiable, utilisable en situation de stress, avec suivi temps réel, historique, rôles clairs et conformité RGPD.

## 2. Objectifs

- Déclencher une évacuation réelle ou un exercice en quelques secondes.
- Notifier les personnes concernées par bâtiment, zone ou groupe.
- Collecter les statuts des employés et guides-file en temps réel.
- Donner au chef d'évacuation une vision opérationnelle claire : notifiés, réponses, personnes non localisées, zones à risque.
- Signaler rapidement un secours à personne avec localisation précise.
- Générer des rapports exploitables après exercice ou incident.
- Administrer les sites, bâtiments, zones, utilisateurs, rôles et QR codes.

## 3. Utilisateurs et rôles

### Administrateur
- Gère les organisations, sites, bâtiments et zones.
- Gère les utilisateurs, rôles, groupes et droits d'accès.
- Configure les canaux de notification.
- Consulte l'historique complet et les exports.

### Chef d'évacuation
- Déclenche et clôture une évacuation.
- Suit les réponses en temps réel.
- Identifie les personnes non répondantes ou à risque.
- Consulte les signalements de secours.
- Génère les rapports d'intervention ou d'exercice.

### Guide-file
- Confirme la prise en charge de sa zone.
- Confirme l'arrivée au point de rassemblement.
- Indique si toutes les personnes de la zone ont été rassemblées.
- Ajoute des commentaires opérationnels.

### Employé
- Reçoit une alerte.
- Confirme sa présence sur site.
- Indique s'il est en sécurité.
- Précise sa localisation si nécessaire.
- Peut signaler un secours à personne.

## 4. Parcours principaux

### Connexion
- Authentification par email et mot de passe.
- Récupération de mot de passe.
- Session persistante.
- Accès conditionné au rôle.

### Déclenchement d'évacuation
- Choix du type : exercice ou alarme réelle.
- Sélection du site, bâtiment, zones et point de rassemblement.
- Choix des canaux : notification push, SMS, email.
- Confirmation renforcée pour une alarme réelle.
- Journalisation de l'utilisateur, heure, portée et message.

### Suivi d'évacuation
- Tableau de bord temps réel.
- Statistiques : personnes notifiées, réponses reçues, personnes en sécurité, non-répondants.
- Liste filtrable par statut, zone, rôle et criticité.
- Timeline des événements.
- Ajout manuel d'une information par le chef d'évacuation.
- Clôture avec motif et synthèse.

### Réponse employé
- Écran mobile prioritaire et très lisible.
- Questions courtes : présent sur site, en sécurité, accompagné par un guide, localisation.
- Validation immédiate et accusé de réception.
- Possibilité de modifier la réponse tant que l'alerte est active.

### Réponse guide-file
- Checklist dédiée à la zone.
- Confirmation de prise en charge.
- Confirmation du point de rassemblement.
- Confirmation de rassemblement complet ou liste/commentaire des exceptions.
- Notes libres visibles par le chef d'évacuation.

### Secours à personne
- Signalement d'un incident médical.
- Localisation saisie ou scannée via QR code.
- Type d'incident : malaise, arrêt cardiaque, saignement, chute, brûlure, autre.
- Nom de la victime si connu.
- Notification immédiate au chef de sécurité.
- Rappel d'appeler le 112 en cas d'urgence vitale.

### Rapports
- Liste des évacuations et incidents.
- Rapport détaillé : chronologie, taux de réponse, zones, non-répondants, notes, clôture.
- Exports PDF et CSV.
- Distinction claire exercice / réel.

### Administration
- Gestion des sites, bâtiments, étages, zones, points de rassemblement.
- Import utilisateurs par CSV.
- Affectation des rôles et zones.
- Génération et impression de QR codes de localisation.
- Paramétrage des notifications et messages types.

## 5. Exigences fonctionnelles MVP

- Application responsive desktop/tablette/mobile.
- Authentification réelle.
- Gestion des rôles.
- Déclenchement d'une alerte exercice ou réelle.
- Suivi temps réel des réponses.
- Formulaire employé.
- Formulaire guide-file.
- Signalement secours à personne.
- Rapport post-événement.
- Administration basique des utilisateurs et zones.

## 6. Exigences non fonctionnelles

- Interface mobile-first, utilisable sous stress.
- Temps de chargement court.
- Écrans lisibles en extérieur.
- Accessibilité : contraste, tailles de cibles tactiles, navigation clavier.
- Données hébergées en Europe.
- Journal d'audit pour les actions critiques.
- Sauvegarde et traçabilité des événements.
- Respect RGPD : minimisation des données, durée de conservation configurable, droits d'accès.

## 7. Architecture recommandée

- Frontend : Next.js ou React avec TypeScript.
- UI : Tailwind CSS et composants réutilisables.
- Backend : Supabase ou équivalent Postgres + Auth + Realtime.
- Notifications : email transactionnel, SMS, web push.
- PWA : installation mobile, mode plein écran, notifications.
- Exports : génération PDF/CSV côté serveur.

## 8. Données principales

- Organisation
- Site
- Bâtiment
- Zone
- Point de rassemblement
- Utilisateur
- Rôle
- Alerte
- Notification
- Réponse d'évacuation
- Signalement secours
- Rapport
- Journal d'audit

## 9. Priorités de réalisation

### Phase 1 - Prototype validable
- Écrans principaux.
- Données simulées.
- Navigation complète.
- Validation UX des parcours.

### Phase 2 - MVP connecté
- Auth et base de données.
- Rôles et permissions.
- Alertes et réponses temps réel.
- Administration minimale.

### Phase 3 - Produit opérationnel
- Notifications réelles.
- QR codes.
- Exports.
- Audit, RGPD et supervision.
- Tests terrain.

## 10. Points à confirmer

- Nombre de sites et bâtiments visés au lancement.
- Canaux de notification obligatoires.
- Langues requises : français, anglais, allemand, luxembourgeois.
- Contraintes réglementaires internes.
- Durée de conservation des données.
- Processus exact de clôture et validation des rapports.
