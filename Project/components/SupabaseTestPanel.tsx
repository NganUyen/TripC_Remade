"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useBookings } from "@/lib/hooks/useBookings";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { SignInButton, SignOutButton } from "@clerk/nextjs";

/**
 * Test component to verify Clerk + Supabase integration
 * Add this to any page to test the setup
 */
export function SupabaseTestPanel() {
  const { clerkUser, supabaseUser, isLoading, isAuthenticated } =
    useCurrentUser();
  const { bookings, isLoading: bookingsLoading, createBooking } = useBookings();
  const { wishlist, isLoading: wishlistLoading } = useWishlist();

  const handleSyncUser = async () => {
    try {
      const response = await fetch("/api/sync-user", { method: "POST" });
      const data = await response.json();

      if (data.success) {
        alert("✅ User synced successfully! Refresh the page.");
        window.location.reload();
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (error: any) {
      console.error("Error syncing user:", error);
      alert("❌ Error: " + error.message);
    }
  };

  const handleTestBooking = async () => {
    try {
      await createBooking({
        booking_type: "hotel",
        title: "Test Booking",
        description: "This is a test booking",
        start_date: new Date().toISOString(),
        price: 99.99,
        status: "pending",
        currency: "USD",
        image_url: null,
        metadata: null,
        end_date: null,
      });
      alert("✅ Booking created successfully!");
    } catch (error: any) {
      console.error("Error creating booking:", error);
      alert("❌ Error: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{ padding: "20px", border: "2px solid #ccc", margin: "20px" }}
      >
        <h2>🔄 Loading...</h2>
      </div>
    );
  }

  if (!clerkUser) {
    return (
      <div
        style={{ padding: "20px", border: "2px solid #ccc", margin: "20px" }}
      >
        <h2>🔐 Supabase Integration Test</h2>
        <p>Please sign in to test the integration</p>
        <SignInButton mode="modal">
          <button style={{ padding: "10px 20px", cursor: "pointer" }}>
            Sign In
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        border: "2px solid #4CAF50",
        margin: "20px",
        fontFamily: "monospace",
      }}
    >
      <h2>✅ Supabase Integration Test Panel</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>🔐 Clerk User:</h3>
        <pre
          style={{ background: "#f5f5f5", padding: "10px", overflow: "auto" }}
        >
          {JSON.stringify(
            {
              id: clerkUser.id,
              email: clerkUser.emailAddresses[0]?.emailAddress,
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
            },
            null,
            2,
          )}
        </pre>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>🗄️ Supabase User:</h3>
        {supabaseUser ? (
          <pre
            style={{ background: "#e8f5e9", padding: "10px", overflow: "auto" }}
          >
            {JSON.stringify(
              {
                clerk_id: supabaseUser.clerk_id,
                email: supabaseUser.email,
                name: supabaseUser.name,
                membership_tier: supabaseUser.membership_tier,
                tcent_balance: supabaseUser.tcent_balance,
              },
              null,
              2,
            )}
          </pre>
        ) : (
          <div>
            <div
              style={{
                background: "#ffebee",
                padding: "10px",
                color: "red",
                marginBottom: "10px",
              }}
            >
              ❌ User not found in Supabase!
            </div>
            <button
              onClick={handleSyncUser}
              style={{
                padding: "10px 20px",
                cursor: "pointer",
                background: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              🔄 Sync User to Supabase Now
            </button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>📋 Bookings ({bookingsLoading ? "..." : bookings.length}):</h3>
        {bookingsLoading ? (
          <p>Loading bookings...</p>
        ) : (
          <div>
            {bookings.length === 0 ? (
              <p>No bookings yet</p>
            ) : (
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "10px",
                  overflow: "auto",
                }}
              >
                {JSON.stringify(bookings, null, 2)}
              </pre>
            )}
          </div>
        )}
        <button
          onClick={handleTestBooking}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginTop: "10px",
          }}
        >
          Create Test Booking
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>❤️ Wishlist ({wishlistLoading ? "..." : wishlist.length}):</h3>
        {wishlistLoading ? (
          <p>Loading wishlist...</p>
        ) : wishlist.length === 0 ? (
          <p>Wishlist is empty</p>
        ) : (
          <pre
            style={{ background: "#f5f5f5", padding: "10px", overflow: "auto" }}
          >
            {JSON.stringify(wishlist, null, 2)}
          </pre>
        )}
      </div>

      <div>
        <SignOutButton>
          <button
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              background: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Sign Out
          </button>
        </SignOutButton>
      </div>

      <div
        style={{ marginTop: "20px", padding: "10px", background: "#e3f2fd" }}
      >
        <h4>📊 Integration Status:</h4>
        <ul>
          <li>✅ Clerk Authentication: Working</li>
          <li>
            {supabaseUser ? "✅" : "❌"} Supabase User Sync:{" "}
            {supabaseUser ? "Working" : "Failed - Check webhook"}
          </li>
          <li>
            {isAuthenticated ? "✅" : "❌"} Full Integration:{" "}
            {isAuthenticated ? "Working" : "Failed"}
          </li>
        </ul>
      </div>
    </div>
  );
}
