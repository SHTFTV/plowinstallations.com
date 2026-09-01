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
    const { vehicle, plowSystem, issueType, description, symptoms } = req.body || {};

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `You are the Master Snow Plow & Salter Equipment Upfit & Electrical Specialist for independent truck equipment shops and mobile plow mechanics.
You have deep engineering expertise across all commercial plow systems (Western Fleet-Flex, Fisher MinuteMount 2, Boss SmartHitch 2, SnowDogg / Buyers HD/EX, Meyer EZ-Mount Plus / Super-V, SnowEx Automatixx, Hiniker, Sno-Way) and vehicle chassis (Ford Super Duty, GM Silverado/Sierra HD, RAM Heavy Duty, Toyota Tundra, medium-duty F550/Ram 5500/Isuzu).

Analyze this shop technical inquiry:
- **Vehicle Platform**: ${vehicle || "General / Unspecified"}
- **Plow / Spreader System**: ${plowSystem || "General Commercial Snow Equipment"}
- **Inquiry / Issue Category**: ${issueType || "General Troubleshooting"}
- **Symptoms / Details**: ${symptoms || description || "Diagnostic assistance needed"}

Provide a structured, technician-grade response with:
1. **Root Cause Analysis & Most Likely Failure Points** (mechanical, electrical harness, isolation module, hydraulic valve/solenoid coil, or vehicle body control module/lighting multiplexing).
2. **Step-by-Step Diagnostic & Multimeter Test Plan** (exact test pinouts, expected voltages (e.g. 12.6V ignition on, ground drop <0.2V), coil resistance in Ohms (e.g. S1/S2/S3 ~7-9Ω), hydraulic pressure relief checks in PSI).
3. **Manufacturer-Specific Wiring & Module Pinout Notes** (wire color codes, isolation module ports, fuse ratings, vehicle headlight adapter part notes).
4. **Independent Shop Upfit & Safety Best Practices** (dielectric protection, push beam clearance 14.5"-15.5", front axle GAWR compliance & required rear ballast lbs, Grade 8 bolt torque specifications).

Format your output in clean Markdown with bold bullet points, clear numbered steps, and warning callouts where relevant for cold-weather shop mechanics.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an elite master mechanic and commercial snow equipment electrical/hydraulic upfitter. Give concise, highly technical, actionable advice for independent plow shops and technicians.",
        temperature: 0.2,
      },
    });

    const outputText = response.text || "No diagnostic response generated.";
    res.status(200).json({ result: outputText });
  } catch (error: any) {
    console.error("AI Diagnostic Error:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate technical diagnostic advice.",
    });
  }
}
