'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getCroppedImg } from '../utils/cropImage';
import { useAuth } from '../auth/authContext';
import { DEFAULT_AVATAR_URL } from '../utils/profileAvatar';
import { isFirestoreOfflineError } from '../utils/firestoreErrors';
import { RegisterUser } from '../auth/RegisterUser';
import { SignInUser } from '../auth/SignIn';
import { GoogleSignIn } from '../auth/GoogleSignIn';
import PostProduct from '../post/PostProduct';
import { getFirestore, doc, collection, getDocs } from 'firebase/firestore';
import { Space_Grotesk, Roboto } from 'next/font/google';
import OnboardingNotice from '../components/OnboardingNotice';
import PaymentInfo from '../components/PaymentInfo';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const PROFILE_THEMES = [
  { id: 'fjord', name: 'Fjordbla', accent: '#1f4a58', surface: '#edf4f7', border: '#bfd3db' },
  { id: 'midnatt', name: 'Midnatt', accent: '#263248', surface: '#eef1f7', border: '#c7cfdf' },
  { id: 'skog', name: 'Skog', accent: '#315044', surface: '#edf5f1', border: '#c7ddd3' },
  { id: 'rav', name: 'Rav', accent: '#7a5322', surface: '#f8f1e8', border: '#e5d4be' },
  { id: 'plomme', name: 'Plombe', accent: '#4a355f', surface: '#f2eef8', border: '#d7cde9' },
  { id: 'stein', name: 'Stein', accent: '#4b5563', surface: '#f1f3f5', border: '#d5dbe2' },
  { id: 'kyst', name: 'Kyst', accent: '#005f73', surface: '#eaf5f7', border: '#bdd9de' },
  { id: 'vin', name: 'Vinrod', accent: '#6f2f3b', surface: '#f8ecef', border: '#e6c5cc' },
  { id: 'sol', name: 'Sol', accent: '#9f5c29', surface: '#fef7f0', border: '#fad9b5' },
  { id: 'havs', name: 'Havets Grå', accent: '#5d758e', surface: '#f0f4f8', border: '#c2d0e0' },
];

const hexToRgba = (hex, alpha) => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const value = Number.parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ProductCard = ({ product, favorite = false, onDelete, deleting = false }) => {
  const ProductContainer = product.isPendingUpload ? 'div' : 'a';
  const productLinkProps = product.isPendingUpload ? {} : { href: `/products/${product.id}` };

  return (
  <div>
    <ProductContainer {...productLinkProps} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.35rem] bg-slate-100">
        <img
          src={product.images?.[0] || '/placeholder.jpg'}
          alt={favorite ? favorite.name : product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.isPendingUpload && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
            Lagrer produkt...
          </span>
        )}
      </div>
      <h3 className="mt-3 truncate text-sm font-semibold text-slate-900 sm:text-base">
        {favorite ? favorite.name || 'Ukjent Produkt' : product.name}
      </h3>
      <p className="mt-1 min-h-[2.25rem] text-xs text-slate-500">
        {favorite ? favorite.currency?.toUpperCase() || 'NOK' : product.currency?.toUpperCase() || 'NOK'}{' '}
        {favorite ? favorite.price ?? '0' : product.description || 'Ingen beskrivelse'}
      </p>
      {!favorite && (
        <p className="mt-1 text-sm font-bold text-slate-800">
          {product.currency?.toUpperCase() || 'NOK'} {product.price?.toLocaleString()}
        </p>
      )}
    </ProductContainer>
    {onDelete && !product.isPendingUpload && (
      <details className="group relative mt-3">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
          Administrer produkt
          <span aria-hidden="true" className="ml-3 text-slate-400 transition group-open:rotate-180">⌄</span>
        </summary>
        <div className="absolute right-0 z-20 mt-2 w-full min-w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          <a
            href={`/products/${product.id}?edit=true`}
            className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Rediger produkt
          </a>
          <button
            type="button"
            onClick={() => onDelete(product)}
            disabled={deleting}
            className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? 'Fjerner produkt...' : 'Fjern fra butikk'}
          </button>
        </div>
      </details>
    )}
  </div>
  );
};

