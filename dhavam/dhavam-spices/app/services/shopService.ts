const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).trim().replace(/\/+$/, "");

async function request(
  path: string,
  token: string,
  options: RequestInit = {}
) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${API_URL}${cleanPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data?.message || data?.error || "Request failed"
    );
  }

  return data;
}

export const shopService = {
  // Get cart items
  getCart: (token: string) =>
    request("/cart", token),

  // Add product to cart
  addToCart: (
    token: string,
    productId: string,
    size: string
  ) =>
    request("/cart/add", token, {
      method: "POST",
      body: JSON.stringify({
        productId,
        size,
      }),
    }),

  // Increase quantity
  increment: (token: string, cartId: string) =>
    request(`/cart/increment/${cartId}`, token, {
      method: "PUT",
    }),

  // Decrease quantity
  decrement: (token: string, cartId: string) =>
    request(`/cart/decrement/${cartId}`, token, {
      method: "PUT",
    }),

  // Remove one cart item
  removeCartItem: (token: string, cartId: string) =>
    request(`/cart/remove/${cartId}`, token, {
      method: "DELETE",
    }),

  // Clear the entire cart
  clearCart: (token: string) =>
    request("/cart/remove", token, {
      method: "DELETE",
    }),

  // Place an order
  placeOrder: (
    token: string,
    order: {
      username: string;
      phone: number | string;
      items: {
        productId: string;
        productName: string;
        productImage: string;
        size: string;
        quantity: number;
      }[];
      address: string;
      paymentMethod: string;
    }
  ) =>
    request("/order/add", token, {
      method: "POST",
      body: JSON.stringify(order),
    }),
};
