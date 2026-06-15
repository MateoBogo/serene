# Serene

Petit projet Ionic / Angular fait pour le cours.

L'application est une base pour une app de meditation : accueil, minuteur,
historique, statistiques, reglages et page a propos.

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

## Notes

Le projet est encore en cours. Certaines donnees sont encore des exemples, le
stockage local et les vraies statistiques seront ajoutes plus tard.
