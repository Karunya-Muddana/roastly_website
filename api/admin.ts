import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Secure Owner PIN Hashing
// In production, you would store this hash in an env var. 
// For demo deployment, we are hardcoding the hash for PIN "7788".
// Created via: bcrypt.hashSync('7788', 10)
const OWNER_PIN_HASH = '$2b$10$eeAub1p/1mw2/gMOTYlgLOn82vMra.sDEQuB2eqbPZ4zKBpysgI3O';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { action, pin, short_id } = req.body;

        if (!pin) {
            return res.status(401).json({ error: 'Unauthorized: PIN required' });
        }

        // Verify PIN securely against the hash
        // The user specifically requested real hashing for security
        const isAuthorized = await bcrypt.compare(pin, OWNER_PIN_HASH);
        if (!isAuthorized) {
            return res.status(401).json({ error: 'Unauthorized: Invalid PIN' });
        }

        // Action: Fetch Order
        if (action === 'fetch_order') {
            if (!short_id) return res.status(400).json({ error: 'short_id is required' });

            // Format ID properly
            const cleanId = short_id.replace('ROASTLY-', '').trim().toUpperCase();

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('short_id', cleanId)
                .single();

            if (error || !data) {
                return res.status(404).json({ error: 'Order not found' });
            }

            return res.status(200).json({ success: true, order: data });
        }

        // Action: Mark Paid & Finished
        if (action === 'mark_paid') {
            if (!short_id) return res.status(400).json({ error: 'short_id is required' });

            const cleanId = short_id.replace('ROASTLY-', '').trim().toUpperCase();

            const { error } = await supabase
                .from('orders')
                .update({ status: 'paid' })
                .eq('short_id', cleanId);

            if (error) {
                console.error('Update error:', error);
                return res.status(500).json({ error: 'Failed to update order status' });
            }

            return res.status(200).json({ success: true, message: 'Order marked as paid and finished.' });
        }

        return res.status(400).json({ error: 'Invalid action provided' });

    } catch (error) {
        console.error('Admin API error:', error);
        return res.status(500).json({ error: 'Internal server error processing your request.' });
    }
}
