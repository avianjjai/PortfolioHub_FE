const env = {
    // API Configuration
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
    API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
    WS_BASE_URL: process.env.REACT_APP_WS_BASE_URL || 'ws://localhost:8000',
}

export const getApiBaseUrl = (): string => env.API_BASE_URL;
export const getWsBaseUrl = (): string => env.WS_BASE_URL;
export default env;