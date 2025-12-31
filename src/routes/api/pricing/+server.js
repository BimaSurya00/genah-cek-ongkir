import { getPricing } from '$lib/api/kiriminajaApi.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    try {
        const body = await request.json();
        const data = await getPricing(body);

        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error getting pricing:', error.message);

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
