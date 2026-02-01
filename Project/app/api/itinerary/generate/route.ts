/**
 * AI-Powered Itinerary Generation API
 * Generates personalized travel itineraries using Deepseek AI
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ItineraryGenerationRequest, Itinerary } from "@/types/itinerary";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

export async function POST(req: NextRequest) {
  console.log("[Itinerary API] Request received");

  try {
    // Check if API key is configured
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error("[Itinerary API] DEEPSEEK_API_KEY is not configured");
      return NextResponse.json(
        {
          success: false,
          error: "AI service is not configured. Please contact support.",
          details: "DEEPSEEK_API_KEY environment variable is missing",
        },
        { status: 500 },
      );
    }

    console.log("[Itinerary API] Parsing request body");
    const request: ItineraryGenerationRequest = await req.json();
    console.log("[Itinerary API] Request data:", {
      destination: request.destination,
      dates: `${request.startDate} to ${request.endDate}`,
    });

    // Validate required fields
    if (!request.destination || !request.startDate || !request.endDate) {
      console.error("[Itinerary API] Missing required fields");
      return NextResponse.json(
        {
          success: false,
          error: "Destination, start date, and end date are required",
        },
        { status: 400 },
      );
    }

    // Calculate number of days
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1 || days > 30) {
      return NextResponse.json(
        { error: "Trip duration must be between 1 and 30 days" },
        { status: 400 },
      );
    }

    // Build the AI prompt
    const prompt = `You are an expert travel planner creating a detailed, personalized itinerary. Generate a comprehensive day-by-day travel plan.

TRIP DETAILS:
- Destination: ${request.destination}
- Duration: ${days} days (${request.startDate} to ${request.endDate})
- Travelers: ${request.travelers.adults} adult(s)${request.travelers.children ? `, ${request.travelers.children} child(ren)` : ""}
- Budget Level: ${request.budget?.level || "moderate"}
- Travel Style: ${request.travelStyle.join(", ")}
- Interests: ${request.interests.join(", ")}
- Pace: ${request.pace || "moderate"}
${request.specialRequests ? `- Special Requests: ${request.specialRequests}` : ""}

Create a detailed JSON itinerary. Keep ALL descriptions under 120 characters.

JSON structure:
{
  "title": "Engaging trip title (max 80 chars)",
  "description": "Brief overview (max 120 chars)",
  "coverImage": "Suggested Unsplash image URL for destination",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Day title (max 60 chars)",
      "description": "Brief day overview (max 120 chars)",
      "activities": [
        {
          "id": "unique-id",
          "time": "09:00",
          "title": "Activity name (max 60 chars)",
          "description": "Concise description (max 120 chars)",
          "location": "Specific location (max 60 chars)",
          "duration": "2 hours",
          "cost": 50,
          "category": "sightseeing|dining|activity|shopping|transport|relaxation",
          "tips": ["Tip 1", "Tip 2"]
        }
      ],
      "meals": {
        "breakfast": "Restaurant or hotel name",
        "lunch": "Restaurant name",
        "dinner": "Restaurant name"
      },
      "accommodation": {
        "name": "Hotel name",
        "checkIn": "14:00",
        "checkOut": "12:00"
      },
      "transportation": [
        {
          "type": "taxi|flight|train|bus|walk",
          "from": "Starting point",
          "to": "Destination",
          "time": "10:00",
          "cost": 30
        }
      ],
      "notes": "Important notes for the day"
    }
  ],
  "budget": {
    "accommodation": 500,
    "transportation": 200,
    "food": 300,
    "activities": 400,
    "shopping": 100,
    "miscellaneous": 100,
    "total": 1600,
    "currency": "USD"
  },
  "tips": ["General tip 1", "General tip 2", "General tip 3"],
  "essentials": {
    "visa": "Visa requirements",
    "weather": "Expected weather",
    "currency": "Local currency",
    "language": "Local language",
    "bestTimeToVisit": "Best season",
    "packingList": ["Item 1", "Item 2", "Item 3"]
  }
}

CRITICAL REQUIREMENTS - MUST FOLLOW:
1. NEVER use "N/A", "TBD", "To be determined", or similar placeholders
2. For departure day: omit accommodation field entirely instead of writing N/A
3. For arrival day: provide actual check-in time (typically 14:00-15:00)
4. For all other days: use same accommodation with check-in "same hotel" and checkout "same hotel"
5. All times must be in HH:MM format (e.g., "14:00", "09:30")
6. All costs must be specific numbers, never zero unless truly free
7. All locations must be real, specific place names
8. All restaurant names must be actual establishments or describe the type (e.g., "Local Vietnamese restaurant near hotel")
9. All activities must have complete information: time, duration, cost, location
10. Every field must have meaningful content - if unsure, provide realistic placeholder

ACCOMMODATION RULES:
- Day 1 (arrival): Include accommodation with realistic check-in time
- Days 2-${days - 1}: Use "name": "Continue at [hotel name]", "checkIn": "already checked in", "checkOut": "staying overnight"
- Day ${days} (departure): OMIT accommodation field completely
- Never write "N/A (Departure Day)" or similar

MEAL RULES:
- Provide specific restaurant names or types (e.g., "Banh Mi Queen", "Rooftop seafood restaurant")
- For breakfast: suggest hotel breakfast or nearby cafe
- Never leave meal fields empty or use N/A

COST RULES:
- Activities: $5-$100 depending on type
- Transportation: $2-$50 depending on distance
- Meals: Breakfast $5-10, Lunch $10-20, Dinner $15-30
- Free activities should still show cost: 0

IMPORTANT GUIDELINES:
1. Schedule 4-6 activities per day based on pace (relaxed=4, moderate=5, packed=6)
2. Include realistic timing and durations - factor in traffic, queues, and rest breaks
3. Consider travel time between locations - provide realistic transportation estimates
4. Balance activity types throughout the trip - mix adventure, culture, relaxation, and dining
5. Include meal recommendations at appropriate times with specific local favorites
6. Suggest accommodations that match budget level and provide insider location tips
7. Provide practical, actionable tips from a local's perspective
8. Calculate realistic costs in USD based on current market prices
9. Include morning, afternoon, and evening activities with optimal timing
10. Consider the travelers (adults/children) when planning activities
11. Align with stated interests and travel style - personalize recommendations
12. Include local experiences and hidden gems that tourists often miss
13. Plan for rest/downtime - don't over-schedule
14. Provide backup options for weather-dependent activities

TONE & STYLE - WRITE LIKE AN EXPERIENCED TRAVELER FRIEND:
- Use conversational, friendly language (e.g., "You'll love...", "Don't miss...", "Pro tip:")
- Share insider knowledge and personal anecdotes in tips
- Include practical cautions (e.g., "Watch out for pickpockets", "Bring cash", "Book ahead")
- Provide time-saving advice (e.g., "Go early to beat crowds", "Skip the tourist trap at...")
- Mention local customs and etiquette
- Suggest what to wear, bring, or prepare
- Warn about common tourist mistakes
- Include alternative options (e.g., "If it's too crowded, try...")
- Add specific dining recommendations with signature dishes
- Mention best times to visit each attraction
- Include photography tips for scenic spots
- Provide safety and health precautions
- Share money-saving tricks
- Recommend authentic local experiences

TIPS MUST INCLUDE (for each activity when relevant):
- "Best time to visit is [time] because [reason]"
- "Bring [item] because [reason]"
- "Book [X days] in advance to avoid [issue]"
- "Watch out for [caution] - [advice]"
- "Local tip: [insider knowledge]"
- "If crowded, try [alternative]"
- "Don't forget to [important action]"
- "Skip the [tourist trap] and instead [better option]"

DAY NOTES SHOULD INCLUDE:
- Weather expectations and clothing recommendations
- Energy level assessment (light/moderate/heavy day)
- Important cultural considerations
- Safety reminders for specific areas
- Transportation tips between activities
- Estimated walking distance for the day
- Best areas for lunch/dinner based on location

CRITICAL JSON FORMATTING RULES:
- Return ONLY valid JSON with no markdown formatting
- Properly escape all special characters in strings (quotes, backslashes, newlines)
- Ensure all strings are properly closed with matching quotes
- Do NOT use line breaks within string values - use spaces instead
- Do NOT include any text before or after the JSON object
- Double-check all opening and closing braces, brackets, and quotes match
- Keep descriptions concise to avoid formatting issues (max 200 characters per field)

Return ONLY valid JSON, no additional text or markdown code blocks.`;

    // Call Deepseek AI
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are an experienced world traveler and local guide sharing personalized advice with a friend. Write in a warm, conversational tone with insider tips, practical cautions, and genuine recommendations. Include specific details like 'bring sunscreen', 'watch for pickpockets near X', 'best photo spot is Y', 'try the signature Z dish'. Generate ONLY valid, complete JSON. Keep descriptions under 120 chars but pack them with useful details.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 6000,
    });

    const content = response.choices[0]?.message?.content || "";
    console.log("[Itinerary API] Raw AI response length:", content.length);

    // Parse AI response
    let itineraryData;
    let jsonString = content; // Define outside try block for error logging

    try {
      // Try to extract JSON from markdown code blocks
      if (content.includes("```json")) {
        console.log("[Itinerary API] Detected markdown json code block");
        // Remove opening ```json and any whitespace after it
        jsonString = content.replace(/^```json\s*/, "");
        // Remove closing ``` and any whitespace before it
        jsonString = jsonString.replace(/\s*```\s*$/, "");
        console.log("[Itinerary API] Removed markdown wrappers");
      } else if (content.includes("```")) {
        console.log("[Itinerary API] Detected markdown code block");
        // Remove opening ``` and any whitespace after it
        jsonString = content.replace(/^```\s*/, "");
        // Remove closing ``` and any whitespace before it
        jsonString = jsonString.replace(/\s*```\s*$/, "");
        console.log("[Itinerary API] Removed markdown wrappers");
      } else if (content.trim().startsWith("{")) {
        console.log("[Itinerary API] Raw JSON detected");
        jsonString = content.trim();
      } else {
        // Last resort: try to find JSON object boundaries
        console.log("[Itinerary API] Attempting to extract JSON by boundaries");
        const firstBrace = content.indexOf("{");
        const lastBrace = content.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonString = content.substring(firstBrace, lastBrace + 1);
          console.log(
            "[Itinerary API] Extracted JSON from position",
            firstBrace,
            "to",
            lastBrace,
          );
        }
      }

      jsonString = jsonString.trim();
      console.log(
        "[Itinerary API] Attempting to parse JSON... (length:",
        jsonString.length,
        ")",
      );
      console.log(
        "[Itinerary API] First 100 chars:",
        jsonString.substring(0, 100),
      );
      console.log(
        "[Itinerary API] Last 100 chars:",
        jsonString.substring(jsonString.length - 100),
      );

      itineraryData = JSON.parse(jsonString);
      console.log("[Itinerary API] JSON parsed successfully");
    } catch (parseError) {
      console.error(
        "[Itinerary API] Failed to parse AI itinerary:",
        parseError,
      );

      // Try to get the position of the error if available
      if (parseError instanceof SyntaxError) {
        const match = parseError.message.match(/position (\d+)/);
        if (match) {
          const errorPos = parseInt(match[1]);
          const start = Math.max(0, errorPos - 200);
          const end = Math.min(jsonString.length, errorPos + 200);
          console.error(
            "[Itinerary API] Error context:",
            jsonString.substring(start, end),
          );
          console.error(
            "[Itinerary API] Error position marker:",
            " ".repeat(errorPos - start) + "^",
          );
        }
      }

      console.error(
        "[Itinerary API] Full content preview (first 1000 chars):",
        content.substring(0, 1000),
      );
      console.error(
        "[Itinerary API] Full content end (last 1000 chars):",
        content.substring(content.length - 1000),
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The AI generated invalid JSON. This sometimes happens with complex itineraries. Please try again, or try a shorter trip duration.",
          details:
            parseError instanceof Error ? parseError.message : "Parse error",
        },
        { status: 500 },
      );
    }

    // Build complete itinerary object
    const itinerary: Itinerary = {
      id: `itin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: itineraryData.title,
      description: itineraryData.description,
      destination: request.destination,
      startDate: request.startDate,
      endDate: request.endDate,
      numberOfDays: days,
      travelers: request.travelers,
      travelStyle: request.travelStyle,
      interests: request.interests,
      budget: itineraryData.budget,
      days: itineraryData.days,
      coverImage: itineraryData.coverImage,
      images: itineraryData.images || [],
      tips: itineraryData.tips || [],
      essentials: itineraryData.essentials,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      isAIGenerated: true,
    };

    return NextResponse.json({
      success: true,
      itinerary,
      message: "Itinerary generated successfully",
    });
  } catch (error) {
    console.error("Itinerary generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate itinerary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
