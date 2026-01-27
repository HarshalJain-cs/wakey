import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Check if email already exists
        const { data: existing } = await supabase
            .from("newsletter")
            .select("email")
            .eq("email", email)
            .single();

        if (existing) {
            return NextResponse.json(
                { message: "Already subscribed" },
                { status: 200 }
            );
        }

        // Insert new subscriber
        const { error } = await supabase.from("newsletter").insert([
            {
                email,
                subscribed_at: new Date().toISOString(),
                source: "website",
            },
        ]);

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json(
                { error: "Failed to subscribe" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Subscribed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Newsletter error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
