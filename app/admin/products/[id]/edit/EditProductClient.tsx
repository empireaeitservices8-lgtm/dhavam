
"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Save,
  Plus,
  Trash2,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).trim().replace(/\/+$/, "");

type ProductSize = {
  size: string;
  price: number | string;
};

type Product = {
  id?: string | number;
  _id?: string | number;
  name: string;
  description: string;
  group?: string;
  image?: string;
  imageUrl?: string;
  sizes?: ProductSize[] | string[] | string;
};

function parseSizes(value: Product["sizes"]): ProductSize[] {
  if (!value) return [];

  let parsed: unknown = value;

  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((size) => ({ size, price: "" }));
    }
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.map((item) => {
    if (typeof item === "string") {
      return { size: item, price: "" };
    }

    return {
      size: String(item?.size ?? ""),
      price: item?.price ?? "",
    };
  });
}

function getImageUrl(image: string): string {
  if (!image) return "";

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_URL}${image}`;
  }

  if (image.startsWith("uploads/")) {
    return `${API_URL}/${image}`;
  }

  return `${API_URL}/uploads/${image}`;
}

export default function EditProductClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [group, setGroup] = useState("whole");

  const [sizes, setSizes] = useState<ProductSize[]>([]);

  const [existingImage, setExistingImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in as an admin.");
      }

      const response = await fetch(
        `${API_URL}/api/product/${encodeURIComponent(String(productId))}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          `Unable to load product. Status: ${response.status}`
        );
      }

      const product: Product =
        data?.product ?? data?.data ?? data;

      const id = product?.id ?? product?._id;

      if (id === undefined || id === null || id === "") {
        console.error("Invalid product response:", data);
        throw new Error("Product details were not found.");
      }

      setName(product.name ?? "");
      setDescription(product.description ?? "");
      const productGroup =
        (product.group ?? (product as any).category ?? "WHOLE")
          .toString()
          .toLowerCase()
          .trim();

      setGroup(
        ["whole", "ground", "combo"].includes(productGroup)
          ? productGroup
          : "whole"
      ); setSizes(parseSizes(product.sizes));
      setExistingImage(product.imageUrl ?? product.image ?? "");
    } catch (err) {
      console.error("Load product error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load product."
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  // Add a new size-price row.
  const addSize = () => {
    setSizes((previous) => [
      ...previous,
      { size: "", price: "" },
    ]);
  };

  // Update a size or its price.
  const updateSize = (
    index: number,
    field: keyof ProductSize,
    value: string
  ) => {
    setSizes((previous) =>
      previous.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // Remove a size-price row.
  const removeSize = (index: number) => {
    setSizes((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in as an admin.");
      }

      if (sizes.length === 0) {
        throw new Error("Please add at least one product size.");
      }

      const validSizes = sizes.map((item) => ({
        size: item.size.trim(),
        price: Number(item.price),
      }));

      const invalidSize = validSizes.some(
        (item) =>
          !item.size ||
          item.price === undefined ||
          item.price === null ||
          String(item.price).trim() === "" ||
          !Number.isFinite(item.price) ||
          item.price < 0
      );

      if (invalidSize) {
        throw new Error(
          "Please enter a valid size and price for every row."
        );
      }

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("group", group);
      formData.append("sizes", JSON.stringify(validSizes));

      // Only send a new file when the admin selects one.
      // The backend should retain the old image otherwise.
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(
        `${API_URL}/api/product/${encodeURIComponent(String(productId))}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          "Failed to update product."
        );
      }

      setSuccess("Product updated successfully.");

      router.replace("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("Update product error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full min-w-0 rounded-xl border border-[#dfe3d0] bg-white px-4 py-3 text-sm text-[#2f381b] outline-none transition placeholder:text-gray-400 focus:border-[#687746] focus:ring-2 focus:ring-[#687746]/15";

  const labelClass =
    "block text-sm font-semibold text-[#2f381b]";

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-[#3f4a24]" />
        <p className="text-sm text-[#566049]">
          Loading product details...
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl">
      {/* Heading */}
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#566049] transition hover:text-[#9a432a]"
        >
          <ArrowLeft size={17} />
          Back to products
        </Link>

        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a432a]">
            Product management
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#2f381b] sm:text-3xl">
            Edit Product
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#566049] sm:text-base">
            Update product details, sizes, prices, or image.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-[#e3e8dc] bg-white shadow-sm"
      >
        <div className="space-y-6 p-4 sm:p-6 md:p-8">

          {/* Product name */}
          <div>
            <label htmlFor="product-name" className={labelClass}>
              Product name
            </label>

            <input
              id="product-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              placeholder="Enter product name"
              required
              maxLength={150}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              className={inputClass}
              placeholder="Describe your product"
              rows={5}
              required
            />
          </div>

          {/* Product group */}
          <div>
            <label htmlFor="group" className={labelClass}>
              Product group
            </label>

            <select
              id="group"
              value={group}
              onChange={(event) => setGroup(event.target.value)}
              className={inputClass}
              required
            >
              <option value="whole">Whole Spices</option>
              <option value="ground">Ground Spices</option>
              <option value="combo">Combo Pack</option>
            </select>
          </div>

          {/* Sizes and prices */}
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <label className={labelClass}>
                  Available sizes and prices
                </label>
                <p className="mt-1 text-xs text-[#7a8470]">
                  Edit existing prices or add new size options.
                </p>
              </div>

              <button
                type="button"
                onClick={addSize}
                className="inline-flex items-center gap-2 rounded-full bg-[#3f4a24] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f381b]"
              >
                <Plus size={16} />
                Add size
              </button>
            </div>

            {sizes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#dfe3d0] p-6 text-center">
                <p className="text-sm text-[#7a8470]">
                  No sizes added yet.
                </p>

                <button
                  type="button"
                  onClick={addSize}
                  className="mt-3 text-sm font-semibold text-[#3f4a24] hover:underline"
                >
                  + Add your first size
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sizes.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-3 rounded-xl border border-[#dfe3d0] bg-[#fafbf8] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                  >
                    <div>
                      <label
                        htmlFor={`size-${index}`}
                        className={labelClass}
                      >
                        Size
                      </label>

                      <input
                        id={`size-${index}`}
                        value={item.size}
                        onChange={(event) =>
                          updateSize(
                            index,
                            "size",
                            event.target.value
                          )
                        }
                        placeholder="e.g. 100g"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`price-${index}`}
                        className={labelClass}
                      >
                        Price (₹)
                      </label>

                      <input
                        id={`price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(event) =>
                          updateSize(
                            index,
                            "price",
                            event.target.value
                          )
                        }
                        placeholder="Enter price"
                        className={inputClass}
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      aria-label={`Remove size ${item.size || index + 1}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product image */}
          <div>
            <label className={labelClass}>
              Product image
            </label>

            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
              <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden rounded-xl border border-[#e3e8dc] bg-[#f7f8f3] p-3">
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="New product preview"
                    className="max-h-52 w-full object-contain"
                  />
                ) : existingImage ? (
                  <Image
                    src={getImageUrl(existingImage)}
                    alt={name || "Current product image"}
                    width={240}
                    height={240}
                    unoptimized
                    className="max-h-52 w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#7a8470]">
                    <ImagePlus size={30} />
                    <span className="text-xs">
                      No image available
                    </span>
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-col items-start justify-center">
                <p className="break-all text-sm font-medium text-[#2f381b]">
                  {imageFile
                    ? imageFile.name
                    : "Current product image"}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#7a8470]">
                  Choose a new image only if you want to replace
                  the existing one. Otherwise, the current image
                  will be kept.
                </p>

                <label
                  htmlFor="product-image"
                  className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#dfe3d0] px-4 py-2 text-sm font-semibold text-[#3f4a24] transition hover:bg-[#f4f6ee]"
                >
                  <ImagePlus size={17} />
                  Choose image
                </label>

                <input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      setImageFile(file);
                    }
                  }}
                />

                {imageFile && (
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="mt-3 text-sm font-medium text-[#9a432a] hover:underline"
                  >
                    Keep current image instead
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-[#edf0e4] bg-[#fafbf8] p-4 sm:flex-row sm:items-center sm:justify-end sm:px-8 sm:py-5">
          <Link
            href="/admin/products"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#dfe3d0] bg-white px-6 py-3 text-sm font-semibold text-[#566049] transition hover:bg-[#f4f6ee]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#3f4a24] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2f381b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Saving changes...
              </>
            ) : (
              <>
                <Save size={17} />
                Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
