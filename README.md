# Weather API Wrapper

API qui sert d'intermédiaire (wrapper) vers un service météo tiers. Elle récupère les données météo d'une ville donnée via l'API Visual Crossing, met les résultats en cache avec Redis pour limiter les appels externes, et protège l'API contre les abus grâce à un rate limiting.

Projet réalisé dans le cadre de : https://roadmap.sh/projects/weather-api-wrapper-service

## Fonctionnalités

- **3rd Party API** : récupération des données météo via l'API [Visual Crossing](https://www.visualcrossing.com/), grâce à Axios pour les requêtes HTTP.
- **Environment Variables** : la clé API Visual Crossing et l'URL de connexion Redis sont stockées dans un fichier `.env` (jamais en dur dans le code), chargées via `dotenv`.
- **Caching** : les résultats sont mis en cache dans Redis (hébergé sur Upstash) avec une expiration de 12 heures, pour éviter de rappeler l'API externe inutilement.
- **Rate Limiting** : la route météo est protégée par `express-rate-limit`, qui limite le nombre de requêtes autorisées par IP sur une fenêtre de temps donnée.

## Prérequis

- [Node.js](https://nodejs.org/) installé
- Un compte [Visual Crossing](https://www.visualcrossing.com/account/) pour obtenir une clé API gratuite
- Un compte [Upstash](https://console.upstash.com/) pour créer une base Redis gratuite et obtenir son URL de connexion

## Installation

1. Cloner le repository :
   ```
   git clone <url-de-ce-repo>
   cd <nom-du-dossier>
   ```

2. Installer les dépendances :
   ```
   npm install
   ```

3. Créer un fichier `.env` à la racine du projet avec les variables suivantes :
   ```
   WEATHER_API_KEY=ta_cle_visual_crossing
   REDIS_URL=ton_url_de_connexion_upstash
   ```

4. Lancer le serveur :
   ```
   node index.js
   ```

Le serveur démarre par défaut sur `http://localhost:3000`.

## Utilisation

### Récupérer la météo d'une ville

```
GET /meteo/:ville
```

**Exemple :**
```
GET http://localhost:3000/meteo/lyon
```

**Réponse (exemple simplifié) :**
```json
{
  "resolvedAddress": "lyon",
  "address": "lyon",
  "timezone": "Europe/Paris",
  "description": "Warming up with no rain expected.",
  "days": [
    {
      "datetime": "2026-07-19",
      "tempmax": 87,
      "tempmin": 68.3,
      "temp": 77,
      "humidity": 50.1
    }
  ]
}
```

**En cas d'erreur** (ville invalide, service indisponible) :
```json
"Request failed with status code 400"
```
avec un code de statut HTTP `404`.

**Rate limiting :** au-delà de la limite configurée de requêtes sur la fenêtre de temps définie, l'API répond avec un code `429` et un message d'erreur.

## Stack technique

- Node.js / Express
- Axios (appels HTTP)
- Redis (Upstash) pour le cache
- dotenv pour les variables d'environnement
- express-rate-limit pour la limitation de requêtes