require('dotenv').config()
const erl = require('express-rate-limit')

const redis = require('redis');
const axios = require("axios");
const express = require('express');
const app = express();
const port = 3000;
let client = null;


app.use(express.json());

const connectRedis = async() => {
  client = await redis.createClient({
    url: process.env.REDIS_URL,
  })
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();
}
connectRedis()

const limiter = erl.rateLimit({
	windowMs: 900000,
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Le nombre de requete est limité à 100 toute les 15 minutes "
})


const getPosts = async (ville) => {
  try {
    const response = await axios.get(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${ville}?key=${process.env.WEATHER_API_KEY}`,
    );
    console.log("getPosts");

    await client.set(ville, JSON.stringify(response.data), {EX: 43200});
    
    return response.data

  } catch (error) {
    console.error(error);

    throw error;
    
  } finally {
    console.log("Request completed");
  }
};

app.get('/meteo/:ville', limiter, async (req, res) => {
    const ville = req.params.ville;

    try{
      const search = await client.get(ville);
      //donnée existante sur redis
      if(search){
        res.json(JSON.parse(search))
      }
      else{
        res.json(await getPosts(ville));
      }
    }
    catch(error){
      res.status(404).json(error.message)
    }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});