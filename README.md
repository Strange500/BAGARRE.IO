# equipe-1
# RULES JSAE S4

## Table of contents
1. [Introduction](#introduction)
2. [Comment jouer](#howto)
    1. [Déplacement](#deplacement)
    2. [Bonus](#bonus)
        1. [Nourriture](#bonusparagraph)
        2. [Bonus Temporaire](#tempparagraph)
3. [Mort](#death)
4. [ScoreBoard](#board)
    1. [Points](#points)
5. [Fin de Partie](#end)
6. [Installation](#installation)

## Introduction <a name="introduction"></a>
Le jeu est un jeu multijoueur en ligne où les joueurs contrôlent un avatar qui se déplace sur un plateau vu de dessus. Le but est de grossir en collectant des bonus tout en évitant de se faire absorber par d'autres joueurs plus grands.

## Comment jouer <a name="howto"></a>

### Déplacement <a name="deplacement"></a>
L'avatar peut être déplacé dans toutes les directions à l'aide des touches du clavier(z,q,s,d ou les flèches) ou de la souris(click, ou drag).

### Bonus <a name="bonus"></a>
Des bonus apparaissent régulièrement à des positions aléatoires sur le plateau.

#### Nourriture <a name="bonusparagraph"></a>
- La nourriture permet à l'avatar de grossir lorsqu'elle est consommée.
- Plus un avatar est gros, plus il se déplace lentement.

#### Bonus Temporaire <a name="tempparagraph"></a>
- **Vitesse** : Augmente temporairement la vitesse de déplacement.
- **Invincibilité** : Rend l'avatar invincible aux autres joueurs pendant une courte durée.

## Mort <a name="death"></a>
Un avatar meurt lorsqu'il est absorbé par un autre joueur plus grand que lui.

## ScoreBoard <a name="board"></a>
Le tableau des scores affiche le classement des joueurs en fonction de leur taille.

### Points <a name="points"></a>
- Chaque bonus collecté augmente la taille et le score du joueur.
- Manger un autre joueur ajoute son score au sien.

## Fin de Partie <a name="end"></a>
La partie se termine lorsque tous les autres joueurs sont éliminés ou lorsqu'un objectif spécifique est atteint.


## Installation <a name="installation"></a>
1. Cloner le dépôt
2. Installer les dépendances
```bash
npm i
```
3. Lancer le serveur
```bash
npm run deploy
```
4. Ouvrir un navigateur et se connecter à l'adresse `http://localhost:8000`
