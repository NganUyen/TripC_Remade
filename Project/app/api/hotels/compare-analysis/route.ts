/**
 * AI-Powered Hotel Comparison Analysis
 * Generates intelligent recommendations using Deepseek AI
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

interface Hotel {
  id: number;
  name: string;
  location: string;
  rating: number;
  ratingLabel: string;
  reviews: number;
  stars: number;
  priceNew: number;
  priceOld: number;
  amenities: string[];
  wellness?: number;
  roomSize?: number;
  distance?: number;
}

interface ComparisonRequest {
  hotels: Hotel[];
  userPreferences?: {
    budget?: string;
    priorities?: string[];
    travelPurpose?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: ComparisonRequest = await req.json();
    const { hotels, userPreferences } = body;

    if (!hotels || hotels.length < 2) {
      return NextResponse.json(
        { error: "At least 2 hotels required for comparison" },
        { status: 400 },
      );
    }

    // Prepare hotel data for AI analysis
    const hotelSummaries = hotels
      .map(
        (hotel, index) => `
Hotel ${index + 1}: ${hotel.name}
- Location: ${hotel.location}
- Price: $${hotel.priceNew}/night (${hotel.priceOld ? `was $${hotel.priceOld}` : "no discount"})
- Rating: ${hotel.rating}/10 (${hotel.reviews} reviews)
- Stars: ${hotel.stars}-star
- Wellness Score: ${hotel.wellness || "N/A"}/10
- Room Size: ${hotel.roomSize || "N/A"} sqft
- Distance from center: ${hotel.distance || "N/A"} miles
- Top Amenities: ${hotel.amenities.slice(0, 5).join(", ")}
`,
      )
      .join("\n");

    const userContext = userPreferences
      ? `
User Preferences:
- Budget: ${userPreferences.budget || "Not specified"}
- Priorities: ${userPreferences.priorities?.join(", ") || "Not specified"}
- Travel Purpose: ${userPreferences.travelPurpose || "Not specified"}
`
      : "";

    const prompt = `You are an elite hospitality consultant and travel advisor with expertise in luxury hotel analysis. Provide a sophisticated, professional comparison analysis with refined language and expert insights.

${hotelSummaries}
${userContext}

Provide a detailed JSON response with the following structure:
{
  "verdict": "A polished, professional 2-3 sentence executive summary identifying the superior choice with compelling rationale. Use sophisticated language, avoid casual phrases, and focus on unique differentiators, guest experience quality, and tangible value propositions.",
  "bestValue": "Hotel name with an elegant explanation of its value proposition",
  "bestRated": "Hotel name with refined reasoning for its quality distinction",
  "bestFor": {
    "families": "Hotel name with sophisticated analysis of family-friendly attributes",
    "business": "Hotel name with professional insight on business travel suitability",
    "luxury": "Hotel name with refined evaluation of luxury experience elements",
    "budget": "Hotel name with tactful assessment of value-conscious appeal"
  },
  "insights": [
    "Professional insight highlighting distinctive competitive advantages",
    "Expert observation on service excellence or facility differentiation",
    "Strategic analysis of guest satisfaction patterns or operational excellence"
  ],
  "warnings": [
    "Tactfully worded considerations or potential limitations to be aware of"
  ],
  "recommendation": "Refined, personalized closing recommendation (1-2 sentences) with sophisticated reasoning"
}

Guidelines for professional tone:
- Use elevated vocabulary: "distinguished," "exemplary," "noteworthy," "exceptional," "refined"
- Avoid casual language: Replace "good" with "excellent," "nice" with "sophisticated," "great" with "outstanding"
- Be specific and data-driven: Reference actual metrics (review counts, ratings, amenities)
- Maintain objectivity: Present balanced analysis while highlighting clear differentiators
- Use industry terminology: "operational excellence," "guest satisfaction metrics," "service standards," "hospitality portfolio"
- Write with authority: Sound like a seasoned consultant providing expert guidance

Be specific, use actual hotel names, and provide actionable, professionally articulated insights that reflect deep industry knowledge.`;

    // Call Deepseek AI
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || "";

    // Parse AI response
    let analysis;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch =
        content.match(/```json\n([\s\S]*?)\n```/) ||
        content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback response
      analysis = {
        verdict: content.substring(0, 300),
        bestValue: hotels[0].name,
        bestRated: hotels[0].name,
        insights: ["AI analysis in progress..."],
        recommendation: "Please compare the options based on your preferences.",
      };
    }

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI comparison analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate comparison analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
