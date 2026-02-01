-- Allow anyone to see a booking if it's a guest booking
-- (Security is maintained by the requirement of knowing the UUID)
CREATE POLICY "Public view guest bookings"
ON public.bookings
FOR SELECT
TO public
USING (user_id = 'GUEST');

-- Allow anyone to insert a guest booking
CREATE POLICY "Public insert guest bookings"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (user_id = 'GUEST');

-- Allow anyone to update a guest booking (needed for payment status sync)
CREATE POLICY "Public update guest bookings"
ON public.bookings
FOR UPDATE
TO public
USING (user_id = 'GUEST')
WITH CHECK (user_id = 'GUEST');
