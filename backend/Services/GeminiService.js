import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiModel = (modelName = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

export const generateWithRetry = async (model, promptOrPayload, retries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(promptOrPayload);
      return result;
    } catch (error) {
      if (error.status === 503 && attempt < retries) {
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw error;
      }
    }
  }
};

export const sendMessageWithRetry = async (chat, message, retries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await chat.sendMessage(message);
      return result;
    } catch (error) {
      if (error.status === 503 && attempt < retries) {
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw error;
      }
    }
  }
};

export const sendMessageWithRetryStream = async (chat, message, retries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await chat.sendMessageStream(message);
      return result;
    } catch (error) {
      if (error.status === 503 && attempt < retries) {
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw error;
      }
    }
  }
};
