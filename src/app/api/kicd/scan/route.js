// src/app/api/kicd/scan/route.js
import { NextResponse } from 'next/server';
import { adminRefreshCurriculum } from '@/lib/services/curriculumExtractor';

export async function POST(req) {
  try {
    // TODO: add admin auth check
    const res = await adminRefreshCurriculum();
    return NextResponse.json({ ok: true, results: res });
  } catch (err) {
    console.error('scan route error', err);
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
