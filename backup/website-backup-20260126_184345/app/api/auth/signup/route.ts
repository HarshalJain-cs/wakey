// /app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`, // Set your public site URL
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // User needs to confirm email, so don't redirect yet
  return NextResponse.json({ message: 'Signup successful. Please check your email to confirm.' });
}
