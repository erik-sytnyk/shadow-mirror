import { NextResponse } from "next/server";
import { getAvailableModels } from "../chat/route";

export async function GET() {
  return NextResponse.json({ models: getAvailableModels() });
}
