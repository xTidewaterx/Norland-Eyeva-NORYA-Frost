'use client';

import { useCart } from "react-use-cart";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "../../auth/authContext";
import { buyerEmailStore } from "../../utils/buyerEmailStore";
import { checkoutSessionStore } from "../../utils/checkoutSessionStore";

function normalizePickupPoint(pickupPointFromUi) {
  if (!pickupPointFromUi) return null;

  const id = pickupPointFromUi.id;
  if (id == null) return null;

  const idStr = String(id).trim();
  if (!/^\d+$/.test(idStr)) {
    console.warn("[checkout] pickupPoint.id is not numeric, ignoring pickupPoint:", idStr);
    return null;
  }

  return {
    id: idStr,
    name: pickupPointFromUi.name || "",
    address: {
      street: pickupPointFromUi.address?.street || pickupPointFromUi.street || "",
      postalCode: pickupPointFromUi.address?.postalCode || pickupPointFromUi.postalCode || "",
      city: pickupPointFromUi.address?.city || pickupPointFromUi.city || "",
      countryCode: pickupPointFromUi.address?.countryCode || pickupPointFromUi.countryCode || "NO",
    },
    type: pickupPointFromUi.type || pickupPointFromUi.pickupPointType || null,
  };
}

function buildShippingPayload({ shippingOption, addressForm, pickupPointFromUi, customerData }) {
  const pickupPoint = normalizePickupPoint(pickupPointFromUi);

  const shipping = {
    id: shippingOption?.id || "standard",
    name: shippingOption?.name || "Standard frakt (2-4 dager)",
    cost: shippingOption?.cost || 0,
    pickupPointType:
      pickupPointFromUi?.type ||
      pickupPointFromUi?.pickupPointType ||
      (pickupPoint ? pickupPoint.type || "MANNED" : null),
    ...(pickupPoint ? { pickupPoint } : {}),
    address: addressForm?.address || null,
    postalCode: addressForm?.postalCode || null,
    city: addressForm?.city || null,
    country: addressForm?.country || "NO",
    customerData: customerData
      ? {
          name: customerData.name || "",
          email: customerData.email || "",
          phone: customerData.phone || "",
          street: customerData.street || addressForm?.address || "",
          streetNumber: customerData.streetNumber || "",
          city: customerData.city || addressForm?.city || "",
          postcode: customerData.postcode || addressForm?.postalCode || "",
          country: customerData.country || addressForm?.country || "NO",
        }
      : null,
  };

  return shipping;
}

function buildItemsPayload(cartItems) {
  return cartItems.map((it) => {
    const base = {
      id: it.id,
      name: it.name,
      quantity: Math.max(1, Number(it.quantity) || 1),
    };
    if (it.sellerAccountId != null) {
      base.sellerAccountId = it.sellerAccountId;
    }
    return base;
  });
}

