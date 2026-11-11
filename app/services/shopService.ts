const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).trim().replace(/\/+$/, "");

async function request(
  path: string,
  token: string,
  options: RequestInit = {}
) {
  let cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!cleanPath.startsWith("/api/") && cleanPath !== "/api") {
    cleanPath = `/api${cleanPath}`;
  }

  const url = API_URL ? `${API_URL}${cleanPath}` : cleanPath;

  const response = await fetch(url, {
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

  // Remove one item
  removeFromCart: (token: string, cartId: string) =>
    request(`/cart/remove/${cartId}`, token, {
      method: "DELETE",
    }),

  removeCartItem: (token: string, cartId: string) =>
    request(`/cart/remove/${cartId}`, token, {
      method: "DELETE",
    }),

  // Remove everything
  clearCart: (token: string) =>
    request("/cart/remove", token, {
      method: "DELETE",
    }),

  // Place order
  addOrder: (
    token: string,
    payload: any
  ) =>
    request("/order/add", token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  placeOrder: (
    token: string,
    payload: any
  ) =>
    request("/order/add", token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Get user orders
  getMyOrders: (token: string) =>
    request("/myOrders", token),

  // Cancel order
  cancelOrder: (token: string, orderId: string) =>
    request(`/myOrders/cancel/${orderId}`, token, {
      method: "PUT",
    }),
};
