// Start "Sign in with GitHub".
import { cookie } from '../_lib/session.js';

export function GET(request) {
	const clientId = process.env.GITHUB_CLIENT_ID;
	if (!clientId) return new Response('GITHUB_CLIENT_ID is not set on Vercel.', { status: 500 });
	const url = new URL(request.url);
	const state = crypto.randomUUID();
	const back = url.searchParams.get('back') || '/';
	const auth = new URL('https://github.com/login/oauth/authorize');
	auth.searchParams.set('client_id', clientId);
	auth.searchParams.set('redirect_uri', `${url.origin}/api/auth/callback`);
	// public_repo: enough to save notes to a public repository.
	auth.searchParams.set('scope', 'public_repo');
	auth.searchParams.set('state', state);
	auth.searchParams.set('allow_signup', 'false');
	const headers = new Headers({ location: auth.toString() });
	headers.append('set-cookie', cookie('cd_state', state, 600));
	headers.append('set-cookie', cookie('cd_back', back.startsWith('/') ? back : '/', 600));
	return new Response(null, { status: 302, headers });
}
