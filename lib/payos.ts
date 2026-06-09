import { PayOS } from '@payos/node';

// We initialize with environment variables. If they are missing, it will throw an error.
// The user needs to add these to .env.local
export const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || 'client-id',
  apiKey: process.env.PAYOS_API_KEY || 'api-key',
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || 'checksum-key'
});
