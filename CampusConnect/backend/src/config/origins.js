const localOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];

function normalizeOrigin(origin) {
    if (!origin) return '';
    try {
        const url = new URL(origin);
        return `${url.protocol}//${url.host}`;
    } catch {
        return String(origin).trim().replace(/\/+$/, '');
    }
}

function originPattern(value) {
    const escaped = value
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\\\*/g, '[^.]+');
    return new RegExp(`^${escaped}$`, 'i');
}

export function getAllowedOriginEntries() {
    const configured = [
        process.env.FRONTEND_URL,
        process.env.FRONTEND_URLS,
        process.env.CORS_ORIGINS,
        process.env.NODE_ENV !== 'production' ? localOrigins.join(',') : '',
    ]
        .filter(Boolean)
        .flatMap(value => String(value).split(','))
        .map(value => value.trim())
        .filter(Boolean);

    return configured.map(value => value.includes('*')
        ? { type: 'pattern', value, pattern: originPattern(normalizeOrigin(value)) }
        : { type: 'exact', value: normalizeOrigin(value) });
}

export function isAllowedOrigin(origin) {
    if (!origin) return true;
    const normalized = normalizeOrigin(origin);
    return getAllowedOriginEntries().some(entry => entry.type === 'pattern'
        ? entry.pattern.test(normalized)
        : entry.value === normalized);
}

export function getAllowedOriginsForLog() {
    return getAllowedOriginEntries().map(entry => entry.value);
}
