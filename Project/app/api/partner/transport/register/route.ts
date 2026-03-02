import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

/**
 * GET /api/partner/transport/register - Check transport partner status
 * POST /api/partner/transport/register - Register as transport partner
 * Uses real `transport_providers` table (has owner_id text column)
 */

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: { code: "NOT_AUTH" } }, { status: 401 });

        const { data: profile } = await reviewsClient
            .from("partner_profiles")
            .select("*")
            .eq("owner_user_id", userId)
            .eq("partner_type", "transport")
            .single();

        if (!profile) {
            return NextResponse.json({ error: { code: "NOT_PARTNER" } }, { status: 404 });
        }

        let provider = null;
        if (profile.entity_id) {
            const { data } = await reviewsClient
                .from("transport_providers")
                .select("*")
                .eq("id", profile.entity_id)
                .single();
            provider = data;
        }

        return NextResponse.json({ success: true, data: { profile, provider } });
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
            .eq("partner_type", "transport")
            .single();

        if (existing) {
            return NextResponse.json(
                { error: { code: "ALREADY_APPLIED", message: `Already registered (status: ${existing.status})` } },
                { status: 409 }
            );
        }

        const body = await request.json();
        const {
            company_name, operator_type, email, phone, website,
            headquarters_city, service_regions, fleet_size, vehicle_types,
            business_registration_number, tax_id, operating_license, description
        } = body;

        if (!company_name) {
            return NextResponse.json({ error: "Company name is required" }, { status: 400 });
        }

        // 1. Insert into transport_providers (real schema)
        // Real columns: id, name, logo_url, rating, created_at, owner_id,
        //               contact_email, contact_phone, address, website, description, updated_at,
        //               commission_rate, voucher_enabled
        // + new columns from migration: operator_type, fleet_size, vehicle_types, service_regions,
        //                               headquarters_city, business_registration_number, tax_id,
        //                               operating_license, is_verified
        const { data: provider, error: providerError } = await reviewsClient
            .from("transport_providers")
            .insert({
                name: company_name,
                description: description || null,
                owner_id: userId,
                contact_email: email || null,
                contact_phone: phone || null,
                website: website || null,
                rating: 0,
                commission_rate: 0.10,
                voucher_enabled: true,
                // New migration columns:
                operator_type: operator_type || 'bus',
                fleet_size: fleet_size || 0,
                vehicle_types: vehicle_types || [],
                service_regions: service_regions || [],
                headquarters_city: headquarters_city || null,
                business_registration_number: business_registration_number || null,
                tax_id: tax_id || null,
                operating_license: operating_license || null,
                is_verified: false,
            })
            .select()
            .single();

        if (providerError) throw new Error(providerError.message);

        // 2. Create partner profile
        const { data: profile, error: profileError } = await reviewsClient
            .from("partner_profiles")
            .insert({
                owner_user_id: userId,
                partner_type: "transport",
                status: "approved",
                entity_id: provider.id,
                business_name: company_name,
                business_email: email,
                business_phone: phone,
                tax_id,
                business_registration_number,
                metadata: { operator_type, fleet_size, headquarters_city }
            })
            .select()
            .single();

        if (profileError) {
            await reviewsClient.from("transport_providers").delete().eq("id", provider.id);
            throw new Error(profileError.message);
        }

        return NextResponse.json({ success: true, data: { profile, provider } }, { status: 201 });
    } catch (err: any) {
        console.error("Transport partner register error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
