import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: 1, title: "History of Africa", price: 0 },
    { id: 2, title: "Evolution Biology 101", price: 10 },
  ]);
}
