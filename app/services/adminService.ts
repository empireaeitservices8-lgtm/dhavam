const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).trim().replace(/\/+$/, "");

async function adminRequest(
  path: string,
  token: string,
  options: RequestInit = {}
) {
  if (!token) {
    throw new Error("Please log in as an admin.");
  }

  let cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!cleanPath.startsWith("/api/") && cleanPath !== "/api") {
    cleanPath = `/api${cleanPath}`;
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (
    options.body !== undefined &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  const url = API_URL ? `${API_URL}${cleanPath}` : cleanPath;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Cannot reach the backend server. Check your connection."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message ||
          data?.error ||
          `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return data;
}

export const adminService = {
  // Fetch all products
  getProducts: (token: string) =>
    adminRequest("/products", token),

  // Fetch one product
  getProduct: (token: string, id: string) =>
    adminRequest(
      `/product/${encodeURIComponent(id)}`,
      token
    ),

  // Add a product with an image
  addProduct: (token: string, formData: FormData) =>
    adminRequest("/product/add", token, {
      method: "POST",
      body: formData,
    }),

  // Update an existing product
  updateProduct: (
    token: string,
    id: string,
    formData: FormData
  ) =>
    adminRequest(
      `/product/${encodeURIComponent(id)}`,
      token,
      {
        method: "PUT",
        body: formData,
      }
    ),

  // Delete a product
  deleteProduct: (token: string, id: string) =>
    adminRequest(
      `/product/${encodeURIComponent(id)}`,
      token,
      {
        method: "DELETE",
      }
    ),

  // Fetch all orders
  getOrders: (token: string) =>
    adminRequest("/admin/orders", token),

  // Update order status
  updateOrderStatus: (
    token: string,
    id: string,
    status: "Shipped" | "Delivered"
  ) =>
    adminRequest(
      `/order/status/${encodeURIComponent(id)}`,
      token,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      }
    ),

  // Mark an order as shipped
  markOrderShipped: (token: string, id: string) =>
    adminRequest(
      `/order/status/${encodeURIComponent(id)}`,
      token,
      {
        method: "PUT",
        body: JSON.stringify({ status: "Shipped" }),
      }
    ),

  // Fetch all users / customers
  getUsers: (token: string) =>
    adminRequest("/admin/users", token),

  // Delete a user
  deleteUser: (token: string, id: string) =>
    adminRequest(
      `/admin/users/${encodeURIComponent(id)}`,
      token,
      {
        method: "DELETE",
      }
    ),
};
