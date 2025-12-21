import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Utility function to initialize Supabase client on the server side
// It uses the non-public keys for security and higher access
const createServerClient = () => {
    // NOTE: This assumes SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env.local
    const SUPABASE_URL = process.env.SUPABASE_URL;
    // For server-side access, ideally use the Service Role Key for elevated permissions.
    // If you haven't set up the Service Role Key, you might temporarily use SUPABASE_ANON_KEY here, 
    // but the service key is SECURE BEST PRACTICE.
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY; 

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Supabase environment variables are missing for the API route.');
    }

    // Set auth to null for service role access, or pass an auth token if fetching user data
    return createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: false,
        }
    });
};


/**
 * GET handler to fetch hierarchical Scheme of Work (SOW) data.
 * Supports filtering by grade and subject via URL parameters.
 * e.g., /api/sow?grade=7&subject=Social Studies
 */
export async function GET(request) {
    try {
        const supabase = createServerClient();
        
        // Extract filters from the URL
        const { searchParams } = new URL(request.url);
        const gradeFilter = searchParams.get('grade');
        const subjectFilter = searchParams.get('subject');

        let query = supabase
            .from('subjects')
            .select(`
                id, 
                grade, 
                name, 
                strands (
                    id, 
                    title, 
                    substrands (
                        id, 
                        title, 
                        learning_area,
                        lessons (
                            id,
                            title
                        )
                    )
                )
            `);

        // Apply filters if present
        if (gradeFilter) {
            // Ensure grade is parsed as an integer for the database
            query = query.eq('grade', parseInt(gradeFilter));
        }
        if (subjectFilter) {
            query = query.eq('name', subjectFilter);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase fetch error:', error);
            // Return a standard 500 error but keep the detailed error internal
            return NextResponse.json({ 
                error: 'Failed to fetch curriculum data.', 
                details: error.message 
            }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('API Route Error:', error.message);
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            details: error.message 
        }, { status: 500 });
    }
}
