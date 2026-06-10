import { GoogleGenAI } from '@google/genai';

let googleAIInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!googleAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("MY_GEMINI_API_KEY")) {
      console.warn("⚠️ GEMINI_API_KEY is not configured. Running with fallback engine.");
      return null;
    }
    googleAIInstance = new GoogleGenAI({ apiKey });
  }
  return googleAIInstance;
}

/**
 * Process intelligent business voice queries (e.g., "Sold 5 milk packets to Amit for 250 rupees")
 * and extracts structural entities.
 */
export async function parseVoiceEntry(voiceText: string): Promise<{
  customerName: string;
  productName: string;
  quantity: number;
  price: number;
  amount: number;
  type: 'sale' | 'purchase' | 'expense';
  status: 'paid' | 'udhaar';
}> {
  const client = getGeminiClient();
  const prompt = `
    Analyze this shopkeeper's voice log of a transaction: "${voiceText}"
    Extract:
    1. customerName (default to "Self" if not specified, capitalize first letters)
    2. productName (default to "Miscellaneous" if not specified)
    3. quantity (number, default to 1)
    4. price (unit cost, default to total / quantity)
    5. amount (total transaction cost, set to quantity * price if explicitly calculated)
    6. type ("sale", "purchase", "expense", default is "sale")
    7. status ("paid", "udhaar", default is "paid")

    Return ONLY a raw JSON object matching the types above. No markdown code blocks, backticks or formatting.
  `;

  if (!client) {
    // Elegant fallback simulation using keyword matching when API lacks a secure key
    const cleaned = voiceText.toLowerCase();
    let quantity = 1;
    let amount = 0;
    let customerName = "Self";
    let productName = "Miscellaneous";
    let type: 'sale' | 'purchase' | 'expense' = "sale";
    let status: 'paid' | 'udhaar' = "paid";

    // Match numbers
    const numRegex = /\b(\d+)\b/g;
    const nums: number[] = [];
    let match;
    while ((match = numRegex.exec(cleaned)) !== null) {
      nums.push(Number(match[1]));
    }

    if (nums.length >= 2) {
      quantity = nums[0];
      amount = nums[1];
    } else if (nums.length === 1) {
      amount = nums[0];
    }

    if (cleaned.includes("sold") || cleaned.includes("sale")) type = "sale";
    if (cleaned.includes("bought") || cleaned.includes("purchase")) type = "purchase";
    if (cleaned.includes("spent") || cleaned.includes("expense")) type = "expense";
    if (cleaned.includes("udhaar") || cleaned.includes("credit") || cleaned.includes("owing")) status = "udhaar";

    // Match customers names matching Suresh Kirana profiles
    if (cleaned.includes("amit")) customerName = "Amit Singh";
    else if (cleaned.includes("priya")) customerName = "Priya Sharma";
    else if (cleaned.includes("rahul")) customerName = "Rahul Kumar";

    // Match products
    if (cleaned.includes("milk")) productName = "Sudha Milk Premium 1L";
    else if (cleaned.includes("atta")) productName = "Aashirvaad Atta 5kg";
    else if (cleaned.includes("butter")) productName = "Amul Butter 100g";

    return {
      customerName,
      productName,
      quantity,
      price: quantity > 0 ? Math.round(amount / quantity) : amount,
      amount,
      type,
      status
    };
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text?.trim() || "{}";
    const cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (err) {
    console.error("Gemini parse voice parser error:", err);
    throw err;
  }
}
