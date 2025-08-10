'use client';

import { useCart } from "react-use-cart";
import { useState, useEffect } from "react";

const CartPage = () => {
  const { items, removeItem, updateItemQuantity, emptyCart } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const url = "/api/checkout_sessions";

  const postData = {
    title: "items from cart",
    items: items,
  };

  console.log(postData?.items[0]?.default_price_id);

  const priceId = postData.items[0]?.default_price_id;

  const filteredMappedItems = items.reduce((filteredItems, { default_price_id, quantity }) => {
    filteredItems.push({ default_price_id, quantity });
    return filteredItems;
  }, []);

  const createCheckoutSession = async () => {
    const getPriceInfo = async () => {
      const res = await fetch('/api/get_price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();
      console.log('Price info:', data);
      return data;
    };

    console.log("items in cart page.js client:", items);

    const priceData = await getPriceInfo();
    console.log("priceInfo:", priceData);

    const response = await fetch("https://localhost:3000/api/checkout_sessions", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filteredMappedItems),
    });

    const data = await response.json();
    if (data.url) {
      console.log("data url from backend response:", data.url);
      window.location.href = data.url;
    }
  };

  const mappedItems = () => items.map(item => ({ price: item.price, quantity: item.quantity }));

  console.log("in our cart page.js this is our cart items:", items, "mappedItems:", filteredMappedItems);

  const totalSum = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-4">Your Cart</h1>

        {items.length === 0 ? (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        ) : (
          <div>
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b py-4">
                <p className="text-gray-800">{item.name} - ${item.price}</p>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="text-gray-800 font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="px-4 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Total: <span className="text-gray-600">${totalSum.toFixed(2)}</span>
              </h2>
              <button
                onClick={emptyCart}
                className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
              >
                Empty Cart
              </button>
            </div>

            <button onClick={() => createCheckoutSession()} className="btn btn-blue">
              Gå til kassen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;