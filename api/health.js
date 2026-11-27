// Quick check that Vercel runs the files in /api (used by sign-in and saving).
export function GET() {
	return Response.json({ ok: true });
}
