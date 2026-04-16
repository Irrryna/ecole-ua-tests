# language: fr
Fonctionnalité: Tableau de bord enseignant
  En tant qu'enseignant de l'École Ukrainienne de Lyon
  Je veux gérer mes devoirs, annonces, ressources pédagogiques et contenus
  Afin de communiquer efficacement avec les élèves et les parents

  Contexte:
    Étant donné les données de test sont prêtes
    Et je suis connecté en tant qu'enseignant

  Scénario: L'espace professeur affiche la classe assignée et l'emploi du temps
    Alors je vois "Espace professeur"
    Et je vois le nom de la classe assignée à l'enseignant
    Et je vois "Emploi du temps"

  Scénario: Consulter les devoirs et ressources d'une classe
    Quand je clique sur la ligne de ma classe
    Alors je vois le composant des devoirs partagés
    Et je vois la description du devoir de test
    Et je vois le titre de la ressource de test

  Scénario: Cycle de vie complet d'un devoir — créer, modifier, supprimer
    Quand je clique sur la ligne de ma classe
    Et je crée un nouveau devoir
    Alors le devoir créé apparaît dans la liste
    Quand je modifie la description du devoir créé
    Alors la description modifiée apparaît dans la liste
    Quand je supprime le devoir modifié
    Alors le devoir ne figure plus dans la liste

  Scénario: Publier une annonce rapide depuis le tableau de bord
    Quand je clique sur la carte d'action "Rappel rapide"
    Et je publie une annonce rapide
    Alors l'annonce publiée apparaît dans la liste

  Scénario: Cycle de vie complet d'un contenu enseignant — créer, modifier, supprimer
    Quand je navigue vers "Contenus" dans la barre latérale
    Alors je vois "Tous les contenus publies"
    Quand je crée un contenu enseignant privé publié
    Alors le contenu enseignant apparaît dans la liste des contenus
    Quand je modifie le titre du contenu enseignant
    Alors le titre modifié du contenu enseignant apparaît dans la liste
    Quand je supprime le contenu enseignant
    Alors le contenu enseignant ne figure plus dans la liste

  Scénario: Cycle de vie complet d'une ressource pédagogique — créer, modifier, supprimer
    Quand je clique sur la carte d'action "Mes supports pédagogiques"
    Alors l'URL contient "/teacher?tab=resources"
    Et je vois "Mes supports pédagogiques"
    Quand je crée une ressource pédagogique de type lien externe
    Alors la ressource créée apparaît dans la liste
    Quand je modifie le titre de la ressource créée
    Alors le titre modifié de la ressource apparaît dans la liste
    Quand je supprime la ressource modifiée
    Alors la ressource ne figure plus dans la liste

  Scénario: Retour au tableau de bord depuis les ressources pédagogiques
    Quand je clique sur la carte d'action "Mes supports pédagogiques"
    Et je navigue vers "Espace professeur" dans la barre latérale
    Alors l'URL est "/teacher" sans paramètres de requête
    Et je vois "Espace professeur"

  Scénario: L'ancienne URL /teacher/resources redirige vers /teacher?tab=resources
    Quand je visite directement l'URL "/teacher/resources"
    Alors l'URL est redirigée vers "/teacher?tab=resources"
    Et je vois "Mes supports pédagogiques"