const ImageCropUploader = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [showHalo, setShowHalo] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileNotice, setProfileNotice] = useState('');
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [profileThemeId, setProfileThemeId] = useState('fjord');
  const [authFlow, setAuthFlow] = useState('select');
  const [selectedRole, setSelectedRole] = useState('civilian');
  const [userRole, setUserRole] = useState('civilian');

  const [creatorProducts, setCreatorProducts] = useState([]);
  const [pendingCreatorProducts, setPendingCreatorProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [productDeleteError, setProductDeleteError] = useState('');

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  const user = auth.currentUser;
  const { user: contextUser, loading: authLoading } = useAuth();

  const effectiveName = user?.displayName || contextUser?.fullName || user?.email || 'Uten navn';
  const profilePic = user?.photoURL || DEFAULT_AVATAR_URL;

  useEffect(() => {
    const reloadUser = async () => {
      const current = auth.currentUser;
      if (current) {
        try {
          await current.reload();
        } catch (err) {
          console.error('Failed to reload user:', err);
        }
      }
    };
    reloadUser();
  }, [auth]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stripeStatus = urlParams.get('stripe');

    if (stripeStatus === 'success' && user) {
      console.log('✅ STRIPE CONNECT ONBOARDING RETURNED - SUCCESS');
      console.log('🔄 Creating seller document...');
      
      // Call API to create/update seller document
      user.getIdToken()
        .then((idToken) => fetch('/api/seller-onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
        }))
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Kunne ikke oppdatere selgerstatus.');
          console.log('✅ Seller document synchronized:', data.seller);
        })
        .catch(err => console.error('❌ Error synchronizing seller onboarding:', err));
    }
    if (stripeStatus === 'refresh' && user) {
      console.log('🔄 STRIPE CONNECT ONBOARDING REFRESH - account needs re-onboarding');
    }
  }, [user]);

  useEffect(() => {
    setShowHalo(true);
    const timer = setTimeout(() => setShowHalo(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const onCropComplete = useCallback((_, croppedArea) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setProfileError('Velg en bildefil for profilbildet.');
        e.target.value = '';
        return;
      }

      setProfileError('');
      const reader = new FileReader();
      reader.onload = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setImageSrc(reader.result);
      };
      reader.onerror = () => {
        setProfileError('Bildet kunne ikke leses. Prøv en annen fil.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!user) return;

    const displayName = newName.trim();
    if (!displayName) {
      setProfileError('Visningsnavn kan ikke være tomt.');
      return;
    }

    setSavingProfile(true);
    setProfileError('');
    setProfileNotice('');
    try {
      let photoURL = user.photoURL || null;

      if (imageSrc && croppedAreaPixels) {
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
        const storageRef = ref(storage, `profilePics/${user.uid}/profile.jpg`);
        await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
        photoURL = await getDownloadURL(storageRef);
      }

      const idToken = await user.getIdToken();
      const response = await fetch('/api/updateProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          displayName,
          photoURL,
          profileThemeId,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Profilen kunne ikke lagres.');
      }

      await user.reload();
      setImageSrc(null);
      setCroppedAreaPixels(null);
      setProfileNotice(result.warning || 'Profilen ble oppdatert.');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError(error.message || 'Profilen kunne ikke lagres. Prøv igjen.');
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    async function fetchProducts() {
      if (!user?.uid) return;
      try {
        console.log('attempting to fetch products from Next.js API route...');
        const idToken = await user.getIdToken();
        const res = await fetch(
          `/api/creatorProducts?creator=${encodeURIComponent(user.uid)}&includeUnapproved=true`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        const json = await res.json();

        if (json.data) {
          const filtered = json.data.filter(
            (product) => product.metadata?.creatorId === user.uid
          );
          setCreatorProducts(filtered);
        } else {
          console.warn('No data returned from API.');
          setCreatorProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setCreatorProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }

    fetchProducts();
  }, [user]);

  const handleDeleteProduct = async (product) => {
    if (!user || !window.confirm(`Fjerne «${product.name}» fra butikken? Produktet skjules for kunder, men lagres slik at en administrator kan gjenopprette det. Ordrehistorikk og Stripe-data beholdes.`)) {
      return;
    }

    setDeletingProductId(product.id);
    setProductDeleteError('');
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/products/${encodeURIComponent(product.id)}/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Produktet kunne ikke fjernes fra butikken.');
      }

      setCreatorProducts((current) => current.filter((item) => item.id !== product.id));
      setFavoriteProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      setProductDeleteError(error.message || 'Produktet kunne ikke fjernes fra butikken. Prøv igjen.');
    } finally {
      setDeletingProductId(null);
    }
  };

  useEffect(() => {
    async function fetchFavorites() {
      if (!user?.uid) return;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const favouritesRef = collection(userDocRef, 'favourites');
        const snapshot = await getDocs(favouritesRef);
        const favoriteIds = snapshot.docs.map((doc) => doc.data().productId).filter(Boolean);

        if (favoriteIds.length === 0) {
          setFavoriteProducts([]);
          return;
        }

        const res = await fetch('/api/products');
        const json = await res.json();
        if (json.data) {
          const favoriteProducts = json.data.filter((p) => favoriteIds.includes(p.id));
          setFavoriteProducts(favoriteProducts);
        } else {
          setFavoriteProducts([]);
        }
      } catch (error) {
        if (!isFirestoreOfflineError(error)) {
          console.error('Error fetching favorites:', error);
        }
        setFavoriteProducts([]);
      }
    }

    fetchFavorites();
  }, [user]);

  useEffect(() => {
    setProfileThemeId(contextUser?.profileThemeId || 'fjord');
    setUserRole(
      contextUser?.role ||
      (contextUser?.roles?.includes('seller') ? 'seller' : 'civilian')
    );
  }, [contextUser?.profileThemeId, contextUser?.role, contextUser?.roles]);

  const activeTheme = PROFILE_THEMES.find((theme) => theme.id === profileThemeId) || PROFILE_THEMES[0];
  const displayedCreatorProducts = [...pendingCreatorProducts, ...creatorProducts];

 const UploadProductIfSignedIn = () =>
  user?.uid && userRole === 'seller' ? (
    <>
      {!showNewProduct ? (
        <button
          onClick={() => setShowNewProduct(true)}
          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 active:brightness-90"
          style={{ backgroundColor: activeTheme.accent }}
        >
          <span className="inline-block h-2 w-2 rounded-full bg-white/80 shadow-sm"></span>
          Nytt Produkt
        </button>
      ) : (
        <div className="rounded-[1.35rem] bg-white/60 backdrop-blur-xl p-5 sm:p-6 shadow-sm border border-slate-200/40">
          <PostProduct
            onProductPending={(product) => {
              setPendingCreatorProducts((current) => [product, ...current]);
            }}
            onProductCreated={(product, pendingId) => {
              setPendingCreatorProducts((current) => current.filter((item) => item.id !== pendingId));
              setCreatorProducts((current) => [
                product,
                ...current.filter((item) => item.id !== product.id),
              ]);
            }}
            onProductFailed={(pendingId) => {
              setPendingCreatorProducts((current) => current.filter((item) => item.id !== pendingId));
            }}
          />

          <button
            onClick={() => setShowNewProduct(false)}
            className="mt-5 w-full rounded-full border border-slate-300 bg-white/70 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white"
          >
            Lukk
          </button>
        </div>
      )}
    </>
  ) : null;

return (
  <div className={`${spaceGrotesk.className} relative min-h-screen overflow-hidden pb-16 pt-32 text-slate-900`}>
    <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 sm:px-8">

      {/* Logged-in user */}
      {user && (
        <section className="rounded-[2rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm">
          <div className="p-8 sm:p-10">
            {!editing ? (
              /* VIEW MODE */
              <>
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full">
                    {showHalo && (
                      <div className="animate-glow absolute inset-0 rounded-full bg-slate-300/30 blur-xl"></div>
                    )}
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt="Profil"
                        className="relative z-10 h-full w-full rounded-full object-cover object-center shadow-md ring-4 ring-white"
                      />
                    ) : (
                      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-white/70 text-2xl font-semibold text-slate-500 shadow-md ring-4 ring-white">
                        {effectiveName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                   <div className="flex-1 text-center sm:text-left">
                    <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <p className="text-xs uppercase tracking-[0.28em] font-medium text-slate-500">
                        Profiloversikt
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <h1 className={`${roboto.className} text-3xl font-semibold text-slate-900 tracking-tight sm:text-4xl`}>
                        {effectiveName}
                      </h1>
                      {userRole === 'seller' && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
                          Seller Profile
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-4 text-sm text-slate-500 sm:justify-start">
                      <span className="h-2 w-2 rounded-full bg-sky-400" />
                      <span>Tema: <span className="font-semibold text-slate-700">{activeTheme.name}</span></span>
                      {user?.email && (
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-slate-400" />
                          {user.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => {
                      setNewName(user?.displayName || contextUser?.fullName || effectiveName);
                      setProfileError('');
                      setProfileNotice('');
                      setEditing(true);
                    }}
                    className="rounded-full px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 active:brightness-90"
                    style={{ backgroundColor: activeTheme.accent }}
                  >
                    Rediger Profil
                  </button>
                  <button
                    onClick={async () => {
                      await auth.signOut();
                      alert('Du er logget ut.');
                    }}
                    className="rounded-full border border-slate-300 bg-white/70 px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white"
                  >
                    Logg Ut
                  </button>
                </div>

                {!deleting ? (
                  <button
                    onClick={() => {
                      setDeleteError('');
                      setDeleteConfirmText('');
                      setDeleting(true);
                    }}
                    className="mt-3 rounded-full border border-rose-300 bg-rose-50 px-5 py-2.5 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-100"
                  >
                    Slett konto
                  </button>
                ) : (
                  <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4"
                    role="presentation"
                  >
                    <section
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="delete-account-title"
                      className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                        Permanent handling
                      </p>
                      <h2 id="delete-account-title" className="mt-2 text-2xl font-semibold text-slate-900">
                        Delete Account
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        This will permanently delete your account and cannot be undone.
                      </p>
                      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                        <p className="font-semibold">The following personal data will be removed:</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                          <li>Your sign-in account and private user profile</li>
                          <li>Your public profile and saved favourites</li>
                          <li>Your profile image and personal uploaded files</li>
                        </ul>
                        <p className="mt-3">
                          Orders, products, seller records, and financial history are retained where needed
                          for marketplace integrity and accounting. Seller deletion may be blocked while
                          active products, unresolved orders, or pending payouts remain.
                        </p>
                      </div>
                      <label htmlFor="delete-account-confirmation" className="mt-5 block text-sm font-medium text-slate-700">
                        Type <strong>slett</strong> to confirm account deletion.
                      </label>
                      <input
                        id="delete-account-confirmation"
                        type="text"
                        autoComplete="off"
                        value={deleteConfirmText}
                        onChange={(event) => setDeleteConfirmText(event.target.value)}
                        disabled={deletingAccount}
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 disabled:bg-slate-100"
                      />
                      {deleteError && (
                        <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
                          {deleteError}
                        </p>
                      )}
                      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          disabled={deletingAccount}
                          onClick={() => {
                            setDeleting(false);
                            setDeleteConfirmText('');
                            setDeleteError('');
                          }}
                          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={deletingAccount || deleteConfirmText.trim().toLowerCase() !== 'slett'}
                          onClick={async () => {
                            if (deleteConfirmText.trim().toLowerCase() !== 'slett') {
                              setDeleteError('Type "slett" to confirm account deletion.');
                              return;
                            }
                            setDeletingAccount(true);
                            setDeleteError('');
                            try {
                              if (!auth.currentUser) {
                                throw new Error('Please sign in again before deleting your account.');
                              }
                              const idToken = await auth.currentUser.getIdToken(true);
                              const response = await fetch('/api/delete-account', {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${idToken}` },
                              });
                              const result = await response.json();
                              if (!response.ok) {
                                throw new Error(result.error || 'Account deletion could not be completed.');
                              }
                              await auth.signOut();
                              window.location.href = '/';
                            } catch (error) {
                              console.error('Account deletion failed:', error);
                              setDeleteError(error.message || 'Account deletion could not be completed.');
                            } finally {
                              setDeletingAccount(false);
                            }
                          }}
                          className="rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingAccount ? 'Deleting…' : 'Permanently Delete Account'}
                        </button>
                      </div>
                    </section>
                  </div>
                )}
              </>
            ) : (
              /* EDIT MODE */
              <>
                <div className="mb-5 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                    Redigeringsmodus
                  </div>
                </div>

                <h1 className={`${roboto.className} text-2xl font-semibold text-slate-900`}>
                  Oppdater <span className="text-slate-700">{effectiveName}</span>
                </h1>

                <div className="mt-6 space-y-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="profile-display-name" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      Visningsnavn
                    </label>
                    <input
                      id="profile-display-name"
                      aria-label="Visningsnavn"
                      className="w-full rounded-2xl border border-slate-300 bg-white/70 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>

                  {/* Profile Picture Upload */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                      Profilbilde
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm file:mr-4 file:rounded-full file:border file:border-slate-300 file:bg-white file:px-4 file:py-2 file:text-slate-700 hover:file:bg-slate-100"
                    />
                  </div>

                  {/* Theme Colors */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                      Profilfarge
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {PROFILE_THEMES.map((theme) => {
                        const selected = theme.id === profileThemeId;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setProfileThemeId(theme.id)}
                            title={theme.name}
                            aria-label={`Velg ${theme.name}`}
                            className="h-7 w-7 rounded-full shadow-sm transition hover:scale-110"
                            style={{
                              backgroundColor: theme.accent,
                              boxShadow: selected
                                ? `0 0 0 3px ${hexToRgba(theme.accent, 0.25)}`
                                : 'none',
                            }}
                          />
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Denne fargen brukes kun på profilsider.</p>
                  </div>

                  {/* Cropper */}
                  {imageSrc && (
                    <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-full bg-slate-100">
                      <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        objectFit="cover"
                        minZoom={1}
                        maxZoom={4}
                        restrictPosition
                        cropShape="round"
                        aspect={1}
                        cropSize={{ width: 256, height: 256 }}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    </div>
                  )}

                  {imageSrc && (
                    <div>
                      <label htmlFor="profile-image-zoom" className="mb-2 block text-sm font-medium text-slate-700">
                        Zoom
                      </label>
                      <input
                        id="profile-image-zoom"
                        type="range"
                        min="1"
                        max="4"
                        step="0.01"
                        value={zoom}
                        onChange={(event) => setZoom(Number(event.target.value))}
                        className="w-full accent-slate-800"
                      />
                    </div>
                  )}

                  {profileError && (
                    <p className="text-sm text-rose-700" role="alert">
                      {profileError}
                    </p>
                  )}

                  {/* Save / Cancel */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpload}
                      disabled={savingProfile}
                      className="flex-1 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 active:brightness-90"
                      style={{ backgroundColor: activeTheme.accent }}
                    >
                      {savingProfile ? 'Lagrer…' : 'Lagre'}
                    </button>

                    <button
                      onClick={() => {
                        setImageSrc(null);
                        setCroppedAreaPixels(null);
                        setProfileError('');
                        setEditing(false);
                      }}
                      disabled={savingProfile}
                      className="flex-1 rounded-full border border-slate-300 bg-white/60 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              </>
            )}
            {profileNotice && (
              <p
                className={`mt-5 rounded-xl px-4 py-3 text-sm ${
                  profileNotice.includes('Firestore')
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-emerald-50 text-emerald-800'
                }`}
                role="status"
              >
                {profileNotice}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Logged-out user */}
      {!user && !contextUser && !authLoading && (
        <section className="rounded-[2rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm">
          <div className="p-8 sm:p-10">
            <div className="mx-auto max-w-xl">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                  Profiltilgang
                </span>
              </div>

              <h1 className={`${roboto.className} text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl`}>
                Min Profil
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Velg hvordan du vil fortsette.
              </p>

              <div className="mt-6">
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
                  Kontotype
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('civilian')}
                    className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                      selectedRole === 'civilian'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    Kunde
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('seller')}
                    className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                      selectedRole === 'seller'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    Selger
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {selectedRole === 'seller'
                    ? 'Som selger kan du publisere produkter og motta betalinger via Stripe Connect.'
                    : 'Som kunde kan du kjøpe produkter og følge skapere.'}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={() => setAuthFlow('login')}
                  className="rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white"
                >
                  Logg inn
                </button>
                <button
                  onClick={() => setAuthFlow('register')}
                  className="rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white"
                >
                  Opprett konto
                </button>
                <GoogleSignIn role={selectedRole} />
              </div>

              {authFlow !== 'select' && (
                <button
                  onClick={() => setAuthFlow('select')}
                  className="mt-6 text-left text-xs font-medium text-slate-500 underline underline-offset-2"
                >
                  ← Velg noe annet
                </button>
              )}

              {authFlow === 'login' && (
                <div className="mt-6">
                  <SignInUser defaultRole={selectedRole} />
                </div>
              )}

              {authFlow === 'register' && (
                <div className="mt-6">
                  <RegisterUser defaultRole={selectedRole} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

        {user && (
          <section className="rounded-[2rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm">
            <div className="p-8 sm:p-10">
              <div className="mb-8 grid gap-10 xl:grid-cols-2">
                {/* Products */}
                <div>
                  <div className="mb-5 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-sky-400" />
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                      Produkter
                      <span className="rounded-full border border-slate-300 bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {displayedCreatorProducts.length}
                      </span>
                    </div>
                  </div>

                  {loadingProducts && displayedCreatorProducts.length === 0 ? (
                    <p className="text-slate-600">Laster produkter...</p>
                  ) : displayedCreatorProducts.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm text-slate-600">Ingen produkter funnet.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {displayedCreatorProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onDelete={userRole === 'seller' ? handleDeleteProduct : undefined}
                          deleting={deletingProductId === product.id}
                        />
                      ))}
                    </div>
                  )}
                  {productDeleteError && (
                    <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                      {productDeleteError}
                    </p>
                  )}
                </div>

                {/* Favorites */}
                <div>
                  <div className="mb-5 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-400" />
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                      Favoritter
                      <span className="rounded-full border border-slate-300 bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {favoriteProducts.length}
                      </span>
                    </div>
                  </div>

                  {favoriteProducts.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm text-slate-600">
                      Ingen favoritter funnet. Gå til Produkter og legg til favoritter for å vise dem her.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {favoriteProducts.map((favorite) => (
                        <ProductCard key={favorite.id} product={favorite} favorite />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {user && userRole === 'seller' && (
          <section id="seller-product-tools" className="rounded-[2rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm">
            <div className="p-8 sm:p-10">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <h2 className={`${roboto.className} text-2xl font-semibold text-slate-900`}>
                  Nytt produkt
                </h2>
              </div>
              <OnboardingNotice
                storageKey="norya_creator_tools_intro_seen"
                title="Skaperveiledning"
                buttonLabel="Klar"
                className="mb-6"
              >
                Trykk Nytt Produkt for å åpne publiseringsskjemaet. Du kan når som helst redigere eksisterende produkter fra produktkortene under.
              </OnboardingNotice>
              <UploadProductIfSignedIn />
            </div>
          </section>
        )}

        {user && userRole === 'seller' && (
          <section className="rounded-[2rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm">
            <div className="p-8 sm:p-10">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <h2 className={`${roboto.className} text-2xl font-semibold text-slate-900`}>
                  Salg og inntekter
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50/80 p-5 border border-slate-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Produkter</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{creatorProducts.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50/80 p-5 border border-slate-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Lagerverdi</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {creatorProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0).toLocaleString()} NOK
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50/80 p-5 border border-slate-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Betalinger</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">Stripe Connect</p>
                  <p className="text-xs text-slate-500 mt-1">Koble til for å motta utbetalinger</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {user && userRole === 'seller' && (
          <section className="rounded-[2rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm">
            <div className="p-8 sm:p-10">
              <PaymentInfo activeTheme={activeTheme} userRole={userRole} />
            </div>
          </section>
        )}
      </main>

      <style jsx>{`
        @keyframes glow {
          0% { transform: scale(0.82); opacity: 0; }
          25% { transform: scale(1); opacity: 0.55; }
          55% { transform: scale(1.18); opacity: 0.4; }
          100% { transform: scale(1.35); opacity: 0; }
        }

        .animate-glow {
          animation: glow 2.7s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ImageCropUploader;