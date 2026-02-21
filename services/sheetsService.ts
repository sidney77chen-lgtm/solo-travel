import { Activity, Expense, Ticket } from '../types';

const GAS_URL = import.meta.env.VITE_GAS_URL;

export interface SheetData {
    plane: Activity[];
    spend: Expense[];
    wallet: Ticket[];
}

export const sheetsService = {
    async fetchAllData(): Promise<SheetData | null> {
        console.log('Fetching all data from Sheets with URL:', GAS_URL);
        if (!GAS_URL) {
            console.warn('VITE_GAS_URL is not defined!');
            return null;
        }
        try {
            const response = await fetch(GAS_URL);
            console.log('Sheets fetch response status:', response.status);
            if (!response.ok) throw new Error(`Fetch failed with status: ${response.status}`);
            const data = await response.json();
            console.log('✅ Fetch Success! Data received:', {
                planeCount: data.plane?.length || 0,
                spendCount: data.spend?.length || 0,
                walletCount: data.wallet?.length || 0
            });
            return data;
        } catch (error) {
            console.error('❌ Google Sheets Sync Error:', error);
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.error('Possible CORS issue or URL unreachable. Ensure the GAS is deployed as "Anyone" and the URL is correct.');
            }
            return null;
        }
    },

    async syncItem(type: 'plane' | 'spend' | 'wallet', action: 'set' | 'delete', data: any) {
        if (!GAS_URL) return;
        try {
            await fetch(GAS_URL, {
                method: 'POST',
                mode: 'no-cors', // GAS requires no-cors for simple Web App triggers or redirect handling
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action,
                    type,
                    data
                }),
            });
        } catch (error) {
            console.error(`Error syncing ${type}:`, error);
        }
    }
};
