type Banner = {
    url: string;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
let cachedBanner: Banner | null = null;
let cacheTimestamp: number = 0;

export async function fetchBanner(): Promise<Banner> {
    const now = Date.now();

    // Return cached banner if still valid
    if (cachedBanner && now - cacheTimestamp < CACHE_DURATION) {
        return cachedBanner;
    }

    // Fetch new banner
    const response = await fetch('https://picsum.photos/400/200', {
        cache: 'no-store'
    });

    const banner: Banner = {
        url: response.url
    };

    // Update cache
    cachedBanner = banner;
    cacheTimestamp = now;

    return banner;
}