// Sign-in session: the GitHub token is kept in an encrypted, http-only cookie.
// The encryption key is derived from GITHUB_CLIENT_SECRET, so no extra secret is needed.

const COOKIE = 'cd_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const OWNER = process.env.OWNER || 'angelynes';
export const REPO = process.env.REPO || 'angelynes/Coding-Dictionary';
export const BRANCH = process.env.BRANCH || 'main';

const enc = new TextEncoder();
const b64url = (buf) => Buffer.from(buf).toString('base64url');
const unb64url = (s) => new Uint8Array(Buffer.from(s, 'base64url'));

async function key() {
	const secret = process.env.GITHUB_CLIENT_SECRET;
	if (!secret) throw new Error('GITHUB_CLIENT_SECRET is not set on Vercel.');
	const base = await crypto.subtle.importKey('raw', enc.encode(secret), 'HKDF', false, ['deriveKey']);
	return crypto.subtle.deriveKey(
		{ name: 'HKDF', hash: 'SHA-256', salt: enc.encode('coding-dictionary'), info: enc.encode('session') },
		base,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt'],
	);
}

export function readCookie(request, name) {
	const header = request.headers.get('cookie') || '';
	for (const part of header.split(/;\s*/)) {
		const i = part.indexOf('=');
		if (i > 0 && part.slice(0, i) === name) return decodeURIComponent(part.slice(i + 1));
	}
	return undefined;
}

export function cookie(name, value, maxAge) {
	return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export async function sealSession(data) {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const body = enc.encode(JSON.stringify({ ...data, exp: Date.now() + MAX_AGE * 1000 }));
	const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(), body));
	return cookie(COOKIE, `${b64url(iv)}.${b64url(sealed)}`, MAX_AGE);
}

export const clearSession = () => cookie(COOKIE, '', 0);

/** The signed-in session ({ login, token }) or null. */
export async function getSession(request) {
	const raw = readCookie(request, COOKIE);
	if (!raw) return null;
	try {
		const [iv, data] = raw.split('.');
		const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64url(iv) }, await key(), unb64url(data));
		const session = JSON.parse(new TextDecoder().decode(plain));
		if (!session.exp || session.exp < Date.now() || session.login !== OWNER) return null;
		return session;
	} catch {
		return null;
	}
}

export const json = (data, status = 200, headers = {}) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
	});
