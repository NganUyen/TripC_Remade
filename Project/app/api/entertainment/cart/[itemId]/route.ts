/**
 * Cart Item API - Update or remove specific cart item
 * 
 * PUT /api/entertainment/cart/:itemId - Update cart item quantity
 * DELETE /api/entertainment/cart/:itemId - Remove item from cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

/**
 * PUT /api/entertainment/cart/:itemId
 * Update cart item quantity
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createServiceSupabaseClient();
    const { itemId } = params;
    const body = await request.json();

    if (!body.quantity || body.quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    // Get cart item with session info
    const { data: cartItem } = await supabase
      .from('entertainment_cart_items')
      .select(`
        *,
        cart:entertainment_cart!inner(user_id),
        session:entertainment_sessions(available_count)
      `)
      .eq('id', itemId)
      .single();

    if (!cartItem || cartItem.cart.user_id !== userId) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Check availability
    if (cartItem.session && body.quantity > cartItem.session.available_count) {
      return NextResponse.json(
        { error: `Only ${cartItem.session.available_count} tickets available` },
        { status: 400 }
      );
    }

    // Update quantity
    const { data, error } = await supabase
      .from('entertainment_cart_items')
      .update({
        quantity: body.quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data, message: 'Cart item updated' });

  } catch (error: any) {
    console.error('Cart item PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/entertainment/cart/:itemId
 * Remove item from cart
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createServiceSupabaseClient();
    const { itemId } = params;

    // Verify ownership
    const { data: cartItem } = await supabase
      .from('entertainment_cart_items')
      .select(`
        *,
        cart:entertainment_cart!inner(user_id)
      `)
      .eq('id', itemId)
      .single();

    if (!cartItem || cartItem.cart.user_id !== userId) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Delete item
    const { error } = await supabase
      .from('entertainment_cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Item removed from cart' });

  } catch (error: any) {
    console.error('Cart item DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
