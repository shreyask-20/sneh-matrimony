import { NextResponse } from "next/server";

/**
 * Standardized error handler for API route handlers.
 * Wraps async route handlers to catch unhandled errors and return
 * consistent JSON error responses.
 *
 * @example
 * export const POST = apiErrorWrapper(async (request: NextRequest) => {
 *   // ... your handler logic
 *   return NextResponse.json({ ok: true });
 * });
 */
export function apiErrorWrapper(
  handler: (request: Request, context?: unknown) => Promise<NextResponse>
) {
  return async (request: Request, context?: unknown): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Prisma known errors
      if (error && typeof error === "object" && "code" in error) {
        const prismaError = error as { code: string; message?: string };

        // Unique constraint violation
        if (prismaError.code === "P2002") {
          return NextResponse.json(
            { error: "A record with this value already exists." },
            { status: 409 }
          );
        }

        // Record not found
        if (prismaError.code === "P2025") {
          return NextResponse.json(
            { error: "The requested record was not found." },
            { status: 404 }
          );
        }

        // Foreign key constraint
        if (prismaError.code === "P2003") {
          return NextResponse.json(
            { error: "Invalid reference. The related record does not exist." },
            { status: 400 }
          );
        }
      }

      // Log the error for debugging (server-side only)
      console.error("API route error:", error);

      // Don't leak internal error details to the client
      return NextResponse.json(
        { error: "An unexpected error occurred. Please try again." },
        { status: 500 }
      );
    }
  };
}

/**
 * Parse request body with error handling.
 * Returns the parsed body or throws a NextResponse with 400 status.
 */
export async function parseRequestBody<T = Record<string, unknown>>(
  request: Request
): Promise<T> {
  try {
    const body = await request.json();
    return body as T;
  } catch {
    throw new NextResponse(
      JSON.stringify({ error: "Invalid JSON in request body." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Validate that a value is a valid number (not NaN).
 */
export function parseNumericId(value: string | undefined, fieldName = "id"): number {
  const num = Number(value);
  if (isNaN(num)) {
    throw new NextResponse(
      JSON.stringify({ error: `Invalid ${fieldName}.` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  return num;
}
