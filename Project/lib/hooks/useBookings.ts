"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "./useCurrentUser";

export function useBookings() {
  const { convexUser } = useCurrentUser();

  const bookings = useQuery(
    api.bookings.getUserBookings,
    convexUser ? { userId: convexUser._id } : "skip",
  );

  const createBooking = useMutation(api.bookings.createBooking);
  const updateStatus = useMutation(api.bookings.updateBookingStatus);
  const deleteBooking = useMutation(api.bookings.deleteBooking);

  return {
    bookings,
    createBooking,
    updateStatus,
    deleteBooking,
  };
}
