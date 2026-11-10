'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const ColorDot = ({ color, className = '' }) => (
  <span className={`inline-block h-2 w-2 rounded-full ${className}`} style={{ backgroundColor: color }} />
);

export default function PaymentInfo({ activeTheme, userRole }) {
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [syncingStatus, setSyncingStatus] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [marketplaceApprovalStatus, setMarketplaceApprovalStatus] = useState('pending');

  const auth = getAuth();
  const db = getFirestore();
  const themeColor = activeTheme?.accent || '#1f4a58';

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, [auth]);

  useEffect(() => {
    const loadPaymentInfo = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setMarketplaceApprovalStatus(
            userSnap.data()?.sellerApprovalStatus || 'pending'
          );
        }

        if (userSnap.exists() && userSnap.data()?.stripeConnectId) {
          const info = {
            stripeConnectId: userSnap.data().stripeConnectId,
            connectedAt: userSnap.data().stripeConnectAt,
            email: userSnap.data().stripeConnectEmail,
          };
          setPaymentInfo(info);
          await refreshAccountStatus();
        }
      } catch (err) {
        console.error('Error loading payment info:', err);
        setError('Kunne ikke laste betalingsinformasjon.');
      } finally {
        setLoading(false);
      }
    };

    loadPaymentInfo();
  }, [currentUser, db]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stripeParam = urlParams.get('stripe');
    if (stripeParam === 'success' && paymentInfo?.stripeConnectId) {
      refreshAccountStatus().then((data) => {
        if (data?.needsDocumentVerification) {
          simulateVerificationIfNeeded();
        } else if (data?.needsBankAccount || data?.needsTosAcceptance) {
          setSuccess('Du må fullføre onboarding for å legge til bankkonto og akseptere vilkår.');
        }
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [paymentInfo]);

  const refreshAccountStatus = async () => {
    const idToken = await currentUser.getIdToken();
    const res = await fetch('/api/stripe/retrieve-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json() : null;

    console.log('🔍 [PaymentInfo] refresh status:', res.status);

    if (!res.ok) {
      const rawText = data ? JSON.stringify(data) : 'empty response';
      console.error('❌ [PaymentInfo] refresh failed:', res.status, rawText);
      const message = data?.error || 'Kunne ikke hente kontostatus.';
      const fallback = message.includes('does not have access')
        ? 'Denne Stripe-kontoen har ikke tilgang til denne Connect-kontoen. Sjekk at STRIPE_SECRET_KEY i .env.local tilhører riktig Stripe-konto.'
        : message;
      throw new Error(fallback);
    }

    if (!data) {
      throw new Error('Uventet svar fra Stripe-tjenesten.');
    }

    setAccountStatus(data);
    console.log("📊 Stripe account status refreshed:", {
      details_submitted: data.details_submitted,
      charges_enabled: data.charges_enabled,
      payouts_enabled: data.payouts_enabled,
      needsDocumentVerification: data.needsDocumentVerification,
    });

    if (data.charges_enabled && data.payouts_enabled) {
      console.log("🎉 CONNECT ACCOUNT FULLY VERIFIED - Ready to receive payouts");
    }

    return data;
  };

  const simulateVerificationIfNeeded = async () => {
    if (!accountStatus?.needsDocumentVerification) {
      return;
    }

    // For Express accounts, identity verification requires the seller to go through
    // Stripe's hosted onboarding flow and upload a document. Test mode accepts any image.
    // The "Test-verifiser nå" button handles this — no auto-verification possible.
    setSuccess('Konto krever identitetsverifisering. Klikk på "Test-verifiser nå" og last opp et bilde i Stripe-vinduet.');
  };

  const getDocumentOnboardingLink = async () => {
    const idToken = await currentUser.getIdToken();
    const res = await fetch('/api/stripe/onboarding-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Kunne ikke generere onboarding-link.');
    }

    if (!data.onboardingUrl) {
      throw new Error('Ingen KYC-dokumenter mangler for denne kontoen.');
    }

    return data.onboardingUrl;
  };

const startStripeOnboarding = async () => {
    if (!currentUser?.uid) {
      setError('Du må være logget inn.');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch('/api/stripe/create-account-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Kunne ikke starte Stripe onboarding.');
      }

      if (!data.url || !data.accountId) {
        throw new Error('Mangler påkrevde data fra Stripe.');
      }

      setPaymentInfo({
        stripeConnectId: data.accountId,
        connectedAt: new Date().toISOString(),
        email: currentUser.email,
      });

      window.location.href = data.url;
    } catch (err) {
      console.error('Stripe onboarding error:', err);
      setError(err.message || 'Feil ved tilkobling av Stripe.');
    } finally {
      setConnecting(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!paymentInfo?.stripeConnectId) return;
    setLoadingStatus(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await refreshAccountStatus();
      if (data?.needsDocumentVerification) {
        await simulateVerificationIfNeeded();
      }
    } catch (err) {
      console.error('Failed to refresh account status:', err);
      setError('Kunne ikke oppdatere status. Prøv igjen senere.');
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleSyncStripeWithFirebase = async () => {
    if (!currentUser?.uid || !paymentInfo?.stripeConnectId) return;

    setSyncingStatus(true);
    setError(null);
    setSuccess(null);
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch('/api/seller-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Kunne ikke synkronisere Stripe med Firebase.');
      }

      setMarketplaceApprovalStatus(data.seller.sellerApprovalStatus || marketplaceApprovalStatus);
      const status = await refreshAccountStatus();
      setSuccess(
        status.charges_enabled && status.payouts_enabled
          ? 'Stripe-status er synkronisert med Firebase. Kontoen er klar for betalinger og utbetalinger.'
          : 'Stripe-status er synkronisert med Firebase. Kontoen mangler fortsatt krav før betalinger og utbetalinger kan aktiveres.'
      );
    } catch (err) {
      console.error('Failed to sync Stripe status with Firebase:', err);
      setError(err.message || 'Kunne ikke synkronisere Stripe med Firebase. Prøv igjen senere.');
    } finally {
      setSyncingStatus(false);
    }
  };

  const handleDisconnect = async () => {
    if (!currentUser?.uid || !paymentInfo?.stripeConnectId) return;

    if (!window.confirm('Er du sikker på at du vil koble fra Stripe? Du vil ikke motta betalinger før du kobler til igjen.')) {
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        stripeConnectId: null,
        stripeConnectAt: null,
        stripeConnectEmail: null,
      });

      setPaymentInfo(null);
      setAccountStatus(null);
      setSuccess('Stripe kontoen er koblet fra.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error disconnecting Stripe:', err);
      setError('Kunne ikke koble fra Stripe.');
    }
  };

