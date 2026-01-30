/**
 * TripC AI Chatbot - Smart Suggestions API
 *
 * Generates 3 contextually relevant suggestions based on recent conversation
 * using Deepseek AI
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client with Deepseek endpoint
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 },
      );
    }

    // Get last 3-5 messages for context
    const recentMessages = messages.slice(-5);

    // Create a prompt to generate suggestions
    const suggestionPrompt = `Based on this conversation, generate exactly 3 short, actionable suggestions (max 6 words each) for what the user might want to ask next. Focus on natural next steps in their travel planning journey.

Recent conversation:
${recentMessages.map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`).join("\n")}

Rules:
1. Each suggestion must be 3-6 words maximum
2. Make them actionable (start with verbs like "Find", "Search", "Book", "Show", etc.)
3. Be specific to travel services (hotels, flights, restaurants, activities, spa, transport, etc.)
4. If the conversation is about a specific destination, reference it
5. If user is searching, suggest booking. If booking, suggest related services
6. Return ONLY 3 suggestions as a JSON array, nothing else

Example format:
["Find luxury hotels in Bali", "Search direct flights to Tokyo", "Book spa treatments"]

Generate suggestions:`;

    // Call Deepseek API
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: suggestionPrompt,
        },
      ],
      temperature: 0.7, // More creative suggestions
      max_tokens: 100,
    });

    const content = response.choices[0]?.message?.content || "";

    // Try to parse the JSON response
    let suggestions: string[] = [];
    try {
      // Extract JSON array from response
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the whole content
        suggestions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI suggestions:", parseError);
      console.error("AI Response:", content);

      // Fallback to default suggestions
      suggestions = [
        "Find hotels nearby",
        "Search for flights",
        "Explore restaurants",
      ];
    }

    // Ensure we have exactly 3 suggestions
    if (suggestions.length > 3) {
      suggestions = suggestions.slice(0, 3);
    } else if (suggestions.length < 3) {
      // Pad with generic suggestions if needed
      const fallbacks = [
        "Find hotels nearby",
        "Search for flights",
        "Explore restaurants",
        "Book activities",
        "Find spa services",
      ];
      while (suggestions.length < 3) {
        suggestions.push(fallbacks[suggestions.length]);
      }
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestion generation error:", error);

    // Return default suggestions on error
    return NextResponse.json({
      suggestions: [
        "Find hotels nearby",
        "Search for flights",
        "Explore restaurants",
      ],
    });
  }
}
