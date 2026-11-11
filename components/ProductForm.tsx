
"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { api } from "@/lib/axios";
import { GROUPS } from "@/lib/products";
import axios from "axios";

const label =
  "mb-1.5 block text-sm font-medium text-[#2f381b]";

const input =
  "w-full rounded-xl border border-[#cfd5bf] bg-white px-4 py-3 text-[#20261f] placeholder:text-[#9aa28c] focus:outline-none focus:ring-4 focus:ring-[#9a432a]/20";

type ProductSize = {
  size: string;
  price: string;
};

type FormData = {
  name: string;
  group: string;
  description: string;
  sizes: ProductSize[];
};

const createInitialForm = (): FormData => ({
  name: "",
  group: GROUPS[0]?.id ?? "whole",
  description: "",
  sizes: [{ size: "", price: "" }],
});

export default function ProductForm() {
  const [f, setF] = useState<FormData>(createInitialForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Image preview
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Update normal product fields
  function updateField(
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setF((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSaved(false);
  }

  // Update size or price
  function updateSizeField(
    index: number,
    field: "size" | "price",
    value: string
  ) {
    setF((previous) => ({
      ...previous,
      sizes: previous.sizes.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      ),
    }));

    setError("");
    setSaved(false);
  }

  // Add another size-price row
  function addSizeRow() {
    setF((previous) => ({
      ...previous,
      sizes: [
        ...previous.sizes,
        { size: "", price: "" },
      ],
    }));

    setError("");
    setSaved(false);
  }

  // Remove a size-price row
  function removeSizeRow(index: number) {
    setF((previous) => ({
      ...previous,
      sizes: previous.sizes.filter(
        (_, i) => i !== index
      ),
    }));

    setError("");
    setSaved(false);
  }

  // Select and validate product image
  function selectImage(selectedFile?: File) {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

      if (selectedFile.size > 2 * 1024 * 1024) { setError("Image size must be less than 2 MB."); return; }

    setFile(selectedFile);
    setError("");
    setSaved(false);
  }

  // Submit product
  async function onSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (saving) return;

    if (!f.name.trim()) {
      setError("Please enter the product name.");
      return;
    }
    if (!f.description.trim()) {
  setError("Please enter a product description.");
  return;
}

    if (!f.group) {
      setError("Please select a product group.");
      return;
    }

    if (!f.sizes.length) {
      setError("Please add at least one pack size.");
      return;
    }

    const invalidSize = f.sizes.some(
      (item) =>
        !item.size.trim() ||
        !item.price.trim() ||
        !Number.isFinite(Number(item.price)) ||
        Number(item.price) <= 0
    );

    if (invalidSize) {
      setError(
        "Enter a valid size and a price greater than zero for every row."
      );
      return;
    }

    const duplicateSizes =
      f.sizes.some(
        (item, index) =>
          f.sizes.findIndex(
            (other) =>
              other.size.trim().toLowerCase() ===
              item.size.trim().toLowerCase()
          ) !== index
      );

    if (duplicateSizes) {
      setError("Please remove duplicate pack sizes.");
      return;
    }

    if (!file) {
      setError("Please select a product image.");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const body = new globalThis.FormData();

      body.append("name", f.name.trim());
      body.append("description", f.description.trim());
      body.append("group", f.group);

      const cleanedSizes = f.sizes.map((item) => ({
        size: item.size.trim(),
        price: Number(item.price),
      }));

      body.append(
        "sizes",
        JSON.stringify(cleanedSizes)
      );

      body.append("image", file);

      await api.post("/product/add", body);

      setF(createInitialForm());
      setFile(null);
      setSaved(true);
    } catch (err: unknown) {
      console.error("Add product API error:", err);

      if (axios.isAxiosError(err)) {
        console.error(
          "Response:",
          err.response?.data
        );

        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unable to save product."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to save product."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-5 rounded-2xl border border-[#e3e8dc] bg-white p-6 sm:p-8"
      >
        <div>
          <h2 className="text-xl font-bold text-[#2f381b]">
            Add a new product
          </h2>

          <p className="mt-1 text-sm text-[#7a8470]">
            Enter product details and add available pack
            sizes with their prices.
          </p>
        </div>

        {/* Product image */}
        <div>
          <label
            htmlFor="product-image"
            className={label}
          >
            Product image
          </label>

          <div className="relative flex min-h-44 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#cfd5bf] bg-[#f4f6ee]">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Product preview"
                className="h-44 w-full object-contain p-2"
              />
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="font-semibold text-[#9a432a]">
                  Choose a product photo
                </p>

                <p className="mt-1 text-xs text-[#7a8470]">
                  JPG, PNG, WEBP · Maximum 5 MB
                </p>
              </div>
            )}

            <input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={(e) =>
                selectImage(e.target.files?.[0])
              }
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>

          {file && (
            <p className="mt-2 text-xs text-[#566049]">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* Product name */}
        <div>
          <label htmlFor="name" className={label}>
            Product name
          </label>

          <input
            id="name"
            name="name"
            value={f.name}
            onChange={updateField}
            placeholder="Cardamom Powder"
            maxLength={100}
            className={input}
          />
        </div>

        {/* Product group */}
        <div>
          <label htmlFor="group" className={label}>
            Product group
          </label>

          <select
            id="group"
            name="group"
            value={f.group}
            onChange={updateField}
            className={input}
          >
            {GROUPS.map((group) => (
              <option
                key={group.id}
                value={group.id}
              >
                {group.title}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic size and price rows */}
        <fieldset>
          <legend className={label}>
            Available pack sizes and prices
          </legend>

          <p className="mb-4 text-xs text-[#7a8470]">
            Add different pack sizes and set an individual
            price for each size.
          </p>

          <div className="space-y-3">
            {f.sizes.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#dfe3d0] bg-[#f8f9f5] p-3"
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <div>
                    <label
                      htmlFor={`size-${index}`}
                      className="mb-1 block text-xs font-medium text-[#566049]"
                    >
                      Pack size
                    </label>

                    <input
                      id={`size-${index}`}
                      type="text"
                      value={item.size}
                      onChange={(e) =>
                        updateSizeField(
                          index,
                          "size",
                          e.target.value
                        )
                      }
                      placeholder="50 g"
                      className={input}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`price-${index}`}
                      className="mb-1 block text-xs font-medium text-[#566049]"
                    >
                      Price (₹)
                    </label>

                    <input
                      id={`price-${index}`}
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.price}
                      onChange={(e) =>
                        updateSizeField(
                          index,
                          "price",
                          e.target.value
                        )
                      }
                      placeholder="100"
                      className={input}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSizeRow(index)}
                    disabled={f.sizes.length === 1}
                    className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSizeRow}
            className="mt-4 rounded-full border border-[#3f4a24] px-5 py-2.5 text-sm font-semibold text-[#3f4a24] transition hover:bg-[#f3f5ed]"
          >
            + Add another size
          </button>
        </fieldset>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className={label}
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={f.description}
            onChange={updateField}
            rows={4}
            maxLength={500}
            placeholder="Describe the freshness, aroma, and quality of this spice."
            className={input}
          />

          <p className="mt-1 text-right text-xs text-[#7a8470]">
            {f.description.length}/500
          </p>
        </div>

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {/* Success */}
        {saved && (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-900"
          >
            <p className="font-bold text-green-800">
              ✓ Product added successfully!
            </p>
            <p className="mt-1 text-sm text-green-700">
              The product is now live on the store and visible in the products list.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/admin/products"
                className="inline-flex items-center rounded-full bg-[#3f4a24] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2f381b]"
              >
                View in Products List →
              </Link>
              <button
                type="button"
                onClick={() => setSaved(false)}
                className="inline-flex items-center rounded-full border border-[#3f4a24] px-4 py-2 text-xs font-semibold text-[#3f4a24] hover:bg-[#f3f5ed]"
              >
                + Add Another Product
              </button>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-[#3f4a24] px-6 py-3.5 font-semibold text-white transition hover:bg-[#2f381b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving product..." : "Save product"}
        </button>
      </form>

      {/* Live preview */}
      <aside className="xl:sticky xl:top-8 xl:self-start">
        <p className="mb-3 text-sm font-medium text-[#566049]">
          Product preview
        </p>

        <div className="overflow-hidden rounded-3xl border border-[#e3e8dc] bg-white shadow-lg">
          <div className="flex aspect-square items-center justify-center bg-[#e6ebdc]">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <p className="text-sm text-[#7a8470]">
                Product image
              </p>
            )}
          </div>

          <div className="p-5">
            <h3 className="text-lg font-bold text-[#2f381b]">
              {f.name || "Product name"}
            </h3>

            <p className="mt-2 whitespace-pre-wrap text-sm text-[#566049]">
              {f.description || "Product description"}
            </p>

            <p className="mt-4 text-sm font-semibold text-[#2f381b]">
              Available sizes
            </p>

            <div className="mt-2 space-y-2">
              {f.sizes.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-[#dfe3d0] bg-[#f4f6ee] px-3 py-2 text-sm"
                >
                  <span className="text-[#2f381b]">
                    {item.size || "Pack size"}
                  </span>

                  <span className="font-semibold text-[#3f4a24]">
                    {item.price
                      ? `₹${item.price}`
                      : "Price"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
