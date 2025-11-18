// src/config/aiConfig.js
// Configurações para AI/ML

export const aiConfig = {
  // Modelos disponíveis
  models: {
    vision: "google-vision-v1",
    language: "google-language-v1",
    translation: "google-translate-v2",
  },

  // Limites de uso
  limits: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxTextLength: 5000, // caracteres
    supportedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  },

  // Configurações de análise
  analysis: {
    minConfidence: 0.5, // score mínimo para considerar resultado
    maxLabels: 10, // máximo de labels retornados
    language: "pt", // idioma padrão
  },

  // Endpoints das Cloud Functions
  endpoints: {
    analyzeImage: "analyzeImage",
    detectText: "detectText",
    analyzeSentiment: "analyzeSentiment",
    translateText: "translateText",
    classifyImage: "classifyImage",
    moderateContent: "moderateContent",
  },
};
