import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: "GEMINI_API_KEY is not configured in the environment.",
    });
    return;
  }

  try {
    const { vehicleYear, vehicleMake, vehicleModel, trim, plowModel, spreaderModel } = req.body || {};

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `Act as an expert commercial truck equipment engineer. Provide a fitment suitability, electrical load assessment, and ballast requirement breakdown for this setup:
- Vehicle: ${vehicleYear} ${vehicleMake} ${vehicleModel} ${trim || ""}
- Front Plow: ${plowModel}
- Rear Spreader / Salter: ${spreaderModel || "None / Standard Bed Ballast"}

Please outline:
1. **Front Axle GAWR & Suspension Compatibility** (Will this plow exceed FGAWR? Are heavy-duty plow prep springs, Timbren SES, or air bags advised?)
2. **Electrical & Alternator Assessment** (Alternator amperage needed, dual battery recommendation, ignition sense circuit tie-in)
3. **Mounting Kit & Headlight Adapter Requirements** (Typical mount part numbers, LED vs Halogen adapter harness considerations)
4. **Calculated Ballast Recommendation** (Exact recommended ballast weight in lbs placed against tailgate behind rear axle to balance steering geometry and prevent FGAWR overload)
5. **Shop Labor Estimate** (Estimated standard shop hours for complete undercarriage, harness, lighting, and controller installation).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a commercial vehicle upfitting engineer specializing in snow & ice control equipment specs.",
        temperature: 0.3,
      },
    });

    res.status(200).json({ result: response.text || "Fitment analysis completed." });
  } catch (error: any) {
    console.error("AI Fitment Advisor Error:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate fitment guidance.",
    });
  }
}
