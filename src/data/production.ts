import previews from './share-previews.json';
// Build-time only. Review output stays non-indexable unless explicitly enabled.
export const indexingEnabled = import.meta.env.SITE_INDEXABLE === 'true';
export const publicPages = previews;
