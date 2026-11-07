"use client";

import { useState, useEffect, useRef } from "react";
import { storage, auth } from "../../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuid } from "uuid";
require("dotenv").config();
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useAuth } from "../auth/authContext";
import OnboardingNotice from "../components/OnboardingNotice";

export default function PostProduct(productValue) {
  const paramsId = useParams().id;
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");
  const router = useRouter();
  const { user } = useAuth(); // ✅ Get current logged-in user

  // determine if we're in edit mode (must have both param and id)
  const isEditing = editParam === "true" && !!paramsId;

  const [product, setProduct] = useState({
    name: productValue?.currentProduct?.name || "",
    description: productValue?.currentProduct?.description || "",
    price: productValue?.currentProduct?.price || "",
    images: productValue?.currentProduct?.images || [],
    id: "",
  });

  const [updateProduct, setUpdateProduct] = useState({
    name: productValue?.currentProduct?.name || "",
    description: productValue?.currentProduct?.description || "",
    price: productValue?.currentProduct?.price || "",
    images: [],
    id: "",
  });

  const [deletedProduct, setDeletedProduct] = useState({});
  const [newFiles, setNewFiles] = useState([]);
  const [files, setFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [uploadNow, setUploadNow] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [productError, setProductError] = useState('');
  const imageInputRef = useRef(null);

  // ✅ New: track successful upload for new products
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // for fade in/out

  useEffect(() => {
    setProduct((prev) => ({ ...prev, id: paramsId }));
    setUpdateProduct((prev) => ({ ...prev, id: paramsId }));
  }, [paramsId]);

  // clear any residual data when switching into "new product" mode
  useEffect(() => {
    if (!isEditing) {
      setProduct({ name: "", description: "", price: "", images: [], id: "" });
      setFiles([]);
      setDeletedFiles([]);
      setNewFiles([]);
      setUploadSuccess(false);
      setShowSuccess(false);
    }
  }, [isEditing]);

  const getStoragePathFromUrl = (url) => {
    const baseUrl = "https://firebasestorage.googleapis.com/v0/b/norland-a7730.appspot.com/o/";
    if (url.includes(baseUrl)) {
      return decodeURIComponent(url.split(baseUrl)[1].split("?")[0]);
    }
    return null;
  };
const uploadFilesToFirebase = async () => {
  if (!user) {
    throw new Error("Must be signed in to upload images.");
  }

  // DELETE FILES FIRST
  if (deletedFiles.deletedFiles?.length > 0) {
    const deletePromises = deletedFiles.deletedFiles.map(async (file) => {
      try {
        const imagePath = getStoragePathFromUrl(file.image);
        if (!imagePath) throw new Error("Invalid Firebase image URL");
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    });

    await Promise.all(deletePromises);
  }

  // UPLOAD NEW FILES
  const uploadPromises = files.map(async ({ file }) => {
    const ext = file.name.split(".").pop();
    const filePath = `products/${uuid()}.${ext}`;
    const imageRef = ref(storage, filePath);

    const metadata = {
      customMetadata: {
        owner: user.uid,
      },
    };

    try {
      const snapshot = await uploadBytes(imageRef, file, metadata);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error(`Product image upload failed for ${filePath}:`, error);
      return null;
    }
  });

  const results = await Promise.all(uploadPromises);
  const validResults = results.filter((url) => url);

  setProduct((prev) => ({
    ...prev,
    images: [
      ...(prev.images || []).filter((url) => !url.startsWith("blob:")),
      ...validResults,
    ],
  }));

  setFiles([]);
  return validResults;
};

  const uploadFilesToStripe = async (uploadedImageUrls = [], pendingProductId = null) => {
    // build final images array; keep existing urls unless explicitly deleted
    const realImages = [
      ...(product.images || []).filter((url) => !url.startsWith("blob:")),
      ...uploadedImageUrls,
    ];

    // choose the correct backend route; treat as edit only when we actually
    // have an id (fixes case where ?edit=true lingers on profile page).
    const endpoint = isEditing ? "/api/products/updateProduct" : "/api/products";

    // require at least one image for *new* products
    if (!isEditing && realImages.length === 0) {
      throw new Error("Legg til minst ett bilde før du publiserer produktet.");
    }

    // ✅ Include user info as metadata
    const creatorData = {
      creatorId: user?.uid || "anonymous",
      creatorEmail: user?.email || "unknown",
    };

    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...product,
        images: realImages,
        metadata: creatorData, // ✅ Pass to API
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Produktet kunne ikke lagres.");
    }

    if (!data.product?.id) {
      throw new Error("Produktet ble ikke returnert etter lagring.");
    }

    const savedProduct = {
      id: data.product?.id,
      name: data.product?.name || product.name,
      description: data.product?.description || product.description,
      images: realImages,
      price: data.price?.unit_amount != null
        ? data.price.unit_amount / 100
        : Number(product.price),
      currency: data.price?.currency || "nok",
      approved: false,
      metadata: {
        ...creatorData,
        ...(data.product?.metadata || {}),
      },
    };

    if (!isEditing) {
      productValue?.onProductCreated?.(savedProduct, pendingProductId);
    }

    setProduct((prev) => ({
      ...prev,
      images: realImages,
    }));

    if (isEditing) {
      router.replace(`/products/${paramsId}`);
    } else {
      // ✅ Only for new product: show fade-in/out success circle and reset form
      setUploadSuccess(true);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 1800);
      setTimeout(() => {
        setUploadSuccess(false);
        setProduct({
          name: "",
          description: "",
          price: "",
          images: [],
          id: "",
        });
        setFiles([]);
        setDeletedFiles([]);
        setUpdateProduct({
          name: "",
          description: "",
          price: "",
          images: [],
          id: "",
        });
      }, 2000);
    }
    return savedProduct;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) return;

    setIsUploading(true);
    setProductError('');
    const previewUrlsToRevoke = files.map(({ previewUrl }) => previewUrl);
    let pendingProductId = null;
    try {
      if (!user) {
        throw new Error("Du må være logget inn før du kan publisere et produkt.");
      }

      if (!isEditing) {
        pendingProductId = `pending-${uuid()}`;
        productValue?.onProductPending?.({
          id: pendingProductId,
          name: product.name,
          description: product.description,
          images: product.images || [],
          price: Number(product.price),
          currency: "nok",
          isPendingUpload: true,
        });
      }

      const shouldUploadOrDeleteImages =
        files.length > 0 || deletedFiles?.deletedFiles?.length > 0;
      const uploadedImageUrls = shouldUploadOrDeleteImages
        ? await uploadFilesToFirebase()
        : [];
      const savedProduct = await uploadFilesToStripe(uploadedImageUrls, pendingProductId);
      if (!isEditing && !savedProduct?.id) {
        throw new Error("Produktet ble ikke returnert etter lagring.");
      }
    } catch (err) {
      if (pendingProductId) {
        productValue?.onProductFailed?.(pendingProductId);
      }
      console.error("Failed to upload product", err);
      setProductError(err.message || "Noe gikk galt ved opplasting. Prøv igjen.");
    } finally {
      previewUrlsToRevoke.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      setIsUploading(false);
    }
  };

  const onChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newImageFiles = selectedFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
      setProduct((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newImageFiles.map(({ previewUrl }) => previewUrl)],
      }));
      e.target.value = "";
    }
  };

  const removeImage = ({ image, index }) => {
    if (image.startsWith("blob:")) {
      URL.revokeObjectURL(image);
      setFiles((prev) => prev.filter(({ previewUrl }) => previewUrl !== image));
    } else {
      setDeletedFiles((prevFiles) => {
        const deletedFilesArray = prevFiles?.deletedFiles ?? [];
        return {
          ...prevFiles,
          deletedFiles: [...deletedFilesArray, { image }],
        };
      });
    }

    setProduct((prevProduct) => ({
      ...prevProduct,
      images: (prevProduct.images || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      {/* ✅ Success Indicator with Fade In/Out */}
      {uploadSuccess && (
        <div
          className={`fixed top-4 right-4 flex items-center space-x-2 z-50 transition-opacity duration-500 ${
            showSuccess ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#001F54] animate-pulse"></div>
          <span className="text-[#001F54] font-semibold">Produktet er sendt til godkjenning</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl w-full mx-auto bg-white p-8 rounded-xl shadow-md"
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {productValue?.currentProduct ? "Rediger produkt" : "Legg til nytt produkt"}
        </h2>

        <OnboardingNotice
          storageKey="norya_seller_upload_intro_seen"
          title="Klar til å selge?"
          buttonLabel="Skjønner"
          className="mb-5"
        >
            Fyll inn navn, beskrivelse, pris og bilder. Produktet vises for kunder etter at NORYA har godkjent det og Stripe Connect-kontoen din er aktiv.
        </OnboardingNotice>

        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-800">
          <p className="font-semibold text-slate-900">Sjekkliste før publisering</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Bruk tydelige bilder med godt lys.</li>
            <li>Skriv hva produktet er laget av og eventuelle mål.</li>
            <li>Legg inn riktig pris i NOK.</li>
          </ul>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produktnavn
            </label>
            <input
              type="text"
              name="name"
              placeholder="Skriv inn produktnavn"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beskrivelse
            </label>
            <textarea
              name="description"
              placeholder="Skriv en kort beskrivelse"
              value={product.description}
              onChange={(e) =>
                setProduct({ ...product, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pris
            </label>
            <input
              type="text"
              name="price"
              placeholder="f.eks. 199,99"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produktbilder
            </label>
            <input
              ref={imageInputRef}
              type="file"
              name="image"
              accept="image/*"
              onChange={onChange}
              multiple
              className="hidden"
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {product?.images?.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Produkt ${index}`}
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeImage({ image, index });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow"
                  >
                    ✖
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                aria-label={product?.images?.length ? "Legg til flere produktbilder" : "Velg produktbilder"}
                className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-4xl font-light text-slate-500 transition hover:border-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className={`w-full py-3 text-white text-lg font-medium rounded-lg transition duration-300 ${
              isUploading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUploading ? "Laster opp..." : productValue?.currentProduct ? "Oppdater produkt" : "Publiser produkt"}
          </button>
          {productError && (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {productError}
            </p>
          )}
          {isUploading && (
            <div className="mt-2 text-sm text-blue-600 font-medium">Laster opp bilder og lagrer produkt, dette kan ta 10-20 sekunder...</div>
          )}
        </div>
      </form>
    </>
  );
}
