# language: fr
Fonctionnalité: Tableau de bord parent
  En tant que parent de l'École Ukrainienne de Lyon
  Je veux consulter les informations de la classe de mon enfant et gérer son profil
  Afin de suivre sa scolarité

  Contexte:
    Étant donné les données de test sont prêtes
    Et je suis connecté en tant que parent

  Scénario: Le tableau de bord affiche tous les modules disponibles
    Alors je vois "Tableau de bord"
    Et je vois le contenu privé de test
    Et je vois l'annonce de test
    Et je vois le devoir de test
    Et je vois la ressource de test

  Scénario: Accéder à l'aperçu de la classe depuis le tableau de bord
    Quand je clique sur le bouton "Voir la classe"
    Alors je vois "Apercu de la classe"
    Et je vois le nom de la classe de test

  Scénario: Naviguer dans les sections de la classe via la barre latérale
    Quand je clique sur le nom de la classe dans la barre latérale
    Alors la sous-navigation de la classe est visible
    Quand je navigue vers "Devoirs" dans la barre latérale
    Alors je vois le devoir de test
    Quand je navigue vers "Fichiers" dans la barre latérale
    Alors je vois la ressource de test
    Quand je navigue vers "Annonces" dans la barre latérale
    Alors je vois l'annonce de test

  Scénario: Inscrire un enfant et modifier son adresse
    Quand je navigue vers "Mes enfants" dans la barre latérale
    Alors je vois "Mes enfants"
    Quand j'inscris un nouvel enfant
    Alors l'enfant inscrit apparaît dans la liste avec son adresse
    Quand je modifie l'adresse de l'enfant
    Alors la nouvelle adresse apparaît dans la fiche de l'enfant
