import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    gApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.slice(0, 8) + "...",
  });
}
