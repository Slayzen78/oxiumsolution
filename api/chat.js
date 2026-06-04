import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Gérer la sécurité CORS pour autoriser ton frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Si c'est une requête de vérification (OPTIONS), répondre immédiatement
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { message, systemInstruction } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Le message est vide.' });
    }

    // Récupérer la clé API stockée de façon cachée et sécurisée sur Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Clé API manquante dans les variables d\'environnement Vercel.' });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Appel à Gemini à l'abri des regards indiscrets
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return res.status(200).json({ text: response.text });
  } catch (error) {
    console.error('Erreur API Gemini:', error);
    return res.status(500).json({ error: error.message || 'Une erreur est survenue.' });
  }
}