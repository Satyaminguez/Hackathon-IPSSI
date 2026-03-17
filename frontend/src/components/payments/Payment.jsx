import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import token from "../../utils";

const stripePromise = loadStripe("pk_test_51QNtdqCviAvTlbRE1UA8MznLXl1SSztx5BRjJLRswPWapzU8mtSlDukr2SgNW4RCZ3Z7ZVorgIHC9aPiAmMzNhML00EpP1Olib");

export default function Payment() {
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const response = await fetch("http://localhost:8088/api/storage/create-checkout-session", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error.message);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-slate-800 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Paiement avec Stripe
          </h1>
          <button
            onClick={handleCheckout}
            className="w-full mt-4 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            Procéder au paiement
          </button>
        </div>
      </div>
    </Elements>
  );
}

