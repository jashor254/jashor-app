
export async function GET() {
  return Response.json([
    { id: 1, title: "Course 1" },
    { id: 2, title: "Course 2" }
  ]);
}