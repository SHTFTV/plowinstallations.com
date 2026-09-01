import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini AI setup
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API: AI Master Tech & Diagnostic Route
app.post("/api/ai/diagnose", async (req, res) => {
  try {
    const { vehicle, plowSystem, issueType, description, symptoms } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in the environment.",
      });
    }

    const ai = getGeminiClient();

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
    return res.json({ result: outputText });
  } catch (error: any) {
    console.error("AI Diagnostic Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate technical diagnostic advice.",
    });
  }
});

// API: Fitment & Ballast Calculation Advisor AI
app.post("/api/ai/fitment-advise", async (req, res) => {
  try {
    const { vehicleYear, vehicleMake, vehicleModel, trim, plowModel, spreaderModel } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in the environment.",
      });
    }

    const ai = getGeminiClient();

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

    return res.json({ result: response.text || "Fitment analysis completed." });
  } catch (error: any) {
    console.error("AI Fitment Advisor Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate fitment guidance.",
    });
  }
});

// Vite / static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PlowInstallations.com server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
