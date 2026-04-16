# language: fr
Fonctionnalité: Tableau de bord administrateur
  En tant qu'administrateur de l'École Ukrainienne de Lyon
  Je veux gérer les classes, les utilisateurs, les matières et les contenus
  Afin d'assurer le bon fonctionnement de la plateforme scolaire

  Contexte:
    Étant donné les données de test sont prêtes
    Et je suis connecté en tant qu'administrateur

  Scénario: Les modules et l'emploi du temps sont visibles au chargement
    Alors je vois la grille de modules d'administration
    Et je vois la grille de l'emploi du temps
    Et je vois le nom de la classe de test dans la grille

  Scénario: Créer et supprimer une petite annonce
    Quand je navigue vers la gestion générale
    Et je crée une petite annonce
    Alors la petite annonce est visible dans la liste
    Quand je supprime la petite annonce
    Alors la petite annonce n'est plus visible

  Scénario: Cycle de vie complet d'une classe — créer, modifier, supprimer
    Quand je navigue vers la gestion générale
    Et je crée une nouvelle classe avec le groupe d'âge "10-11 ans"
    Alors la classe créée apparaît dans le tableau
    Quand je modifie la classe avec le groupe d'âge "11-12 ans"
    Alors la classe modifiée apparaît dans le tableau
    Quand je supprime la classe modifiée
    Alors l'API confirme la suppression de la classe avec HTTP 200
    Et la classe supprimée n'apparaît plus dans le tableau

  Scénario: Valider le compte d'un parent en attente
    Quand je navigue vers la validation des comptes
    Alors je vois l'email du parent en attente
    Quand je valide le compte du parent en attente
    Alors le bouton de validation n'est plus visible pour ce parent

  Scénario: Consulter les enseignants et gérer une matière
    Quand je navigue vers la gestion des enseignants
    Alors je vois "Liste des enseignants"
    Et je vois l'email de l'enseignant de test
    Quand je crée une nouvelle matière
    Alors le tag de la matière créée est visible
    Quand je supprime la matière créée
    Alors le tag de la matière n'est plus visible

  Scénario: Cycle de vie complet d'un contenu administrateur — créer, modifier, supprimer
    Quand je navigue vers "Vitrine & Annonces" dans la barre latérale
    Alors je vois "Gestion des contenus"
    Quand je crée un contenu administrateur privé publié
    Alors le contenu administrateur apparaît dans le tableau de gestion
    Quand je modifie le titre du contenu administrateur
    Alors le titre modifié du contenu administrateur apparaît dans le tableau
    Quand je supprime le contenu administrateur
    Alors le contenu administrateur ne figure plus dans le tableau
