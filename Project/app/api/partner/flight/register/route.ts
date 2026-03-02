import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

/**
 * GET /api/partner/flight/register - Check flight partner status
 * POST /api/partner/flight/register - Register as airline partner
 * Uses real `flight_partners` table + adds new columns via migration
 */

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: { code: "NOT_AUTH" } }, { status: 401 });

        const { data: profile } = await reviewsClient
            .from("partner_profiles")
            .select("*")
            .eq("owner_user_id", userId)
            .eq("partner_type", "flight")
            .single();

        if (!profile) {
            return NextResponse.json({ error: { code: "NOT_PARTNER" } }, { status: 404 });
        }

        let airline = null;
        if (profile.entity_id) {
            const { data } = await reviewsClient
                .from("flight_partners")
                .select("*")
                .eq("id", profile.entity_id)
                .single();
            airline = data;
        }

        return NextResponse.json({ success: true, data: { profile, airline } });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: { code: "NOT_AUTH" } }, { status: 401 });

        const { data: existing } = await reviewsClient
            .from("partner_profiles")
            .select("id, status")
            .eq("owner_user_id", userId)
            .eq("partner_type", "flight")
            .single();

        if (existing) {
            return NextResponse.json(
                { error: { code: "ALREADY_APPLIED", message: `Already registered (status: ${existing.status})` } },
                { status: 409 }
            );
        }

        const body = await request.json();
        const {
            airline_name, airline_code, display_name, description,
            headquarters_city, headquarters_country, hub_airports,
            fleet_size, email, phone, website,
            air_operator_certificate, business_registration_number, tax_id
        } = body;

        if (!airline_name) {
            return NextResponse.json({ error: "Airline name is required" }, { status: 400 });
        }

        // Check airline code uniqueness
        if (airline_code) {
            const { data: codeCheck } = await reviewsClient
                .from("flight_partners")
                .select("id")
                .eq("airline_code", airline_code.toUpperCase())
                .single();
            if (codeCheck) {
                return NextResponse.json({ error: "Airline code already taken" }, { status: 409 });
            }
        }

        // 1. Insert into flight_partners (real schema)
        // Real columns: id, airline_code, name, logo_url, website_url, commission_rate,
        //               is_active, api_config, status, rejection_reason
        // + new migration columns: owner_user_id, email, phone, description,
        //   headquarters_city, headquarters_country, hub_airports, fleet_size,
        //   air_operator_certificate, business_registration_number, tax_id, display_name
        const { data: airline, error: airlineError } = await reviewsClient
            .from("flight_partners")
            .insert({
                name: airline_name,
                airline_code: airline_code ? airline_code.toUpperCase() : `PRIV-${Date.now()}`,
                website_url: website || null,
                commission_rate: 0.08,
                is_active: true,
                status: "approved",
                api_config: {},
                // New migration columns:
                owner_user_id: userId,
                email: email || null,
                phone: phone || null,
                description: description || null,
                display_name: display_name || airline_name,
                headquarters_city: headquarters_city || null,
                headquarters_country: headquarters_country || 'VN',
                hub_airports: hub_airports || [],
                fleet_size: fleet_size || 0,
                air_operator_certificate: air_operator_certificate || null,
                business_registration_number: business_registration_number || null,
                tax_id: tax_id || null,
            })
            .select()
            .single();

        if (airlineError) throw new Error(airlineError.message);

        // 2. Create partner profile
        const { data: profile, error: profileError } = await reviewsClient
            .from("partner_profiles")
            .insert({
                owner_user_id: userId,
                partner_type: "flight",
                status: "approved",
                entity_id: airline.id,
                business_name: airline_name,
                business_email: email,
                business_phone: phone,
                tax_id,
                business_registration_number,
                metadata: { airline_code, headquarters_city, fleet_size }
            })
            .select()
            .single();

        if (profileError) {
            await reviewsClient.from("flight_partners").delete().eq("id", airline.id);
            throw new Error(profileError.message);
        }

        return NextResponse.json({ success: true, data: { profile, airline } }, { status: 201 });
    } catch (err: any) {
        console.error("Flight partner register error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
