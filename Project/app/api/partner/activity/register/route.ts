import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

/**
 * GET /api/partner/activity/register - Check activity partner status
 * POST /api/partner/activity/register - Register as activity operator
 * Uses new `activity_operators` table created by migration
 */

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return NextResponse.json({ error: { code: "NOT_AUTH" } }, { status: 401 });

        const { data: profile } = await reviewsClient
            .from("partner_profiles")
            .select("*")
            .eq("owner_user_id", userId)
            .eq("partner_type", "activity")
            .single();

        if (!profile) {
            return NextResponse.json({ error: { code: "NOT_PARTNER" } }, { status: 404 });
        }

        let operator = null;
        if (profile.entity_id) {
            const { data } = await reviewsClient
                .from("activity_operators")
                .select("*")
                .eq("id", profile.entity_id)
                .single();
            operator = data;
        }

        return NextResponse.json({ success: true, data: { profile, operator } });
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
            .eq("partner_type", "activity")
            .single();

        if (existing) {
            return NextResponse.json(
                { error: { code: "ALREADY_APPLIED", message: `Already registered (status: ${existing.status})` } },
                { status: 409 }
            );
        }

        const body = await request.json();
        const {
            company_name, activity_types, email, phone, website,
            base_city, service_areas, tourism_license,
            business_registration_number, tax_id, description
        } = body;

        if (!company_name) {
            return NextResponse.json({ error: "Company name is required" }, { status: 400 });
        }

        // 1. Insert into activity_operators
        const { data: operator, error: opError } = await reviewsClient
            .from("activity_operators")
            .insert({
                owner_user_id: userId,
                company_name,
                description: description || null,
                activity_types: activity_types || [],
                base_city: base_city || null,
                service_areas: service_areas || [],
                email: email || null,
                phone: phone || null,
                website: website || null,
                is_active: true,
                is_verified: false,
                tourism_license: tourism_license || null,
                business_registration_number: business_registration_number || null,
                tax_id: tax_id || null,
            })
            .select()
            .single();

        if (opError) throw new Error(opError.message);

        // 2. Create partner profile
        const { data: profile, error: profileError } = await reviewsClient
            .from("partner_profiles")
            .insert({
                owner_user_id: userId,
                partner_type: "activity",
                status: "approved",
                entity_id: operator.id,
                business_name: company_name,
                business_email: email,
                business_phone: phone,
                tax_id,
                business_registration_number,
                metadata: { activity_types, base_city, service_areas }
            })
            .select()
            .single();

        if (profileError) {
            await reviewsClient.from("activity_operators").delete().eq("id", operator.id);
            throw new Error(profileError.message);
        }

        return NextResponse.json({ success: true, data: { profile, operator } }, { status: 201 });
    } catch (err: any) {
        console.error("Activity partner register error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
