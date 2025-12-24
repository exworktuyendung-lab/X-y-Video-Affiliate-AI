import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TrendItem, GeneratedScript, StrategyPlan } from "../types";

const getAiClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

const modelId = "gemini-3-flash-preview";

export const getTrendingProducts = async (): Promise<TrendItem[]> => {
  try {
    const ai = getAiClient();
    const prompt = `Gợi ý 4 ngách sản phẩm hot Shopee Affiliate tại Việt Nam. Trả về JSON.`;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              products: { type: Type.ARRAY, items: { type: Type.STRING } },
              reason: { type: Type.STRING }
            },
            required: ["category", "products", "reason"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};

export const generateVideoScript = async (
  productName: string, 
  features: string, 
  productLink?: string,
  imageBase64?: string
): Promise<GeneratedScript | null> => {
  try {
    const ai = getAiClient();
    const textPrompt = `Bạn là chuyên gia Content Creator cho TikTok Ads. Viết kịch bản video TikTok 20-30 giây cho: "${productName}". 
    Features: ${features}. Link: ${productLink || 'N/A'}.
    YÊU CẦU QUAN TRỌNG: 
    1. Trường 'audio' CHỈ chứa lời thoại (voiceover text), tuyệt đối KHÔNG bao gồm mô tả nhạc hay tiếng động.
    2. Trường 'musicGenre' mô tả vibe âm nhạc riêng biệt.
    3. Phân bổ cảnh quay hợp lý để chuyển cảnh nhanh (mỗi cảnh 3-5s).
    
    JSON Schema: title, musicGenre, hashtags, postingTime, scenes (time, visual, audio, imagePrompt).`;

    const parts: any[] = [{ text: textPrompt }];
    if (imageBase64) {
      parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            musicGenre: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            postingTime: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  visual: { type: Type.STRING },
                  audio: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING }
                },
                required: ["time", "visual", "audio", "imagePrompt"]
              }
            }
          },
          required: ["title", "musicGenre", "scenes"]
        }
      }
    });
    const raw = JSON.parse(response.text || "null");
    if (raw && raw.scenes) {
      raw.scenes = raw.scenes.map((s: any) => ({ ...s, mediaType: 'image' }));
    }
    return raw;
  } catch (error) {
    console.error("Error generating script:", error);
    return null;
  }
};

export const generateSceneImage = async (prompt: string, productBase64: string): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: productBase64 } },
          { text: `Cinematic TikTok ad frame. Scene: ${prompt}. Focus: Realistic human model interacting with the product. High-end lighting, commercial style, 4k.` }
        ]
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const generateProductVariations = async (productBase64: string, anglePrompt: string): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: productBase64 } },
          { text: `Professional commercial product shot: ${anglePrompt}. Aesthetics: Luxury, clean. Include a realistic model's hands or person. 8k.` }
        ]
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const generateAiVoice = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    return null;
  }
};

export const generateAiBackgroundMusic = async (genre: string): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const musicPrompt = `Perform a continuous 30-second energetic rhythmic background beat. Genre: ${genre}. NO WORDS, purely catchy background energy for a TikTok Ad.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: musicPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    return null;
  }
};

export const getStrategyPlan = async (niche: string): Promise<StrategyPlan[]> => {
  try {
    const ai = getAiClient();
    const prompt = `Lập kế hoạch chi tiết xây kênh TikTok Affiliate cho ngách "${niche}" từ số 0 trong 4 tuần. Trả về JSON.`;
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phase: { type: Type.STRING },
              focus: { type: Type.STRING },
              actions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["phase", "focus", "actions"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};