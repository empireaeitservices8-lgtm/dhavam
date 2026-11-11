
import { apiRequest } from "./api";

// Public: anyone can view products
export function getProducts() {
  return apiRequest("/products", {
    method: "GET",
  });
}

// Get one product
export function getProductById(
  id: string,
  token?: string
) {
  return apiRequest(`/product/${id}`, {
    method: "GET",
    ...(token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {}),
  });
}

// Admin: add a product
export function addProduct(
  formData: FormData,
  token: string
) {
  return apiRequest("/product/add", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

// Admin: update a product
export function updateProduct(
  id: string,
  formData: FormData,
  token: string
) {
  return apiRequest(`/product/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}
