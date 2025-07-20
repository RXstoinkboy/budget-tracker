/// <reference types="@supabase/supabase-js" />

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import '@supabase/supabase-js';
import { Hono } from "jsr:@hono/hono";
import { HTTPException } from "jsr:@hono/hono/http-exception";
import { getAuthToken, getUser } from "./auth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import * as gocardless from "./gocardless.ts";
import * as session from "./session.ts";
import { createSupabaseClient } from "../_shared/supabase.ts";

// TODO: session is not being saved to database

// Custom environment type for Supabase client
type Env = {
  Variables: {
    user: any;
    supabaseClient: any;
    goCardlessSession: any;
  };
};

const app = new Hono<Env>().basePath("/bank_integration");

// Middleware for authentication and session setup
app.use("*", async (c, next) => {
  try {
    const token = getAuthToken(c.req.raw);
    const supabaseClient = createSupabaseClient(token);
    const user = await getUser(token, supabaseClient);

    // Initialize GoCardless session
    let goCardlessSession = await session.getGocardlessSession(
      user.id,
      supabaseClient,
    );
    if (!goCardlessSession) {
      goCardlessSession = await gocardless.getToken(user.id, supabaseClient);
    }

    const now = new Date();
    const bufferTimeMs = 2 * 60 * 1000; // 2 minutes in milliseconds
    const accessExpiresDate = new Date(goCardlessSession.accessExpires);

    if (accessExpiresDate.getTime() < now.getTime() + bufferTimeMs) {
      try {
        goCardlessSession = await gocardless.refreshToken(
          user.id,
          goCardlessSession,
          supabaseClient,
        );
      } catch (error) {
        // If refresh token fails, get a new token
        console.log("Refresh token failed, getting new token");
        goCardlessSession = await gocardless.getToken(user.id, supabaseClient);
      }
    }

    // Set variables for use in route handlers
    c.set("user", user);
    c.set("supabaseClient", supabaseClient);
    c.set("goCardlessSession", goCardlessSession);

    await next();
  } catch (error) {
    console.error("Middleware error:", error);

    if (error instanceof HTTPException) {
      throw error; // Re-throw HTTPExceptions to let Hono handle them
    }

    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (errorMessage.includes("Unauthorized")) {
        statusCode = 401;
      }
    }

    throw new HTTPException(statusCode as 400 | 401 | 500, {
      message: errorMessage,
    });
  }
});

// Routes
app.get("/", (c) => {
  return c.json({ message: "Bank Integration API" });
});

app.get("/institutions", async (c) => {
  const countryCode = c.req.query("country") || "GB";
  const goCardlessSession = c.get("goCardlessSession");

  const institutions = await gocardless.getInstitutions(
    countryCode,
    goCardlessSession.accessToken,
  );
  return c.json(institutions);
});

app.post("/accounts", async (c) => {
  // TODO: implementation needed
  /**
   * 1. fetch accounts for the first time from gocardless api using requisition_id
   * 2. save account ids with some additional info from earlier like (logo img url, bank name, requisition_id should also be saved together with it)
   * 3. I might also have to allow user to decide which bank accounts they want to sync if they have multiple ibans in that bank
   * 4. I have to fetch account details to get info like iban, name product etc and then store it in db
   * 5. after that I can use data from above to display synced accounts details
   * 6. use saved account if in order to perform stuff like fetching transactions etc
   */
  const { requisitionId } = await c.req.json();
  const user = c.get("user");
  const goCardlessSession = c.get("goCardlessSession");

  const accounts = await gocardless.getBankAccounts(
    user.id,
    goCardlessSession.accessToken,
  );
  return c.json(accounts);
});

app.get("/transactions/:accountId", async (c) => {
  const accountId = c.req.param("accountId");
  const goCardlessSession = c.get("goCardlessSession");

  const transactions = await gocardless.getTransactions(
    accountId,
    goCardlessSession.accessToken,
  );
  return c.json(transactions);
});

