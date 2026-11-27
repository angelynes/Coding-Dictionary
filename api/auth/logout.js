// Sign out.
import { clearSession } from '../_lib/session.js';

export function POST() {
	return new Response(null, { status: 204, headers: { 'set-cookie': clearSession() } });
}
