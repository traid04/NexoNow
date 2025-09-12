import { EXCHANGE_RATE_API_KEY } from "../utils/config";

export const USDToUYU = async (price: number): Promise<number | undefined> => {
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/pair/USD/UYU`);
        const data = await response.json();
        if (data.result !== 'success') {
            throw new Error('Exchange rate API failed');
        }
        return price * data.conversion_rate;
    }
    catch(error) {
        if (error instanceof Error) {
            throw new Error('Error fetching exchange rate: ', error);
        }
    }
}