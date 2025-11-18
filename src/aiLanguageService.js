// src/services/aiLanguageService.js
// Serviço de Processamento de Linguagem Natural

import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../config/firebaseConfig';
import { aiConfig } from '../config/aiConfig';

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

export const aiLanguageService = {
  // Validar texto
  validateText: (text) => {
    if (!text || !text.trim()) {
      throw new Error('Texto vazio');
    }
    if (text.length > aiConfig.limits.maxTextLength) {
      throw new Error(`Texto muito longo. Máximo ${aiConfig.limits.maxTextLength} caracteres`);
    }
    return true;
  },

  // Análise de sentimento
  analyzeSentiment: async (text) => {
    try {
      aiLanguageService.validateText(text);
      
      const analyzeSentimentFunction = httpsCallable(functions, aiConfig.endpoints.analyzeSentiment);
      const result = await analyzeSentimentFunction({ text });
      
      const { score, magnitude, sentiment } = result.data;
      
      return {
        score: score || 0,
        magnitude: magnitude || 0,
        sentiment: sentiment || 'neutro',
        description: getSentimentDescription(score)
      };
    } catch (error) {
      console.error('Erro ao analisar sentimento:', error);
      throw error;
    }
  },

  // Tradução de texto
  translateText: async (text, targetLanguage = 'en') => {
    try {
      aiLanguageService.validateText(text);
      
      const translateFunction = httpsCallable(functions, aiConfig.endpoints.translateText);
      const result = await translateFunction({ 
        text, 
        targetLanguage 
      });
      
      return {
        originalText: text,
        translatedText: result.data.translatedText || '',
        targetLanguage,
        sourceLanguage: result.data.sourceLanguage || 'auto'
      };
    } catch (error) {
      console.error('Erro ao traduzir texto:', error);
      throw error;
    }
  },

  // Moderação de conteúdo
  moderateContent: async (text) => {
    try {
      aiLanguageService.validateText(text);
      
      const moderateFunction = httpsCallable(functions, aiConfig.endpoints.moderateContent);
      const result = await moderateFunction({ text });
      
      return {
        isSafe: result.data.isSafe || false,
        categories: result.data.categories || [],
        hasInappropriateContent: !result.data.isSafe
      };
    } catch (error) {
      console.error('Erro ao moderar conteúdo:', error);
      throw error;
    }
  },

  // Extração de entidades
  extractEntities: async (text) => {
    try {
      aiLanguageService.validateText(text);
      
      const extractFunction = httpsCallable(functions, 'extractEntities');
      const result = await extractFunction({ text });
      
      return {
        entities: result.data.entities || [],
        people: filterEntitiesByType(result.data.entities, 'PERSON'),
        places: filterEntitiesByType(result.data.entities, 'LOCATION'),
        organizations: filterEntitiesByType(result.data.entities, 'ORGANIZATION')
      };
    } catch (error) {
      console.error('Erro ao extrair entidades:', error);
      throw error;
    }
  },

  // Resumo de texto
  summarizeText: async (text, maxSentences = 3) => {
    try {
      aiLanguageService.validateText(text);
      
      const summarizeFunction = httpsCallable(functions, 'summarizeText');
      const result = await summarizeFunction({ 
        text, 
        maxSentences 
      });
      
      return {
        summary: result.data.summary || '',
        originalLength: text.length,
        summaryLength: result.data.summary?.length || 0
      };
    } catch (error) {
      console.error('Erro ao resumir texto:', error);
      throw error;
    }
  }
};

// Funções auxiliares
function getSentimentDescription(score) {
  if (score > 0.5) return 'Muito Positivo';
  if (score > 0.1) return 'Positivo';
  if (score > -0.1) return 'Neutro';
  if (score > -0.5) return 'Negativo';
  return 'Muito Negativo';
}

function filterEntitiesByType(entities, type) {
  if (!entities) return [];
  return entities.filter(entity => entity.type === type);
}