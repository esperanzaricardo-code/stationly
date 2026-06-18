// Tag de afiliado para Amazon Espana.
const ES_AFFILIATE_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID || 'stationly-21'

// Tag de afiliado para Amazon EEUU (programa distinto al de Espana).
// Mientras no lo configures, los links funcionan pero sin comision.
const US_AFFILIATE_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID_US || ''

export function getAmazonDomain(country?: string | null): string {
    return country === 'ES' ? 'amazon.es' : 'amazon.com'
}

export function makeAmazonLink(name: string, country?: string | null, customAffiliateId?: string): string {
    const domain = getAmazonDomain(country)
    const query = name.trim().replace(/\s+/g, '+')
    const fallbackTag = domain === 'amazon.es' ? ES_AFFILIATE_TAG : (US_AFFILIATE_TAG || ES_AFFILIATE_TAG)
    const tag = customAffiliateId || fallbackTag
    return `https://www.${domain}/s?k=${query}&tag=${tag}`
}
