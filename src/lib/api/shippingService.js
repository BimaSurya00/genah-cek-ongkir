/**
 * @typedef {Object} AddressData
 * @property {number} id 
 * @property {string} sub_district_name 
 * @property {number} district_id 
 * @property {string} district_name 
 * @property {number} region_id 
 * @property {string} region_name 
 * @property {number} province_id 
 * @property {string} province_name 
 * @property {string} district_postal_code
 * @property {string} sub_district_postal_code
 */

/**
 * @typedef {Object} PricingData
 * @property {string} service 
 * @property {string} service_name 
 * @property {string} service_type 
 * @property {string} cost 
 * @property {string} etd 
 * @property {boolean} cod 
 * @property {string} group 
 * @property {boolean} drop
 */

/**
 * Shipping Service for KiriminAja API
 * Uses local API proxy to avoid CORS issues
 */
const shippingService = {
    /**
     * Search address/location by keyword
     * @param {string} query 
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
