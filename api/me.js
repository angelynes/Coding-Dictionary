// Who is signed in? The page uses this to show or hide the editing buttons.
import { getSession, json } from './_lib/session.js';

export async function GET(request) {
	const session = await getSession(request);
	if (!session) return json({ signedIn: false }, 401);
	return json({ signedIn: true, login: session.login });
}