export default function CartPage() {
  const { items: cartItems, removeItem, updateItemQuantity, emptyCart, isInitialized, setItems } = useCart();
  const { user } = useAuth();

  const [currentItems, setCurrentItems] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const syncedRef = useRef(false);
  const [shippingOption, setShippingOption] = useState({
    id: 'standard',
    name: 'Standard frakt (2-4 dager)',
    cost: 9900,
  });
  const [processingPickupPoint, setProcessingPickupPoint] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState(() => buyerEmailStore.get() || "");
  const [selectedPickupPoint, setSelectedPickupPoint] = useState(null);
  const [addressForm, setAddressForm] = useState({ address: "", postalCode: "", city: "", country: "NO" });
  const [customerData, setCustomerData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user?.email) {
      buyerEmailStore.set(user.email);
      if (!buyerEmail) {
        setBuyerEmail(user.email);
      }
    }
  }, [user, buyerEmail]);

  const getBuyerEmail = useCallback(() => {
    return user?.email || buyerEmailStore.get() || "";
  }, [user]);

  useEffect(() => {
    if (!isClient || syncedRef.current) return;

    try {
      const raw = localStorage.getItem("react-use-cart");
      const lsItems = JSON.parse(raw)?.items || [];

      if (lsItems.length > 0) {
        setItems(lsItems);
        setCurrentItems(lsItems);
        console.log("✅ Cart synced from localStorage:", lsItems);
      }
      syncedRef.current = true;
    } catch (err) {
      console.error("❌ Failed to sync cart from localStorage:", err);
      syncedRef.current = true;
    } finally {
      setHydrated(true);
    }
  }, [isClient, setItems]);

  useEffect(() => {
    setCurrentItems(cartItems || []);
  }, [cartItems]);

  useEffect(() => {
    try {
      const savedPickupPoint = localStorage.getItem("norya_selected_pickup_point");
      const savedShipping = localStorage.getItem("norya_shipping");
      if (savedPickupPoint && (cartItems || []).length > 0) {
        setProcessingPickupPoint(true);
        setCheckoutStep(2);
        const pp = JSON.parse(savedPickupPoint);
        const shippingData = savedShipping ? JSON.parse(savedShipping) : {};

        const pickupPointObj = {
          id: pp.id,
          name: pp.name,
          address: pp.address || pp.street || null,
          postalCode: pp.postalCode || pp.postal_code || pp.postal || null,
          city: pp.city || null,
          countryCode: pp.countryCode || pp.country || "NO",
          type: pp.type || pp.pickupPointType || null,
        };

        setSelectedPickupPoint(pickupPointObj);

        const shipping = {
          id: pp.id || "bring-pickup",
          name: pp.name || "Bring Pakke i Posten",
          cost: 9900,
          address: pickupPointObj.address,
          city: pickupPointObj.city,
          postalCode: pickupPointObj.postalCode,
          pickupPointType: pickupPointObj.type,
          customerData: shippingData.customerData || shippingData,
        };
        setShippingOption(shipping);
        localStorage.removeItem("norya_selected_pickup_point");
        handleProceedToPayment(shipping, pickupPointObj);
      }
    } catch (e) {
      console.warn("[cart] failed to restore saved pickup point:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems.length]);

  const subtotal = (cartItems || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

  const handleProceedToPayment = useCallback(async (shippingOverride = null, pickupPointOverride = null) => {
    setLoadingSecret(true);
    setIsProcessing(true);

    try {
      const lineItems = (cartItems || []).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        sellerAccountId: item.sellerAccountId,
        image: item.images?.[0] || null,
      }));

      const activeShippingOption = shippingOverride || shippingOption;
      const effectiveEmail = getBuyerEmail();
      const sellerEmail = user?.stripeConnectEmail || user?.email || process.env.NEXT_PUBLIC_SELLER_EMAIL || "";

      console.log("[checkout] creating embedded Checkout session", {
        itemCount: lineItems.length,
        shippingMethod: activeShippingOption.id,
      });

      const shippingPayload = buildShippingPayload({
        shippingOption: activeShippingOption,
        addressForm,
        pickupPointFromUi: pickupPointOverride || selectedPickupPoint,
        customerData,
      });

      const itemsPayload = buildItemsPayload(lineItems);

      const res = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsPayload, shipping: shippingPayload, email: effectiveEmail, sellerEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ API returned error status:", res.status);
        console.error("❌ API error:", data.error || data);
        alert(`Feil: ${data.error || "Ukjent feil ved betaling"}`);
        setLoadingSecret(false);
        setIsProcessing(false);
        return;
      }

      if (data.clientSecret && data.summary) {
        checkoutSessionStore.set({
          clientSecret: data.clientSecret,
          orderId: data.orderId,
          summary: data.summary,
        });
        window.location.assign("/checkout");
      } else {
        console.error("Embedded Checkout session response is incomplete:", {
          orderId: data.orderId,
        });
        alert("Feil ved initialisering av betaling. Prøv igjen.");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      alert("Feil ved initialisering av betaling. Prøv igjen.");
    } finally {
      setLoadingSecret(false);
      setIsProcessing(false);
    }
  }, [cartItems, shippingOption, selectedPickupPoint, addressForm, customerData, user, getBuyerEmail]);

  const handleProceedToShipping = () => {
    if ((cartItems || []).length === 0) {
      alert("Handlekurven er tom");
      return;
    }
    console.log("🛒 [cart] proceeding to shipping | buyerEmail:", buyerEmail);
    window.location.href = "/hentested";
  };

  const cardTransition = { duration: 0.4, ease: "easeInOut" };
  const containerStyle = {
    perspective: 2000,
    transformStyle: "preserve-3d",
    width: "100%",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-glacial-white via-arctic-mist to-glacial-white flex justify-center items-center px-6 py-10">
      <div style={containerStyle} className="flex justify-center w-full">
        {!hydrated ? (
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center justify-center border border-border-cool">
            <p className="text-charcoal-text text-lg font-manrope font-bold">Laster handlekurv...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
          {checkoutStep === 1 && (
            <motion.div
              key="cart"
              initial={{ rotateY: 0, scale: 1, rotateX: 0 }}
              animate={{ rotateY: 0, scale: 1, rotateX: 0 }}
              exit={{ rotateY: 180, rotateX: 5, scale: 0.97, opacity: 0.95 }}
              transition={cardTransition}
              className="grid lg:grid-cols-2 w-full max-w-5xl overflow-hidden"
              style={{ backfaceVisibility: "hidden", transformOrigin: "center" }}
            >
              <div className="bg-white p-8 md:p-10">
                <h1 className="text-3xl font-manrope font-bold text-ice-deep mb-8 text-center tracking-wide">
                  Handlekurv
                </h1>

                {currentItems.length === 0 ? (
                  <p className="text-center text-charcoal-text font-manrope font-bold">Handlekurven er tom.</p>
                ) : (
                  <div key={`items-${currentItems.length}-${currentItems.map(i => i.id).join('-')}`} className="space-y-8">
                    {currentItems.map((item) => (
                      <div key={item.id} className="flex flex-col gap-4 border-b border-border-cool pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="relative h-24 w-24 flex-shrink-0 sm:h-28 sm:w-28">
                            <Image
                              src={item.images?.[0] || "/placeholder.png"}
                              alt={item.name}
                              fill
                              className="object-cover rounded-xl border border-border-cool shadow-sm"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-manrope font-bold text-ice-deep text-lg">{item.name}</p>
                            {item.artist && (
                              <p className="text-charcoal-text text-sm font-manrope italic">av {item.artist}</p>
                            )}
                            <p className="text-charcoal-text text-sm font-manrope mt-1">
                              {((item.price || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} NOK per stk
                            </p>
                            <p className="text-ice-deep text-sm font-manrope font-bold mt-1">
                              Sum: {(((item.price || 0) * (item.quantity || 0)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} NOK
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:justify-end">
                          <span className="text-sm font-manrope text-charcoal-text">Antall</span>
                          <button
                            onClick={() => updateItemQuantity(item.id, Math.max(0, (item.quantity || 1) - 1))}
                            aria-label={`Reduser antall ${item.name}`}
                            className="px-3 py-1 bg-arctic-mist text-ice-deep rounded-md hover:bg-norwegian-ice transition"
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center font-semibold text-ice-deep">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.id, (item.quantity || 1) + 1)}
                            aria-label={`Øk antall ${item.name}`}
                            className="px-3 py-1 bg-arctic-mist text-ice-deep rounded-md hover:bg-norwegian-ice transition"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="px-4 py-1 text-sm bg-norwegian-gold text-ice-deep font-manrope font-bold rounded-md hover:bg-yellow-300 transition"
                          >
                            Fjern
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-ice-deep text-glacial-white p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-manrope font-bold text-glacial-white mb-6">Oppsummering</h2>

                  <div className="mb-6">
                    <p className="text-arctic-mist mb-2 font-manrope font-bold">Frakt:</p>
                    <p className="text-glacial-white text-sm font-manrope">{shippingOption.name}</p>
                    <p className="text-norwegian-gold font-bold mt-1 font-manrope">{((shippingOption.cost || 0)/100).toFixed(2)} NOK</p>
                  </div>

                  <div className="flex justify-between text-lg font-manrope font-bold border-t border-border-cool pt-4">
                    <span>Subtotal:</span>
                    <span className="text-norwegian-gold font-manrope">
                      {(subtotal / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} NOK
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-manrope font-bold mt-2">
                    <span>Frakt:</span>
                    <span className="text-norwegian-gold font-manrope">
                      {(shippingOption.cost / 100).toFixed(2)} NOK
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-manrope font-bold mt-2 border-t border-border-cool pt-2">
                    <span>Total:</span>
                    <span className="text-norwegian-gold font-manrope">
                      {((subtotal + shippingOption.cost) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} NOK
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border-cool">
                    <label htmlFor="buyerEmail" className="block text-sm font-manrope font-bold text-charcoal-text mb-2">E-post for ordrebekreftelse</label>
                    <input
                      id="buyerEmail"
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => { setBuyerEmail(e.target.value); buyerEmailStore.set(e.target.value); }}
                      placeholder="din@epost.no"
                      required
                      className="w-full rounded-xl border border-black/10 bg-zinc-100 px-4 py-3 text-black dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  {selectedPickupPoint && (
                    <div className="rounded-xl border border-border-cool bg-white/90 p-4 text-sm text-charcoal-text">
                      <p className="font-manrope font-bold mb-1">Valgt hentested:</p>
                      <p>{selectedPickupPoint.name}</p>
                      {selectedPickupPoint.address?.street && (
                        <p>{selectedPickupPoint.address.street}</p>
                      )}
                      {(selectedPickupPoint.address?.postalCode || selectedPickupPoint.postalCode) && (
                        <p>{selectedPickupPoint.address?.postalCode || selectedPickupPoint.postalCode} {selectedPickupPoint.address?.city || selectedPickupPoint.city}</p>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (selectedPickupPoint) {
                        handleProceedToPayment(null, selectedPickupPoint);
                      } else {
                        handleProceedToShipping();
                      }
                    }}
                    disabled={(cartItems || []).length === 0 || isProcessing}
                    className="w-full bg-norwegian-gold text-ice-deep font-manrope font-bold py-3 rounded-lg hover:bg-yellow-300 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? "Behandler..." : selectedPickupPoint ? "Gå til betaling →" : "Velg hentested →"}
                  </button>
                  <button
                    onClick={() => { emptyCart(); setCurrentItems([]); }}
                    className="w-full bg-white/10 text-glacial-white py-3 rounded-lg hover:bg-white/20 transition font-manrope font-bold"
                  >
                    Tøm handlekurv
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {checkoutStep === 2 && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ rotateY: 90, rotateX: 5, scale: 0.97, opacity: 0.95 }}
              transition={cardTransition}
              className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-border-cool"
            >
              <h2 className="text-2xl font-manrope font-bold text-ice-deep mb-6 text-center">
                Behandler frakt og betaling…
              </h2>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-manrope font-bold text-charcoal-text mb-3">Produkter</p>
                  <div className="space-y-3">
                    {(currentItems || []).map((item) => (
                      <div key={item.id} className="flex items-center gap-4 rounded-xl border border-border-cool p-3">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={item.images?.[0] || "/placeholder.png"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-manrope font-bold text-ice-deep truncate">{item.name}</p>
                          <p className="text-sm text-ice-medium font-manrope">
                            {item.quantity} stk · {((item.price || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} NOK hver
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-manrope font-bold text-ice-deep">
                            {(((item.price || 0) * (item.quantity || 0)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} NOK
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border-cool p-4">
                    <p className="text-sm font-manrope font-bold text-charcoal-text mb-2">Frakt</p>
                    <p className="text-sm text-ice-medium font-manrope">{shippingOption.name}</p>
                    <p className="text-sm font-manrope font-bold text-ice-deep">
                      {(shippingOption.cost / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} NOK
                    </p>
                  </div>

                  <div className="rounded-xl border border-border-cool p-4">
                    <p className="text-sm font-manrope font-bold text-charcoal-text mb-2">Totalt</p>
                    <p className="text-2xl font-manrope font-bold text-norwegian-gold">
                      {(((subtotal || 0) + shippingOption.cost) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} NOK
                    </p>
                  </div>
                </div>

                {selectedPickupPoint && (
                  <div className="rounded-xl border border-border-cool p-4">
                    <p className="text-sm font-manrope font-bold text-charcoal-text mb-1">Hentested</p>
                    <p className="text-sm text-ice-medium font-manrope">{selectedPickupPoint.name}</p>
                    {selectedPickupPoint.address?.street && (
                      <p className="text-sm text-ice-medium font-manrope">
                        {selectedPickupPoint.address.street}, {selectedPickupPoint.address.postalCode} {selectedPickupPoint.address.city}
                      </p>
                    )}
                  </div>
                )}

                <div className="rounded-xl border border-border-cool p-4">
                  <p className="text-sm font-manrope font-bold text-charcoal-text mb-1">E-post for ordrebekreftelse</p>
                  <p className="text-sm text-ice-medium font-manrope">{buyerEmail || "—"}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-ice-medium font-manrope">
                    Du blir straks sendt til betaling. Du kan betale med kort eller en digital lommebok hvis den støttes på enheten din.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>
    </div>
  );
}
