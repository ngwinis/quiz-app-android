import { GoogleGenAI } from "@google/genai";
import { Question } from "../types";

// Initialize the client. process.env.API_KEY is assumed to be available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const explainAnswer = async (question: Question): Promise<string> => {
  const model = 'gemini-2.5-flash';
  
  const prompt = `
    Bạn là một trợ lý giáo dục hữu ích. Hãy giải thích ngắn gọn tại sao đáp án ${question.correctAnswer} lại đúng cho câu hỏi sau.
    
    Câu hỏi: ${question.text}
    
    Các lựa chọn:
    ${question.options.map(o => `${o.label}. ${o.content}`).join('\n')}
    
    Đáp án đúng: ${question.correctAnswer}
    
    Giải thích (ngắn gọn, dễ hiểu, dưới 100 từ):
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    return response.text || "Không thể tạo lời giải thích lúc này.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra lại.";
  }
};