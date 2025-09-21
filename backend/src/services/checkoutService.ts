import { MercadoPagoConfig, Preference } from "mercadopago";
import { TEST_MP_ACCESS_TOKEN } from "../utils/config";
if (!TEST_MP_ACCESS_TOKEN) {
    throw new Error("Invalid data: Access Token undefined");
}

const client = new MercadoPagoConfig({ accessToken: TEST_MP_ACCESS_TOKEN });

export const checkoutProduct = () => {

}