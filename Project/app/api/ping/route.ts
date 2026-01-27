/**
 * Health Check API Endpoint
 *
 * GET /api/ping
 *
 * Returns system health status including API availability, database connectivity,
 * and uptime information. Tests Flight, Hotel, and Voucher service databases.
 *
 * @returns {JSON} Health status
 */

import { NextRequest, NextResponse } from "next/server";
import {
  supabaseServerClient as flightDb,
  testDatabaseConnection as testFlightDb,
} from "@/lib/flight/supabaseServerClient";
import { supabaseServerClient as hotelDb } from "@/lib/hotel/supabaseServerClient";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

interface HealthStatus {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  api: "ok" | "error";
  services: {
    flight_db: "ok" | "error";
    hotel_db: "ok" | "error";
    voucher_db: "ok" | "error";
  };
  performance: {
    api_response_time_ms: number;
    flight_db_response_time_ms: number;
    hotel_db_response_time_ms: number;
    voucher_db_response_time_ms: number;
  };
  version: string;
  environment: string;
  uptime_seconds: number;
  error?: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // Test Flight database
    let flightDbStatus: "ok" | "error" = "error";
    let flightDbTime = 0;
    try {
      const dbStart = Date.now();
      const dbHealthy = await testFlightDb();
      flightDbTime = Date.now() - dbStart;
      flightDbStatus = dbHealthy ? "ok" : "error";
    } catch (err) {
      console.error("Flight DB health check failed:", err);
    }

    // Test Hotel database
    let hotelDbStatus: "ok" | "error" = "error";
    let hotelDbTime = 0;
    let hotelDbError = "";
    try {
      const dbStart = Date.now();
      const { data, error } = await hotelDb
        .from("hotels")
        .select("id")
        .limit(1);
      hotelDbTime = Date.now() - dbStart;
      if (error) {
        console.error("Hotel DB query error:", error);
        hotelDbError = error.message;
        hotelDbStatus = "error";
      } else {
        hotelDbStatus = "ok";
        console.log(
          "Hotel DB check successful, found",
          data?.length || 0,
          "hotels",
        );
      }
    } catch (err) {
      console.error("Hotel DB health check failed:", err);
      hotelDbError = err instanceof Error ? err.message : "Unknown error";
    }

    // Test Voucher database
    let voucherDbStatus: "ok" | "error" = "error";
    let voucherDbTime = 0;
    let voucherDbError = "";
    try {
      const dbStart = Date.now();
      const supabase = createServiceSupabaseClient();
      const { error } = await supabase
        .from("vouchers")
        .select("count", { count: "exact", head: true });
      voucherDbTime = Date.now() - dbStart;
      if (error && error.code !== "PGRST205") {
        console.error("Voucher DB query error:", error);
        voucherDbError = error.message;
        voucherDbStatus = "error";
      } else {
        voucherDbStatus = "ok";
        console.log("Voucher DB check successful");
      }
    } catch (err) {
      console.error("Voucher DB health check failed:", err);
      voucherDbError = err instanceof Error ? err.message : "Unknown error";
    }

    const uptime = process.uptime ? process.uptime() : 0;
    const overallStatus =
      flightDbStatus === "ok" &&
      hotelDbStatus === "ok" &&
      voucherDbStatus === "ok"
        ? "ok"
        : "degraded";

    // All systems operational
    const response: HealthStatus = {
      status: overallStatus,
      timestamp,
      api: "ok",
      services: {
        flight_db: flightDbStatus,
        hotel_db: hotelDbStatus,
        voucher_db: voucherDbStatus,
      },
      performance: {
        api_response_time_ms: Date.now() - startTime,
        flight_db_response_time_ms: flightDbTime,
        hotel_db_response_time_ms: hotelDbTime,
        voucher_db_response_time_ms: voucherDbTime,
      },
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptime_seconds: Math.floor(uptime),
      error: hotelDbError || voucherDbError || undefined,
    };

    const statusCode = overallStatus === "ok" ? 200 : 503;
    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    const response: HealthStatus = {
      status: "error",
      timestamp,
      api: "error",
      services: {
        flight_db: "error",
        hotel_db: "error",
        voucher_db: "error",
      },
      performance: {
        api_response_time_ms: Date.now() - startTime,
        flight_db_response_time_ms: 0,
        hotel_db_response_time_ms: 0,
        voucher_db_response_time_ms: 0,
      },
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptime_seconds: 0,
      error: errorMessage,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
