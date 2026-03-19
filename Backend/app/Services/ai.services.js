const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const genrateAiResponse = async (message) => {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
    });
    const response = result.text;
    return response;
  } catch (error) {
    console.error('Error : ', error);
    return "Error generating response!"
  }
}

module.exports = { genrateAiResponse };