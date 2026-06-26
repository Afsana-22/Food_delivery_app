import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface WeatherContext {
    city: string;
    condition: string;
    temp: number;
    timeBucket: string;
}

export interface DishInfo {
    restaurantId: string;
    restaurantName: string;
    itemName: string;
    price: number;
    category?: string;
    isLocalSpecial?: boolean;
    image?: string;
}

export const getAIRecommendations = async (weather: WeatherContext, dishes: DishInfo[]) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
            throw new Error("Missing Gemini API Key");
        }

        const prompt = `
            You are a smart food recommendation engine for "Zaptaste", a premium food delivery app.
            
            Context:
            - City: ${weather.city}
            - Weather: ${weather.condition} (${weather.temp}°C)
            - Time of Day: ${weather.timeBucket}
            
            Available Dishes:
            ${dishes.map(d => `- ${d.itemName} (from ${d.restaurantName}) [Price: ${d.price}]`).join('\n')}
            
            Task:
            1. Select exactly 6 dishes that best suit this weather and time.
            2. For each dish, provide a short, creative "reason" (max 10 words) explaining why it's perfect for this weather/time.
            3. Generate a catchy "heading" for this recommendation section based on the weather.
            
            Response Format (JSON only):
            {
                "heading": "...",
                "recommendations": [
                    { "itemName": "...", "restaurantName": "...", "reason": "..." },
                    ...
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from the response (sometimes AI wraps it in markdown)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error("Invalid AI response format");
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return null; // Fallback to hardcoded logic if AI fails
    }
};
