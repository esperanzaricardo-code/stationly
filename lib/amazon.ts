// Tag de afiliado genérico (fallback si no hay uno específico por país).
const DEFAULT_AFFILIATE_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID || 'stationly-21'

// Tags de afiliado por país. Cada programa de Amazon Associates es independiente,
// así que cada región puede tener su propio tag. Si una variable no está
// configurada en Vercel, esa región cae al tag genérico (el link funciona,
// pero sin comisión hasta que se configure el programa de ese país).
const AFFILIATE_TAGS: Record<string, string> = {
    ES: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID_ES || DEFAULT_AFFILIATE_TAG,
    US: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID_US || DEFAULT_AFFILIATE_TAG,
    MX: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID_MX || DEFAULT_AFFILIATE_TAG,
    GB: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID_UK || DEFAULT_AFFILIATE_TAG,
    UK: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID_UK || DEFAULT_AFFILIATE_TAG,
    FR: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID_FR || DEFAULT_AFFILIATE_TAG,
    IT: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID_IT || DEFAULT_AFFILIATE_TAG,
    DE: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID_DE || DEFAULT_AFFILIATE_TAG,
}

// Dominio de Amazon por país. Todo lo que no esté en la lista cae a amazon.com (US).
const AMAZON_DOMAINS: Record<string, string> = {
    ES: 'amazon.es',
    US: 'amazon.com',
    MX: 'amazon.com.mx',
    GB: 'amazon.co.uk',
    UK: 'amazon.co.uk',
    FR: 'amazon.fr',
    IT: 'amazon.it',
    DE: 'amazon.de',
}

export function getAmazonDomain(country?: string | null): string {
    const key = (country || 'US').toUpperCase()
    return AMAZON_DOMAINS[key] || 'amazon.com'
}

function getAffiliateTag(country?: string | null): string {
    const key = (country || 'US').toUpperCase()
    return AFFILIATE_TAGS[key] || DEFAULT_AFFILIATE_TAG
}

// PcComponentes solo opera en España, así que solo tiene sentido mostrarlo
// cuando el usuario está en ES (o no se sabe el país todavía).
export function showsPcComponentes(country?: string | null): boolean {
    return !country || country.toUpperCase() === 'ES'
}

export function makeAmazonLink(name: string, country?: string | null, customAffiliateId?: string): string {
    const domain = getAmazonDomain(country)
    const query = name.trim().replace(/\s+/g, '+')
    const tag = customAffiliateId || getAffiliateTag(country)
    return `https://www.${domain}/s?k=${query}&tag=${tag}`
}

export function makePcComponentesLink(name: string): string {
    const query = name.trim().replace(/\s+/g, '+')
    return `https://www.pccomponentes.com/buscar/?query=${query}`
}
