const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { HfInference } = require("@huggingface/inference");
const { Translate } = require('@google-cloud/translate').v2;

const app = express();

app.use(cors());
app.use(express.json());

// Konfigurisanje Hugging Face API klijenta
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Konfigurisanje Google Translate klijenta
const translate = new Translate({
  key: process.env.GOOGLE_API_KEY,
});

// Ruta za osnovnu putanju '/'
app.get("/", (req, res) => {
  console.log("Received GET request on /");
  res.send("Hello, World!");
});

// Ruta za generisanje edukativnih materijala
app.post("/generate-lesson", async (req, res) => {
  const { userPrompt } = req.body;

  console.log("Received POST request on /generate-lesson");
  console.log("Received prompt:", userPrompt);

  // Provera unosa
  if (!userPrompt) {
    console.log("Error: Missing userPrompt in request body");
    return res.status(400).json({
      message: "Missing required field: userPrompt is required",
    });
  }

  try {
    // Prevođenje prompta s bosanskog na engleski
    console.log("Translating prompt to English...");
    const [translatedPrompt] = await translate.translate(userPrompt, 'en');
    console.log("Translated prompt:", translatedPrompt);

    // Postavljanje parametara za generaciju
    const generationArgs = {
      max_tokens: 15000,
      temperature: 0.1,
      top_p: 0.9,
    };

    console.log("Calling Hugging Face API...");
    const response = await hf.textGeneration({
      model: "microsoft/Phi-3.5-mini-instruct",
      inputs: translatedPrompt,
      parameters: generationArgs,
    });

    console.log("Response from Hugging Face API:", response);

    // Prevođenje generisanog teksta s engleskog na bosanski
    console.log("Translating generated text to Bosnian...");
    const [translatedText] = await translate.translate(response.generated_text.trim(), 'bs');
    console.log("Translated text:", translatedText);

    // Vraćanje prevedenog sadržaja
    return res.status(200).json({
      generatedText: translatedText,
    });
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Full error:", error);

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Pokretanje servera
const port = process.env.PORT || 1000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
