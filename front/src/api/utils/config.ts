import dotenv from 'dotenv';
dotenv.config();

const { WEBSOCKET_URL } = process.env;

if (!WEBSOCKET_URL) {
    throw new Error("Missing environment variable: WEBSOCKET_URL");
}

export const config = {
    websocketUrl: WEBSOCKET_URL
};
