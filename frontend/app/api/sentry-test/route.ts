import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const error = new Error("Sentry test error via /api/sentry-test");
  Sentry.captureException(error);

  return NextResponse.json({ message: "Test error sent to Sentry." });
} 