// Create new requisitions to selected bank
app.post("/requisitions", async (c) => {
  const { institutionId, redirectUrl } = await c.req.json();
  const user = c.get("user");
  const supabaseClient = c.get("supabaseClient");
  const goCardlessSession = c.get("goCardlessSession");

  if (!institutionId || !redirectUrl) {
    throw new HTTPException(400, {
      message: "Institution ID and redirect URL are required",
    });
  }

  // Create end user agreement
  // const agreement = await gocardless.createEndUserAgreement(
  //     institutionId,
  //     goCardlessSession.accessToken,
  // );

  // TODO: improvement needed
  /**
   * 1. currently it works really bad because user can only have a single requisition for given bank
   *      I think that they should actually be able to have multiple requisitions for a single bank
   * 2. user should also be able to delete requisition which has been once created
   */
  const existingRequisition = await gocardless.getRequisition({
    userId: user.id,
    institutionId,
    supabaseClient,
  });

  if (existingRequisition && existingRequisition.status !== "linked") {
    await gocardless.deleteRequisition(
      existingRequisition.requisition_id,
      goCardlessSession.accessToken,
      supabaseClient,
    );
  }

  if (existingRequisition && existingRequisition.status === "linked") {
    return c.json(existingRequisition);
  }

  const requisition = await gocardless.createRequisition(
    {
      institutionId,
      userId: user.id,
      // agreementId: agreement?.id,
      redirectUrl,
      accessToken: goCardlessSession.accessToken,
      status: "pending",
    },
    supabaseClient,
  );

  return c.json(requisition);
});

app.put("/requisitions/:requisitionId/status", async (c) => {
  const requisitionId = c.req.param("requisitionId");
  const { status } = await c.req.json();
  const supabaseClient = c.get("supabaseClient");

  if (!requisitionId || !status) {
    throw new HTTPException(400, {
      message: "Requisition ID and status are required",
    });
  }

  console.log("Updating requisition status", { requisitionId, status });
  const { error } = await supabaseClient.from("requisitions").update({
    status,
  }).eq("requisition_id", requisitionId);

  if (error) {
    console.error(`Error updating requisition status: ${error.message}`);
    console.error(
      `Tried with data: ${JSON.stringify({ requisitionId, status })}`,
    );
    throw new HTTPException(500, {
      message: "Error updating requisition status",
    });
  }

  return c.json({
    message: "Requisition status updated",
    status: 200,
  });
});

// Handle CORS
app.options("*", (c) => {
  return new Response("ok", {
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
});

// Handle 404s
app.notFound((c) => {
  return c.json({
    error: "Invalid endpoint",
    message: `Endpoint ${c.req.method} ${c.req.path} not found`,
  }, 404);
});

// Handle errors
app.onError((err, c) => {
  console.error("Unhandled error:", err);

  // If it's an HTTPException, use its status and message
  if (err instanceof HTTPException) {
    return c.json({
      error: err.message,
      status: err.status,
    }, err.status);
  }

  // Handle other known error types
  if (err instanceof Error) {
    // Check for specific error patterns
    if (
      err.message.includes("Unauthorized") ||
      err.message.includes("Invalid token")
    ) {
      return c.json({
        error: "Unauthorized",
        message: "Authentication required or token invalid",
      }, 401);
    }

    if (err.message.includes("Forbidden")) {
      return c.json({
        error: "Forbidden",
        message: "Access denied",
      }, 403);
    }

    if (err.message.includes("Not found")) {
      return c.json({
        error: "Not found",
        message: err.message,
      }, 404);
    }

    // Log the full error for debugging but return a sanitized message
    console.error("Application error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });

    return c.json({
      error: "Application error",
      message: err.message,
    }, 500);
  }

  // Fallback for unknown error types
  return c.json({
    error: "Internal server error",
    message: "An unexpected error occurred",
  }, 500);
});

Deno.serve(app.fetch);

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/bank_integration/institutions' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
