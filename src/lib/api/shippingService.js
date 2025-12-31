/**
 * @typedef {Object} AddressData
 * @property {number} id - Kelurahan ID (use this for pricing API)
 * @property {string} sub_district_name - Kelurahan name
 * @property {number} district_id - Kecamatan ID
 * @property {string} district_name - Kecamatan name
 * @property {number} region_id - Kabupaten/Kota ID
 * @property {string} region_name - Kabupaten/Kota name
 * @property {number} province_id - Province ID
 * @property {string} province_name - Province name
 * @property {string} district_postal_code
 * @property {string} sub_district_postal_code
 */

/**
 * @typedef {Object} PricingData
 * @property {string} service - Courier service code
 * @property {string} service_name - Full service name
 * @property {string} service_type - Service type code
 * @property {string} cost - Shipping cost in rupiah
 * @property {string} etd - Estimated time of delivery
 * @property {boolean} cod - COD availability
 * @property {string} group - Service group (regular/express)
 * @property {boolean} drop - Drop off availability
 */

/**
 * Shipping Service for KiriminAja API
 * Uses local API proxy to avoid CORS issues
 */
const shippingService = {
    /**
     * Search address/location by keyword
     * @param {string} query - Search keyword (city, district, or village name)
     * @returns {Promise<{name: string, message: string, data: AddressData[]}>}
     */
    async searchAddress(query) {
        if (!query || query.trim().length < 2) {
            return { name: 'SUCCESS', message: 'Query too short', data: [] };
        }

        try {
            const url = `/api/address?q=${encodeURIComponent(query.trim())}`;
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get shipping rates/pricing
     * @param {{from: string|number, thru: string|number, weight: string|number}} params
     * @returns {Promise<{name: string, message: string, data: PricingData[], meta: object}>}
     */
    async getPricing(params) {
        const { from, thru, weight, width = '', height = '', length = '' } = params;

        if (!from || !thru || !weight) {
            throw new Error('Parameter from, thru, dan weight wajib diisi');
        }

        try {
            const response = await fetch('/api/pricing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: String(from),
                    thru: String(thru),
                    weight: String(weight),
                    width: String(width),
                    height: String(height),
                    length: String(length),
                }),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Format price to Indonesian Rupiah
     * @param {string|number} price - Price to format
     * @returns {string}
     */
    formatPrice(price) {
        const numPrice = typeof price === 'string' ? parseInt(price, 10) : price;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(numPrice);
    },

    /**
     * Format address data to display string
     * @param {AddressData} address - Address data object
     * @returns {string}
     */
    formatAddress(address) {
        return `${address.sub_district_name}, ${address.district_name}, ${address.region_name}, ${address.province_name}`;
    },
};

export default shippingService;
