import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { buildSchemePdf } from '@/lib/pdf/buildSchemePdf';

export async function GET(req, { params }) {
  const schemeId = params.id;

  // ===== FETCH SCHEME =====
  const { data: scheme, error } = await supabase
    .from('schemes')
    .select('*')
    .eq('id', schemeId)
    .single();

  if (error || !scheme) {
    return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
  }

  // 🔒 PAYMENT GATE (CRITICAL)
  if (scheme.status !== 'PAID') {
    return NextResponse.json(
      { error: 'Payment required' },
      { status: 403 }
    );
  }

  // ===== FETCH LESSONS =====
  const { data: lessons } = await supabase
    .from('scheme_lessons')
    .select('*')
    .eq('scheme_id', schemeId)
    .order('week');

  // ===== BUILD PDF =====
  const pdfStream = buildSchemePdf({ scheme, lessons });

  const chunks = [];
  for await (const chunk of pdfStream) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Scheme_${schemeId}.pdf"`
    }
  });
}
