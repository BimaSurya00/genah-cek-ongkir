import { searchAddress } from '$lib/api/kiriminajaApi.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    const query = url.searchParams.get('q');

    try {
        const data = await searchAddress(query);

        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error searching address:', error.message);

        return new Response(JSON.stringify({
            name: 'ERROR',
            message: error.message,
            data: []
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
