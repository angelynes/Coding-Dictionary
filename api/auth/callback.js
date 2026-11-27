// GitHub sends you back here after you approve. Only the owner gets a session.
import { OWNER, cookie, readCookie, sealSession } from '../_lib/session.js';

const page = (title, text, status) =>
	new Response(
		`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title>
<body style="font-family: Georgia, serif; background: #f6f4ef; color: #24211d; display: grid; place-items: center; min-height: 90vh; margin: 0; padding: 16px">
<div style="max-width: 28rem"><h1 style="font-weight: 500">${title}</h1><p>${text}</p><p><a href="/" style="color: #9a3c22">Back to the dictionary</a></p></div>`,
		{ status, headers: { 'content-type': 'text/html; charset=utf-8' } },
	);

export async function GET(request) {
	const url = new URL(request.url);
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	if (!code || !state || state !== readCookie(request, 'cd_state')) {
		return page('Sign-in expired', 'Please try signing in again.', 400);
	}

	const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: { accept: 'application/json', 'content-type': 'application/json' },
		body: JSON.stringify({
			client_id: process.env.GITHUB_CLIENT_ID,
			client_secret: process.env.GITHUB_CLIENT_SECRET,
			code,
			redirect_uri: `${url.origin}/api/auth/callback`,
		}),
	});
	const { access_token: token } = await tokenRes.json();
	if (!token) return page('Sign-in failed', 'GitHub did not return a sign-in. Please try again.', 400);

	const user = await fetch('https://api.github.com/user', {
		headers: { authorization: `Bearer ${token}`, 'user-agent': 'coding-dictionary', accept: 'application/vnd.github+json' },
	}).then((r) => r.json());
	if (user.login !== OWNER) {
		return page('Not allowed', `Only ${OWNER} can edit this dictionary.`, 403);
	}

	const back = readCookie(request, 'cd_back') || '/';
	const headers = new Headers({ location: back.startsWith('/') ? back : '/' });
	headers.append('set-cookie', await sealSession({ login: user.login, token }));
	headers.append('set-cookie', cookie('cd_state', '', 0));
	headers.append('set-cookie', cookie('cd_back', '', 0));
	return new Response(null, { status: 302, headers });
}
