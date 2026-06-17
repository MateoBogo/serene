# Serene

Petit projet Ionic / Angular fait pour le cours.

L'application est une base pour une app de meditation simple : minuteur,
suivi des statistiques et historique par jour.

## Prerequis

- Node.js 22 ou plus
- npm

Sur Windows / PowerShell, j'utilise souvent `npm.cmd` au lieu de `npm`, car
PowerShell peut bloquer les scripts `.ps1`.

## Installation

Depuis le dossier du projet :

```bash
npm.cmd install
```

## Lancer le projet

Commande classique :

```bash
npm.cmd start
```

Par defaut Angular lance le projet sur :

```text
http://localhost:4200/
```

Pendant le developpement j'ai aussi utilise ce port :

```bash
npm.cmd start -- --host=127.0.0.1 --port=8100
```

Puis ouvrir :

```text
http://127.0.0.1:8100/
```

## Commandes utiles

Lancer les tests :

```bash
npm.cmd test
```

Faire un build :

```bash
npm.cmd run build
```

Verifier le lint :

```bash
npm.cmd run lint
```

## Lancer avec Docker Desktop

Le projet contient un `Dockerfile` et un `docker-compose.yml`.
L'image compile l'application Ionic / Angular puis la sert avec Nginx.

Depuis le dossier du projet :

```bash
docker compose up -d --build
```

Puis ouvrir :

```text
http://localhost:8080/
```

Dans Docker Desktop, le conteneur apparait sous le nom `serene-app`.
Il peut ensuite etre demarre, arrete ou relance depuis l'interface.

Pour l'arreter en ligne de commande :

```bash
docker compose down
```

## Navigation

L'application utilise une barre d'onglets Ionic (`ion-tabs`) en bas de l'ecran :
Mediter et Stats.

Le minuteur permet de choisir une duree avec une roulette heures/minutes/secondes
ou de lancer une session sans limite. Les sons disponibles sont affiches
directement sous forme de boutons.

## Notes

Le stockage local est en place : les sessions terminees, les statistiques de la
semaine et les preferences (duree par defaut, ambiance, theme clair/sombre) sont
enregistrees dans le navigateur via `localStorage`.
