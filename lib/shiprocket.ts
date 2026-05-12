/**
 * Thin server-side Shiprocket REST client.
 * Docs: https://apidocs.shiprocket.in/
 *
 * The auth token is cached in-process for ~9 days (tokens are valid for 10).
 * Each call grabs a fresh token if the cached one is missing or stale.
 */

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

interface AuthResponse {
  token: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function fetchToken(email: string, password: string): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }

  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `Shiprocket auth failed (${res.status}): ${err.slice(0, 200)}`
    );
  }

  const data = (await res.json()) as AuthResponse;
  if (!data.token) throw new Error("Shiprocket auth: no token returned");

  cachedToken = {
    token: data.token,
    expiresAt: now + 9 * 24 * 60 * 60 * 1000,
  };
  return data.token;
}

export function clearShiprocketTokenCache() {
  cachedToken = null;
}

interface ApiOptions {
  method?: "GET" | "POST";
  body?: unknown;
}

async function callShiprocket<T>(
  email: string,
  password: string,
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const token = await fetchToken(email, password);
  const res = await fetch(`${SHIPROCKET_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  // Token expired? clear cache and retry once.
  if (res.status === 401 || res.status === 403) {
    clearShiprocketTokenCache();
    const fresh = await fetchToken(email, password);
    const retry = await fetch(`${SHIPROCKET_BASE}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${fresh}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
    if (!retry.ok) {
      const text = await retry.text();
      throw new Error(`Shiprocket ${path} (${retry.status}): ${text.slice(0, 300)}`);
    }
    return retry.json() as Promise<T>;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket ${path} (${res.status}): ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

export interface CreateOrderInput {
  orderId: string;
  orderDate: Date;
  pickupLocation: string;
  paymentMethod: "Prepaid" | "COD";
  subTotal: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  items: Array<{
    name: string;
    sku: string;
    units: number;
    sellingPrice: number;
  }>;
  /** Default package dimensions (cm) and weight (kg) */
  package?: {
    length?: number;
    breadth?: number;
    height?: number;
    weight?: number;
  };
}

export interface CreateOrderResponse {
  order_id?: number;
  shipment_id?: number;
  status?: string;
  status_code?: number;
  awb_code?: string;
  courier_company_id?: number;
  courier_name?: string;
}

export async function shiprocketCreateOrder(
  email: string,
  password: string,
  input: CreateOrderInput
): Promise<CreateOrderResponse> {
  const [firstName, ...rest] = input.customer.name.split(" ");
  const lastName = rest.join(" ") || firstName;

  const orderDate = `${input.orderDate.getFullYear()}-${String(
    input.orderDate.getMonth() + 1
  ).padStart(2, "0")}-${String(input.orderDate.getDate()).padStart(
    2,
    "0"
  )} ${String(input.orderDate.getHours()).padStart(2, "0")}:${String(
    input.orderDate.getMinutes()
  ).padStart(2, "0")}`;

  const pkg = input.package ?? {};

  const payload = {
    order_id: input.orderId,
    order_date: orderDate,
    pickup_location: input.pickupLocation,
    billing_customer_name: firstName || "Customer",
    billing_last_name: lastName,
    billing_address: input.customer.addressLine1,
    billing_address_2: input.customer.addressLine2 ?? "",
    billing_city: input.customer.city,
    billing_pincode: input.customer.pincode,
    billing_state: input.customer.state,
    billing_country: input.customer.country ?? "India",
    billing_email: input.customer.email,
    billing_phone: input.customer.phone,
    shipping_is_billing: true,
    order_items: input.items.map((it) => ({
      name: it.name,
      sku: it.sku,
      units: it.units,
      selling_price: it.sellingPrice,
    })),
    payment_method: input.paymentMethod,
    sub_total: input.subTotal,
    length: pkg.length ?? 15,
    breadth: pkg.breadth ?? 15,
    height: pkg.height ?? 10,
    weight: pkg.weight ?? 0.5,
  };

  return callShiprocket<CreateOrderResponse>(
    email,
    password,
    "/orders/create/adhoc",
    { method: "POST", body: payload }
  );
}

export interface AwbAssignResponse {
  awb_assign_status?: number;
  response?: {
    data?: {
      awb_code?: string;
      courier_name?: string;
      courier_company_id?: number;
    };
  };
  message?: string;
}

export async function shiprocketAssignAwb(
  email: string,
  password: string,
  shipmentId: number | string
): Promise<AwbAssignResponse> {
  return callShiprocket<AwbAssignResponse>(
    email,
    password,
    "/courier/assign/awb",
    { method: "POST", body: { shipment_id: shipmentId } }
  );
}

export async function shiprocketCancelOrder(
  email: string,
  password: string,
  shiprocketOrderId: number | string
): Promise<{ message?: string; status?: string }> {
  return callShiprocket(email, password, "/orders/cancel", {
    method: "POST",
    body: { ids: [Number(shiprocketOrderId)] },
  });
}

export interface TrackingResponse {
  tracking_data?: {
    track_status?: number;
    shipment_status?: number;
    shipment_track?: Array<{
      id?: number;
      awb_code?: string;
      courier_company_id?: number;
      courier_name?: string;
      current_status?: string;
      delivered_date?: string;
      destination?: string;
      origin?: string;
      pickup_date?: string;
    }>;
    shipment_track_activities?: Array<{
      date?: string;
      status?: string;
      activity?: string;
      location?: string;
    }>;
    track_url?: string;
  };
}

export async function shiprocketTrackByAwb(
  email: string,
  password: string,
  awb: string
): Promise<TrackingResponse> {
  return callShiprocket<TrackingResponse>(
    email,
    password,
    `/courier/track/awb/${encodeURIComponent(awb)}`
  );
}

/** Public Shiprocket tracking page (no auth required) */
export function shiprocketPublicTrackingUrl(awb: string): string {
  return `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`;
}
