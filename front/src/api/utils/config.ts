/*import dotenv from 'dotenv';
dotenv.config();*/

//const { WEBSOCKET_URL } = process.env;
const WEBSOCKET_URL  = import.meta.env.VITE_WEBSOCKET_URL;

if (!WEBSOCKET_URL) {
    throw new Error("Missing environment variable: VITE_WEBSOCKET_URL");
}

export const config = {
    websocketUrl: WEBSOCKET_URL
};
