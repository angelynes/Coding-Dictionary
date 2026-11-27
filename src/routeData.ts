import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { findVolume } from './volumes';

/**
 * Inside a dictionary, the sidebar only shows that dictionary's topics,
 * and previous / next links never jump into another dictionary.
 */
export const onRequest = defineRouteMiddleware((context) => {
	const route = context.locals.starlightRoute;
	const volume = findVolume(route.id.split('/')[0]);
	if (!volume) return;

	const group = route.sidebar.find(
		(entry) => entry.type === 'group' && entry.label === volume.name,
	);
	if (group && group.type === 'group') {
		route.sidebar = group.entries;
	}

	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	const inVolume = (href?: string) => !!href && href.startsWith(`${base}/${volume.id}/`);
	if (!inVolume(route.pagination.prev?.href)) route.pagination.prev = undefined;
	if (!inVolume(route.pagination.next?.href)) route.pagination.next = undefined;
});
