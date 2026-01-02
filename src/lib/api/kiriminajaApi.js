import axios from 'axios';

/**
 * Base configuration for KiriminAja API
 * This is used by server-side API routes
 */
const BASE_URL = 'https://kiriminaja.com/intl-api';

const kiriminajaApi = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Search address by keyword
 * @param {string} query 
 * @returns {Promise<Object>}
 */
export async function searchAddress(query) {
    if (!query || query.trim().length < 2) {
        return { name: 'SUCCESS', message: 'Query too short', data: [] };
    }

    const response = await kiriminajaApi.get('/address', {
        params: { q: query.trim() },
    });

    return response.data;
}

/**
 * Get shipping pricing
 * @param {Object} params 
 * @param {string} params.from 
 * @param {string} params.thru 
 * @param {string} params.weight 
 * @returns {Promise<Object>}
 */
export async function getPricing(params) {
    const { from, thru, weight, width = '', height = '', length = '' } = params;
    console.log(BASE_URL);

    if (!from || !thru || !weight) {
        throw new Error('Parameter from, thru, dan weight wajib diisi');
    }

    const response = await kiriminajaApi.post('/pricing', {
        from: String(from),
        thru: String(thru),
        weight: String(weight),
        width: String(width),
        height: String(height),
        length: String(length),
        captcha: 'captcha-disabled',
    });

    return response.data;
}

export default {
    searchAddress,
    getPricing,
};
//