const StatusDot = ({ color }) => (
  <span
    className="inline-block h-2 w-2 rounded-full shadow-sm"
    style={{ backgroundColor: color }}
  />
);

const getStatusBadge = () => {
  if (!accountStatus && paymentInfo?.stripeConnectId) {
    return (
      <div className="flex items-center gap-2">
        <StatusDot color="#94a3b8" />
        <span className="text-sm font-medium text-slate-500">Ukjent</span>
      </div>
    );
  }
  if (!accountStatus) return null;

  const { details_submitted, charges_enabled, payouts_enabled } = accountStatus;

  if (details_submitted && charges_enabled && payouts_enabled) {
    return (
      <div className="flex items-center gap-2">
        <StatusDot color="#10b981" />
        <span className="text-sm font-semibold text-emerald-700">
          Fullt aktiv
        </span>
      </div>
    );
  }

  if (details_submitted && charges_enabled) {
    return (
      <div className="flex items-center gap-2">
        <StatusDot color="#f59e0b" />
        <span className="text-sm font-semibold text-amber-700">
          Under verifisering
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <StatusDot color="#ef4444" />
      <span className="text-sm font-semibold text-red-700">
        Krever handling
      </span>
    </div>
  );
};

if (loading) {
  return (
    <div className="animate-fadeIn space-y-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
        <StatusDot color={themeColor} />
        Inntektskilde
      </div>
      <p className="text-sm text-slate-600">Laster betalingsinformasjon...</p>
    </div>
  );
}

const stripeReady = Boolean(
  accountStatus?.details_submitted &&
  accountStatus?.charges_enabled &&
  accountStatus?.payouts_enabled
);
const approvalLabel = marketplaceApprovalStatus === 'approved'
  ? 'Selger godkjent'
  : marketplaceApprovalStatus === 'rejected'
    ? 'Selger ikke godkjent'
    : 'Venter på NORYA-godkjenning';
return userRole === 'seller' ? (
  <div className="animate-fadeIn space-y-6">
    <header>
      <div
        className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em]"
        style={{ color: themeColor }}
      >
        <StatusDot color={themeColor} />
        Inntektskilde
      </div>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
        Betalingsinformasjon
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700">
        Koble til Stripe Connect for å motta betalinger direkte. NORYA tar en
        liten del av omsetningen som plattformgebyr.
      </p>
    </header>

    {error && (
      <div role="alert" className="rounded-lg border-l-4 border-rose-600 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-950">
        {error}
      </div>
    )}
    {success && (
      <div role="status" className="rounded-lg border-l-4 border-emerald-600 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-950">
        {success}
      </div>
    )}

    {paymentInfo?.stripeConnectId ? (
      <div className="space-y-5">
        <section className="grid gap-3 md:grid-cols-2" aria-label="Tilkoblingsstatus">
          <div className={`rounded-xl border p-5 sm:p-6 ${stripeReady ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
              Stripe Connect
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                Stripe-status
              </h3>
              <div className="border border-white bg-white px-3 py-1.5">
                {getStatusBadge()}
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">
              {stripeReady
                ? 'Kontoen er klar til å motta betalinger og utbetalinger.'
                : 'Noen kontodetaljer må fullføres før betalinger og utbetalinger er klare.'}
            </p>
          </div>

          <div className={`rounded-xl border p-5 sm:p-6 ${marketplaceApprovalStatus === 'approved' ? 'border-emerald-200 bg-emerald-50' : marketplaceApprovalStatus === 'rejected' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
              NORYA-markedsplass
            </p>
            <div className="mt-3 flex items-center gap-2">
              <StatusDot color={marketplaceApprovalStatus === 'approved' ? '#16a34a' : marketplaceApprovalStatus === 'rejected' ? '#e11d48' : '#d97706'} />
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                {approvalLabel}
              </h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">
              Stripe-tilkobling og NORYA-godkjenning er separate. NORYA-godkjenning
              kreves før produktene dine kan selges.
            </p>
          </div>
        </section>

        <section aria-labelledby="account-details-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                Konto
              </p>
              <h3 id="account-details-heading" className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                Kontodetaljer
              </h3>
            </div>
            {paymentInfo.connectedAt && (
              <p className="text-sm text-slate-700">
                Tilkoblet siden{' '}
                <span className="font-medium text-slate-700">
                  {new Date(paymentInfo.connectedAt).toLocaleDateString('no-NO')}
                </span>
              </p>
            )}
          </div>

          {paymentInfo.email && (
            <div className="mt-5 border-b border-slate-100 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                Stripe-e-post
              </p>
              <p className="mt-1 break-all text-sm font-medium text-slate-900">
                {paymentInfo.email}
              </p>
            </div>
          )}

          {accountStatus && (
            <>
              <dl className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  {
                    label: 'Detaljer sendt',
                    value: accountStatus.details_submitted,
                    activeText: 'Sendt',
                    inactiveText: 'Ikke sendt',
                  },
                  {
                    label: 'Betalinger aktivert',
                    value: accountStatus.charges_enabled,
                    activeText: 'Aktivert',
                    inactiveText: 'Ikke aktivert',
                  },
                  {
                    label: 'Utbetalinger aktivert',
                    value: accountStatus.payouts_enabled,
                    activeText: 'Aktivert',
                    inactiveText: 'Ikke aktivert',
                  },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${item.value ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                    <dt className="text-sm font-medium text-slate-800">{item.label}</dt>
                    <dd className={`shrink-0 text-sm font-semibold ${item.value ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {item.value ? item.activeText : item.inactiveText}
                    </dd>
                  </div>
                ))}
              </dl>

              {(accountStatus.requirements_currently_due || []).length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-900">
                    Gjenstående krav
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-900">
                    {accountStatus.requirements_currently_due.map(req => {
                      if (req === 'external_account') return 'Bankkonto';
                      if (req === 'tos_acceptance.date') return 'Vilkårsaksept – dato';
                      if (req === 'tos_acceptance.ip') return 'Vilkårsaksept – IP';
                      if (req.startsWith('individual.verification.document')) return 'Identitetsdokument';
                      return req;
                    }).join(', ')}
                  </p>
                </div>
              )}

              {accountStatus.requirements_eventually_due?.length > 0 && (
                <div className="mt-3 rounded-lg border border-sky-300 bg-sky-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-900">
                    Fremtidige krav
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-sky-900">
                    {accountStatus.requirements_eventually_due.map(req => {
                      if (req === 'external_account') return 'Bankkonto';
                      if (req === 'tos_acceptance.date') return 'Vilkårsaksept – dato';
                      if (req === 'tos_acceptance.ip') return 'Vilkårsaksept – IP';
                      if (req.startsWith('individual.verification.document')) return 'Identitetsdokument';
                      return req;
                    }).join(', ')}
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        <section aria-labelledby="payment-actions-heading">
          <div className="mb-3">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Administrer
            </p>
            <h3 id="payment-actions-heading" className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
              Betalingshandlinger
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://dashboard.stripe.com/express/${paymentInfo.stripeConnectId}/login`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 flex-1 items-center text-white justify-center rounded-lg px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
              style={{ backgroundColor: themeColor }}
            >
              Stripe Dashboard
            </a>

            {(accountStatus?.needsBankAccount || accountStatus?.needsTosAcceptance) && (
              <button
                onClick={startStripeOnboarding}
                disabled={connecting}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg border border-amber-400 bg-amber-100 px-5 py-3 text-sm font-semibold text-amber-950 transition hover:bg-amber-200 disabled:opacity-50"
              >
                {connecting ? 'Åpner...' : 'Fullfør onboarding'}
              </button>
            )}

            {accountStatus?.needsDocumentVerification && (
              <button
                onClick={async () => {
                  setConnecting(true);
                  setError(null);
                  setSuccess('Åpner Stripe onboarding. Last opp et bilde i Stripe-vinduet for å fullføre testverifisering.');
                  try {
                    const url = await getDocumentOnboardingLink();
                    window.location.href = url;
                  } catch (err) {
                    setError(err.message || 'Kunne ikke åpne Stripe-dokumentopplasting.');
                  } finally {
                    setConnecting(false);
                  }
                }}
                disabled={connecting}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg border border-amber-400 bg-amber-100 px-5 py-3 text-sm font-semibold text-amber-950 transition hover:bg-amber-200 disabled:opacity-50"
              >
                {connecting ? 'Åpner...' : 'Test-verifiser nå'}
              </button>
            )}

            <button
              onClick={handleRefreshStatus}
              disabled={loadingStatus || syncingStatus}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {loadingStatus ? 'Oppdaterer...' : 'Oppdater status'}
            </button>
            <button
              onClick={handleSyncStripeWithFirebase}
              disabled={loadingStatus || syncingStatus}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {syncingStatus ? 'Synkroniserer...' : 'Synkroniser med NORYA'}
            </button>
          </div>

          {!accountStatus?.needsDocumentVerification && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border-l-4 border-sky-700 bg-sky-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-sky-950">Testmodus</p>
                <p className="mt-0.5 text-xs text-sky-900">
                  Legg til testmidler på Stripe-kontoen.
                </p>
              </div>
              <button
                onClick={async () => {
                  setConnecting(true);
                  setError(null);
                  try {
                    const res = await fetch('/api/stripe/add-funds', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ accountId: paymentInfo.stripeConnectId, amount: 50000, currency: 'nok' }),
                    });
                    const data = await res.json();

                    if (!res.ok) {
                      throw new Error(data.error || 'Kunne ikke legge til test-finansiering.');
                    }

                    setSuccess(`500 NOK lagt til konto i testmodus! (Betaling: ${data.paymentIntentId})`);
                  } catch (err) {
                    setError(err.message || 'Kunne ikke legge til test-finansiering.');
                  } finally {
                    setConnecting(false);
                  }
                }}
                disabled={connecting}
                className="rounded-lg border border-sky-300 bg-white px-4 py-2.5 text-sm font-semibold text-sky-950 transition hover:bg-sky-100 disabled:opacity-50"
              >
                {connecting ? 'Sender...' : '+500 NOK'}
              </button>
            </div>
          )}

          <div className="mt-5 border-t border-slate-100 pt-4">
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-50"
            >
              Koble fra Stripe
            </button>
          </div>
        </section>
      </div>
    ) : (
      <section className="rounded-xl border-l-4 border-slate-700 bg-slate-100 p-6 sm:p-8">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
            Stripe Connect
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            Motta betalinger direkte
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">
            Koble til en Stripe-konto for at kundene skal kunne betale trygt.
            Hvis du ikke har en konto, opprettes den underveis.
          </p>
          <button
            onClick={startStripeOnboarding}
            disabled={connecting}
            className="mt-6 min-h-12 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 active:brightness-90 disabled:opacity-50"
            style={{ backgroundColor: themeColor }}
          >
            {connecting ? 'Kobler til...' : 'Koble til Stripe Connect'}
          </button>
        </div>
      </section>
    )}

    <p className="border-t border-slate-200 pt-5 text-sm leading-relaxed text-slate-700">
      Betalinger behandles sikkert av Stripe og overføres direkte til Stripe-kontoen
      din. NORYA tar en liten prosent av hver ordre som plattformgebyr.
    </p>
  </div>
) : null;

}