'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/authContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../../firebase/firebaseConfig';

const PROFILE_THEMES = [
  { id: 'fjord', name: 'Fjordbla', accent: '#1f4a58' },
  { id: 'midnatt', name: 'Midnatt', accent: '#263248' },
];

function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('no-NO', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatCurrency(amount, currency = 'NOK') {
  if (amount === undefined || amount === null) return 'N/A';
  return `${(amount / 100).toLocaleString('no-NO')} ${currency.toUpperCase()}`;
}

export default function AdminMarketplacePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('sellers'); // 'sellers' | 'products'
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellerFilter, setSellerFilter] = useState('all'); // 'all', 'pending', 'approved'
  const [productFilter, setProductFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const getAdminHeaders = async (includeJsonContentType = false) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      throw new Error('You must be signed in to manage the marketplace.');
    }

    const idToken = await firebaseUser.getIdToken();
    return {
      ...(includeJsonContentType ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${idToken}`,
    };
  };

  // Check admin role
  useEffect(() => {
    if (user) {
      // In a real app, you'd verify admin role from user document
      // For now, we'll just check if user exists
    }
  }, [user]);

  const fetchSellers = async () => {
    try {
      const res = await fetch(`/api/admin/marketplace?type=sellers&status=${sellerFilter}`, {
        headers: await getAdminHeaders(),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch sellers.');
      }
      setSellers(json.data || []);
    } catch (err) {
      console.error('Failed to fetch sellers:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/admin/marketplace?type=products&status=${productFilter}`, {
        headers: await getAdminHeaders(),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch products.');
      }
      setProducts(json.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;

    if (activeTab === 'sellers') {
      fetchSellers();
    } else {
      fetchProducts();
    }
  }, [activeTab, sellerFilter, productFilter, authLoading, user]);

  const handleApprove = async (type, id, approved) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/marketplace', {
        method: 'PATCH',
        headers: await getAdminHeaders(true),
        body: JSON.stringify({ type, id, approved }),
      });
      const json = await res.json();
      if (json.success) {
        if (type === 'seller') {
          setSellers(sellers.map(s => s.id === id ? { ...s, approved } : s));
        } else {
          setProducts(products.map(p => p.id === id ? { ...p, approved } : p));
        }
      } else {
        alert('Failed: ' + json.error);
      }
    } catch (err) {
      console.error('Approve failed:', err);
      alert('Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async (type, ids, approved) => {
    setActionLoading('bulk');
    try {
      const res = await fetch('/api/admin/marketplace', {
        method: 'POST',
        headers: await getAdminHeaders(true),
        body: JSON.stringify({ type, ids, approved }),
      });
      const json = await res.json();
      if (json.success) {
        if (type === 'seller') {
          setSellers(sellers.map(s => ids.includes(s.id) ? { ...s, approved } : s));
        } else {
          setProducts(products.map(p => ids.includes(p.id) ? { ...p, approved } : p));
        }
      } else {
        alert('Failed: ' + json.error);
      }
    } catch (err) {
      console.error('Bulk approve failed:', err);
      alert('Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  const getSellerStatus = (seller) => {
    if (seller.approved) return { label: 'Approved', className: 'bg-green-100 text-green-800' };
    if (seller.payoutsEnabled && seller.chargesEnabled) return { label: 'Ready for Review', className: 'bg-yellow-100 text-yellow-800' };
    if (seller.detailsSubmitted) return { label: 'KYC Submitted', className: 'bg-blue-100 text-blue-800' };
    return { label: 'Onboarding Incomplete', className: 'bg-gray-100 text-gray-800' };
  };

  const getProductStatus = (product) => {
    if (product.notPublic) return { label: 'Inactive', className: 'bg-slate-100 text-slate-700' };
    if (product.approved) return { label: 'Approved', className: 'bg-green-100 text-green-800' };
    return { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800' };
  };

  const handleProductVisibility = async (product, notPublic) => {
    setActionLoading(product.id);
    try {
      const res = await fetch('/api/admin/marketplace', {
        method: 'PATCH',
        headers: await getAdminHeaders(true),
        body: JSON.stringify({ type: 'product', id: product.id, notPublic }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to update product visibility.');
      }
      setProducts((current) => {
        if (productFilter === 'inactive' && !notPublic) {
          return current.filter((item) => item.id !== product.id);
        }
        return current.map((item) => item.id === product.id ? { ...item, notPublic } : item);
      });
    } catch (err) {
      console.error('Failed to update product visibility:', err);
      alert(err.message || 'Failed to update product visibility.');
    } finally {
      setActionLoading(null);
    }
  };

  const [selectedSellers, setSelectedSellers] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const toggleSellerSelection = (id) => {
    setSelectedSellers(prev => prev.includes(id) 
      ? prev.filter(s => s !== id) 
      : [...prev, id]);
  };

  const toggleProductSelection = (id) => {
    setSelectedProducts(prev => prev.includes(id) 
      ? prev.filter(p => p !== id) 
      : [...prev, id]);
  };

  const toggleAllSellers = () => {
    if (selectedSellers.length === sellers.length) {
      setSelectedSellers([]);
    } else {
      setSelectedSellers(sellers.map(s => s.id));
    }
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Access Required</h1>
          <p className="mt-2 text-gray-600">Please log in as an admin to access this page.</p>
          <Link href="/profile" className="mt-4 inline-block text-blue-600 hover:underline">
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Marketplace Admin</h1>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Site
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex gap-8" aria-label="Admin tabs">
            <button
              onClick={() => { setActiveTab('sellers'); setSelectedSellers([]); }}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sellers' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sellers ({sellers.length})
            </button>
            <button
              onClick={() => { setActiveTab('products'); setSelectedProducts([]); }}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Products ({products.length})
            </button>
          </nav>
        </div>

        {activeTab === 'sellers' && (
          <div>
            {/* Seller Filters */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-2">
                {['all', 'pending', 'approved'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => { setSellerFilter(filter); setSelectedSellers([]); }}
                    className={`px-3 py-1.5 text-sm rounded-md transition ${
                      sellerFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              
              {selectedSellers.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {selectedSellers.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkApprove('seller', selectedSellers, true)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleBulkApprove('seller', selectedSellers, false)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>

            {/* Sellers Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {sellers.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No sellers found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedSellers.length === sellers.length && sellers.length > 0}
                            onChange={toggleAllSellers}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seller
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stripe Account
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          KYC
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sellers.map(seller => {
                        const status = getSellerStatus(seller);
                        return (
                          <tr key={seller.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selectedSellers.includes(seller.id)}
                                onChange={() => toggleSellerSelection(seller.id)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{seller.businessName || 'Unnamed Business'}</p>
                                <p className="text-sm text-gray-500">{seller.email}</p>
                                <p className="text-xs text-gray-400">User ID: {seller.userId?.slice(0, 8)}...</p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-mono text-sm text-gray-900">{seller.stripeAccountId}</p>
                              <p className="text-xs text-gray-500">{seller.country?.toUpperCase()}</p>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${seller.chargesEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                                  <span>Charges: {seller.chargesEnabled ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${seller.payoutsEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                                  <span>Payouts: {seller.payoutsEnabled ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${seller.detailsSubmitted ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                  <span>Details: {seller.detailsSubmitted ? 'Submitted' : 'Pending'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {formatDate(seller.createdAt)}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {seller.approved ? (
                                  <button
                                    onClick={() => handleApprove('seller', seller.id, false)}
                                    disabled={actionLoading === seller.id}
                                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                                  >
                                    Revoke
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleApprove('seller', seller.id, true)}
                                    disabled={actionLoading === seller.id || !seller.chargesEnabled || !seller.payoutsEnabled}
                                    className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                )}
                                {seller.rejectionReason && (
                                  <span className="text-xs text-red-600" title={seller.rejectionReason}>
                                    Rejected
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            {/* Product Filters */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex gap-2">
                {['all', 'pending', 'approved', 'inactive'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => { setProductFilter(filter); setSelectedProducts([]); }}
                    className={`px-3 py-1.5 text-sm rounded-md transition ${
                      productFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              
              {selectedProducts.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {selectedProducts.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkApprove('product', selectedProducts, true)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleBulkApprove('product', selectedProducts, false)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {products.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No products found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedProducts.length === products.length && products.length > 0}
                            onChange={toggleAllProducts}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seller
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map(product => {
                        const status = getProductStatus(product);
                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => toggleProductSelection(product.id)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={product.images?.[0] || '/placeholder.jpg'} 
                                  alt={product.name} 
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="font-medium text-gray-900 truncate max-w-xs">{product.title || product.name}</p>
                                  <p className="text-xs text-gray-500 font-mono">{product.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-mono text-sm text-gray-900">{product.sellerId?.slice(0, 12)}...</p>
                              <p className="text-xs text-gray-500">{product.sellerAccountId?.slice(0, 12)}...</p>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {formatCurrency(product.price, product.currency)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {product.category || '—'}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {product.stock !== undefined ? product.stock : '—'}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {product.approved ? (
                                  <button
                                    onClick={() => handleApprove('product', product.id, false)}
                                    disabled={actionLoading === product.id}
                                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                                  >
                                    Revoke
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleApprove('product', product.id, true)}
                                    disabled={actionLoading === product.id}
                                    className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                )}
                                {product.notPublic ? (
                                  <button
                                    onClick={() => handleProductVisibility(product, false)}
                                    disabled={actionLoading === product.id}
                                    className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 disabled:opacity-50"
                                  >
                                    Restore
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleProductVisibility(product, true)}
                                    disabled={actionLoading === product.id}
                                    className="px-3 py-1.5 text-sm bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 disabled:opacity-50"
                                  >
                                    Hide
                                  </button>
                                )}
                                {product.rejectionReason && (
                                  <span className="text-xs text-red-600" title={product.rejectionReason}>
                                    Rejected
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}