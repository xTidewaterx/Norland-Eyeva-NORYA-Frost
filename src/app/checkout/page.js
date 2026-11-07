'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { checkoutSessionStore } from '../utils/checkoutSessionStore';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const isStripeTestMode = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_');

function formatPrice(amount, currency) {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export default function CheckoutPage() {
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [testDetailsStatus, setTestDetailsStatus] = useState('');

  const copyTestDetails = async () => {
    try {
      await navigator.clipboard.writeText(
        'Kortnummer: 4242 4242 4242 4242\nUtløpsdato: 12/34\nCVC: 123\nPostnummer: 12345'
      );
      setTestDetailsStatus('Testkortdetaljene er kopiert. Lim dem inn i Stripes sikre betalingsfelt.');
    } catch (error) {
      console.error('[checkout] could not copy Stripe test card details:', error);
      setTestDetailsStatus('Kopiering mislyktes. Bruk testverdiene som vises nedenfor.');
    }
  };

  useEffect(() => {
    try {
      const savedSession = checkoutSessionStore.get();
      if (
        savedSession?.clientSecret &&
        Array.isArray(savedSession.summary?.items) &&
        Number.isInteger(savedSession.summary?.totalAmount) &&
        typeof savedSession.summary?.currency === 'string'
      ) {
        setCheckoutSession(savedSession);
      }
    } catch (error) {
      console.error('[checkout] could not read saved Checkout session:', error);
      setLoadError('Betalingsøkten kunne ikke åpnes. Gå tilbake til handlekurven og prøv igjen.');
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f6] px-5">
        <p className="text-base font-medium text-[#1f2a2a]" role="status">Klargjør sikker betaling…</p>
      </main>
    );
  }

  if (!checkoutSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f6] px-5 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-[#e1e5e2] bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64716d]">NORYA · Sikker betaling</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#1f2a2a]">Betalingsøkten er ikke tilgjengelig</h1>
          <p className="mt-3 text-base leading-7 text-[#52605c]">
            {loadError || 'Start betalingen fra handlekurven for å fortsette.'}
          </p>
          <Link
            href="/products/cart"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#16354a] px-5 text-base font-semibold text-white transition-colors hover:bg-[#11293a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16354a]"
          >
            Tilbake til handlekurven
          </Link>
        </div>
      </main>
    );
  }

  const { summary } = checkoutSession;
  const currency = summary.currency;

  return (
    <main className="min-h-screen bg-[#f7f8f6] px-4 py-6 text-[#1f2a2a] sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 flex items-center justify-between border-b border-[#e1e5e2] pb-5">
          <Link
            href="/products/cart"
            className="text-sm font-medium text-[#52605c] underline-offset-4 hover:text-[#16354a] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16354a]"
          >
            ← Handlekurv
          </Link>
          <span className="text-sm font-semibold tracking-[0.2em] text-[#16354a]">NORYA</span>
          <span className="text-sm text-[#52605c]">Sikker betaling</span>
        </header>

        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64716d]">Bestilling</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2a2a] sm:text-4xl">Fullfør kjøpet</h1>
          <p className="mt-2 text-base leading-7 text-[#52605c]">
            Betal med kort. Digitale lommebøker vises også når de er tilgjengelige på enheten din.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)] lg:gap-8">
          <section aria-labelledby="payment-heading" className="rounded-2xl border border-[#e1e5e2] bg-white p-5 shadow-sm sm:p-8">
            <h2 id="payment-heading" className="text-xl font-semibold tracking-tight text-[#1f2a2a]">Betalingsmetode</h2>
            <p className="mt-1 text-sm leading-6 text-[#52605c]">Kortbetaling er tilgjengelig. Apple Pay eller Google Pay kan vises på støttede enheter.</p>
            {isStripeTestMode && (
              <div className="mt-5 rounded-xl border border-[#d8e2e8] bg-[#f5f8fa] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1f2a2a]">Testbetaling</h3>
                    <p className="mt-1 text-sm leading-6 text-[#52605c]">
                      Testverdier godtas kun i Stripe testmodus. Lim kortopplysningene inn i Stripes sikre felt.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyTestDetails}
                    className="min-h-10 rounded-lg border border-[#b9c9d1] bg-white px-3 text-sm font-semibold text-[#16354a] transition-colors hover:bg-[#edf3f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16354a]"
                  >
                    Kopier testverdier
                  </button>
                </div>
                <dl className="mt-3 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                  <div><dt className="inline text-[#64716d]">Kortnummer: </dt><dd className="inline font-medium text-[#1f2a2a]">4242 4242 4242 4242</dd></div>
                  <div><dt className="inline text-[#64716d]">Utløpsdato: </dt><dd className="inline font-medium text-[#1f2a2a]">12/34</dd></div>
                  <div><dt className="inline text-[#64716d]">CVC: </dt><dd className="inline font-medium text-[#1f2a2a]">123</dd></div>
                  <div><dt className="inline text-[#64716d]">Postnummer: </dt><dd className="inline font-medium text-[#1f2a2a]">12345</dd></div>
                </dl>
                {testDetailsStatus && (
                  <p className="mt-3 text-sm text-[#52605c]" aria-live="polite">{testDetailsStatus}</p>
                )}
              </div>
            )}
            <div className="mt-6">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret: checkoutSession.clientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </section>

          <aside aria-labelledby="summary-heading" className="rounded-2xl border border-[#e1e5e2] bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-8">
            <h2 id="summary-heading" className="text-xl font-semibold tracking-tight text-[#1f2a2a]">Ordresammendrag</h2>
            <ul className="mt-5 divide-y divide-[#e8ebe9]">
              {summary.items.map((item, index) => (
                <li key={`${item.name}-${index}`} className="flex justify-between gap-4 py-4 first:pt-0">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium leading-6 text-[#1f2a2a]">{item.name}</p>
                    <p className="mt-1 text-sm text-[#64716d]">Antall: {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-medium tabular-nums text-[#1f2a2a]">
                    {formatPrice(item.unitPrice * item.quantity, currency)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-2 space-y-3 border-t border-[#e1e5e2] pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#52605c]">Delsum</dt>
                <dd className="font-medium tabular-nums">{formatPrice(summary.subtotalAmount, currency)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#52605c]">{summary.shippingName || 'Frakt'}</dt>
                <dd className="font-medium tabular-nums">{formatPrice(summary.shippingAmount, currency)}</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-[#e1e5e2] pt-5">
              <span className="text-base font-semibold text-[#1f2a2a]">Totalt</span>
              <span className="text-xl font-semibold tabular-nums text-[#16354a]">
                {formatPrice(summary.totalAmount, currency)}
              </span>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#64716d]">
              Betalingen bekreftes først når Stripe har verifisert transaksjonen.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
