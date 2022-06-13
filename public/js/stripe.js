import axios from "axios";
import { showAlert } from "./alerts";

const stripe = Stripe('pk_test_51Krr9qDOR7h14HmY6npfip8aFLQfOnsqz7cnVHIIbrLOoTDhuBduE3kWMeqb9uRBm27CC1FkJSZMqHKDciJg7NMQ00XahR0vUk');

export const bookTour = async tourId => {
    // checkout session from api
    try {
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);

        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch (err) {
        showAlert('error', err);
    }
}