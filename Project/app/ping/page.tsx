"use client";

import { useEffect, useState } from "react";

interface HealthStatus {
  status: string;
  api?: string;
  services?: {
    flight_db?: string;
    hotel_db?: string;
    voucher_db?: string;
    transport_db?: string;
    dining_db?: string;
    shop_db?: string;
  };
  timestamp?: string;
  error?: string;
}

interface EndpointStatus {
  method: string;
  path: string;
  description: string;
  status: number | null;
  loading: boolean;
}

export default function PingPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    {
      method: "GET",
      path: "/api/ping",
      description:
        "Health check (Flight + Hotel + Voucher + Transport + Dining + Shop Services)",
      status: null,
      loading: false,
    },
    // Flight Service Endpoints
    {
      method: "GET",
      path: "/api/flight/search?origin=SGN&destination=HAN&date=2026-02-20",
      description: "Flight: Search flights",
      status: null,
      loading: false,
    },
    {
      method: "POST",
      path: "/api/flight/book",
      description: "Flight: Create booking",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/flight/booking/test-id",
      description: "Flight: Get booking",
      status: null,
      loading: false,
    },
    {
      method: "DELETE",
      path: "/api/flight/booking/test-id",
      description: "Flight: Cancel booking",
      status: null,
      loading: false,
    },
    // Hotel Service Endpoints
    {
      method: "GET",
      path: "/api/hotels?city=Bangkok",
      description: "Hotel: List hotels",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/hotels/luxury-bangkok-hotel",
      description: "Hotel: Get hotel details",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/hotels/luxury-bangkok-hotel/rooms",
      description: "Hotel: List rooms",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/hotels/luxury-bangkok-hotel/rates?start=2025-02-01&end=2025-02-05",
      description: "Hotel: Get rates",
      status: null,
      loading: false,
    },
    // Voucher Service Endpoints
    {
      method: "GET",
      path: "/api/v1/vouchers/marketplace",
      description: "Voucher: Marketplace",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/v1/vouchers/exchange",
      description: "Voucher: Exchange API Status",
      status: null,
      loading: false,
    },
    // Transport Service Endpoints
    {
      method: "GET",
      path: "/api/transport/search?origin=SGN&destination=HAN&date=2026-02-20",
      description: "Transport: Search routes",
      status: null,
      loading: false,
    },
    // Dining Service Endpoints
    {
      method: "GET",
      path: "/api/dining/venues?city=Bangkok",
      description: "Dining: Search venues",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/dining/venues/featured",
      description: "Dining: Featured venues",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/dining/cart",
      description: "Dining: Get cart",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/dining/reservations/check?venue_id=test&date=2026-02-20&time=19:00",
      description: "Dining: Check availability",
      status: null,
      loading: false,
    },
    // Shop Service Endpoints
    {
      method: "GET",
      path: "/api/shop/health",
      description: "Shop: Health check",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/shop/products",
      description: "Shop: List products",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/shop/categories",
      description: "Shop: List categories",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/shop/cart",
      description: "Shop: Get cart",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/shop/orders",
      description: "Shop: List orders",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/shop/wishlist",
      description: "Shop: Get wishlist",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/shop/shipping-methods",
      description: "Shop: Shipping methods",
      status: null,
      loading: false,
    },
    {
      method: "GET",
      path: "/api/shop/vouchers/available",
      description: "Shop: Available vouchers",
      status: null,
      loading: false,
    },
  ]);

  const checkHealth = async () => {
    try {
      const res = await fetch("/api/ping");
      const data = await res.json();
      setHealth({ ...data, timestamp: new Date().toISOString() });
      setLoading(false);
    } catch (error) {
      setHealth({
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
      setLoading(false);
    }
  };

  const checkEndpoint = async (index: number) => {
    const endpoint = endpoints[index];
    setEndpoints((prev) =>
      prev.map((e, i) => (i === index ? { ...e, loading: true } : e)),
    );

    try {
      // Don't try to parse response body, just check status
      const res = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: { Accept: "application/json" },
      });
      setEndpoints((prev) =>
        prev.map((e, i) =>
          i === index ? { ...e, status: res.status, loading: false } : e,
        ),
      );
    } catch (error) {
      // Network error or CORS issue
      console.error(`Endpoint check failed for ${endpoint.path}:`, error);
      setEndpoints((prev) =>
        prev.map((e, i) =>
          i === index ? { ...e, status: 0, loading: false } : e,
        ),
      );
    }
  };

  const checkAllEndpoints = async () => {
    for (let i = 0; i < endpoints.length; i++) {
      await checkEndpoint(i);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    checkHealth();
    checkAllEndpoints();

    if (autoRefresh) {
      const interval = setInterval(() => {
        checkHealth();
        checkAllEndpoints();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, mounted]);

  if (!mounted) {
    return (
      <div
        style={{
          fontFamily: "monospace",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  const getStatusColor = (status: string | undefined | number | null) => {
    if (typeof status === "number") {
      if (status >= 200 && status < 300) return "#22c55e";
      if (status >= 400 && status < 500) return "#eab308";
      if (status >= 500) return "#ef4444";
      if (status === 0) return "#ef4444";
      return "#666";
    }
    switch (status?.toString().toLowerCase()) {
      case "ok":
        return "#22c55e";
      case "error":
        return "#ef4444";
      default:
        return "#eab308";
    }
  };

  const getStatusText = (status: number | null, loading: boolean) => {
    if (loading) return "CHECKING...";
    if (status === null) return "NOT TESTED";
    if (status === 0) return "FAILED";
    return status.toString();
  };

  return (
    <div
      style={{
        fontFamily: "monospace",
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>
          TripC Services Health Monitor
        </h1>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Internal monitoring dashboard - Flight, Hotel, Voucher, Transport,
          Dining & Shop Services
        </p>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => {
              checkHealth();
              checkAllEndpoints();
            }}
            disabled={loading}
            style={{
              padding: "8px 16px",
              marginRight: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "Checking..." : "Refresh All"}
          </button>

          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />{" "}
            Auto-refresh (10s)
          </label>
        </div>

        {health && (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "white",
                marginBottom: "20px",
              }}
            >
              <tbody>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>
                    Overall Status
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: getStatusColor(health.status),
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                  >
                    {health.status?.toUpperCase()}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px" }}>API Server</td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: getStatusColor(health.api),
                      fontWeight: "bold",
                    }}
                  >
                    {health.api?.toUpperCase() || "UNKNOWN"}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px" }}>Flight Database</td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: getStatusColor(health.services?.flight_db),
                      fontWeight: "bold",
                    }}
                  >
                    {health.services?.flight_db?.toUpperCase() || "UNKNOWN"}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px" }}>Hotel Database</td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: getStatusColor(health.services?.hotel_db),
                      fontWeight: "bold",
                    }}
                  >
                    {health.services?.hotel_db?.toUpperCase() || "UNKNOWN"}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px" }}>Voucher Database</td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: getStatusColor(health.services?.voucher_db),
                      fontWeight: "bold",
                    }}
                  >
                    {health.services?.voucher_db?.toUpperCase() || "UNKNOWN"}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px" }}>Transport Database</td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: getStatusColor(health.services?.transport_db),
                      fontWeight: "bold",
                    }}
                  >
                    {health.services?.transport_db?.toUpperCase() || "UNKNOWN"}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px" }}>Dining Database</td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: getStatusColor(health.services?.dining_db),
                      fontWeight: "bold",
                    }}
                  >
                    {health.services?.dining_db?.toUpperCase() || "UNKNOWN"}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "12px" }}>Shop Database</td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      color: getStatusColor(health.services?.shop_db),
                      fontWeight: "bold",
                    }}
                  >
                    {health.services?.shop_db?.toUpperCase() || "UNKNOWN"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "12px" }}>Last Check</td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    {health.timestamp
                      ? new Date(health.timestamp).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>

            {health.error && (
              <div
                style={{
                  backgroundColor: "#fee",
                  border: "1px solid #fcc",
                  padding: "12px",
                  marginBottom: "20px",
                  borderRadius: "4px",
                }}
              >
                <strong style={{ color: "#c00" }}>Error:</strong>
                <pre
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: "12px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {health.error}
                </pre>
              </div>
            )}
          </>
        )}

        {loading && !health && <p>Loading...</p>}

        <details open style={{ marginTop: "30px" }}>
          <summary
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Available Endpoints
          </summary>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid #ddd",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <th style={{ padding: "8px", textAlign: "left" }}>Method</th>
                <th style={{ padding: "8px", textAlign: "left" }}>Endpoint</th>
                <th style={{ padding: "8px", textAlign: "left" }}>
                  Description
                </th>
                <th style={{ padding: "8px", textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((endpoint, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "8px", width: "80px" }}>
                    <code
                      style={{
                        color:
                          endpoint.method === "GET"
                            ? "#22c55e"
                            : endpoint.method === "POST"
                              ? "#3b82f6"
                              : endpoint.method === "DELETE"
                                ? "#ef4444"
                                : "#666",
                      }}
                    >
                      {endpoint.method}
                    </code>
                  </td>
                  <td style={{ padding: "8px" }}>
                    <code style={{ fontSize: "12px" }}>
                      {endpoint.path.replace(/\?.*/, "")}
                    </code>
                  </td>
                  <td style={{ padding: "8px", color: "#666" }}>
                    {endpoint.description}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      fontWeight: "bold",
                      color: getStatusColor(endpoint.status),
                    }}
                  >
                    {getStatusText(endpoint.status, endpoint.loading)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </div>
    </div>
  );
}
