/**
 * Cart API - Shopping cart management
 * 
 * GET /api/entertainment/cart - Get user's cart
 * POST /api/entertainment/cart - Add item to cart
 * DELETE /api/entertainment/cart - Clear cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/entertainment/cart
 * Get user's current cart with items
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createServiceSupabaseClient();

    // Get or create cart
    const cart = await getOrCreateCart(supabase, userId);

    // Get cart items with full details
    const { data: cartItems, error } = await supabase
      .from('entertainment_cart_items')
      .select(`
        *,
        item:entertainment_items(*),
        session:entertainment_sessions(*),
        ticket_type:entertainment_ticket_types(*)
      `)
      .eq('cart_id', cart.id);

    if (error) {
      console.error('Cart items query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cart items', details: error.message },
        { status: 500 }
      );
    }

    // Calculate totals
    const subtotal = cartItems?.reduce((sum, item) => sum + parseFloat(item.total_price || '0'), 0) || 0;
    const itemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return NextResponse.json({
      cart: {
        id: cart.id,
        status: cart.status,
        created_at: cart.created_at,
        expires_at: cart.expires_at,
      },
      items: cartItems || [],
      summary: {
        item_count: itemCount,
        subtotal: subtotal.toFixed(2),
        currency: cartItems && cartItems.length > 0 ? cartItems[0].currency : 'USD',
      }
    });

  } catch (error: any) {
    console.error('Cart GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/entertainment/cart
 * Add item to cart
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createServiceSupabaseClient();
    const body = await request.json();

    // Validate required fields
    if (!body.item_id || !body.session_id || !body.ticket_type_id || !body.quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: item_id, session_id, ticket_type_id, quantity' },
        { status: 400 }
      );
    }

    // Get or create cart
    const cart = await getOrCreateCart(supabase, userId);

    // Verify item, session, and ticket type exist and are available
    const { data: item } = await supabase
      .from('entertainment_items')
      .select('*')
      .eq('id', body.item_id)
      .single();

    const { data: session } = await supabase
      .from('entertainment_sessions')
      .select('*')
      .eq('id', body.session_id)
      .single();

    const { data: ticketType } = await supabase
      .from('entertainment_ticket_types')
      .select('*')
      .eq('id', body.ticket_type_id)
      .single();

    if (!item || !session || !ticketType) {
      return NextResponse.json(
        { error: 'Invalid item, session, or ticket type' },
        { status: 400 }
      );
    }

    // Check availability
    if (session.available_count < body.quantity) {
      return NextResponse.json(
        { error: `Only ${session.available_count} tickets available for this session` },
        { status: 400 }
      );
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('entertainment_cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('item_id', body.item_id)
      .eq('session_id', body.session_id)
      .eq('ticket_type_id', body.ticket_type_id)
      .single();

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + body.quantity;
      
      if (session.available_count < newQuantity) {
        return NextResponse.json(
          { error: `Cannot add ${body.quantity} more. Only ${session.available_count} tickets available` },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('entertainment_cart_items')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ data, message: 'Cart item updated' });
    }

    // Add new item to cart
    const { data, error } = await supabase
      .from('entertainment_cart_items')
      .insert([{
        cart_id: cart.id,
        item_id: body.item_id,
        session_id: body.session_id,
        ticket_type_id: body.ticket_type_id,
        quantity: body.quantity,
        unit_price: ticketType.price,
        currency: ticketType.currency,
        reserved_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min reservation
      }])
      .select()
      .single();

    if (error) {
      console.error('Cart item insert error:', error);
      return NextResponse.json(
        { error: 'Failed to add item to cart', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, message: 'Item added to cart' }, { status: 201 });

  } catch (error: any) {
    console.error('Cart POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/entertainment/cart
 * Clear all items from cart
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createServiceSupabaseClient();

    // Get user's cart
    const { data: cart } = await supabase
      .from('entertainment_cart')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!cart) {
      return NextResponse.json({ message: 'Cart is already empty' });
    }

    // Delete all cart items
    const { error } = await supabase
      .from('entertainment_cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Cart cleared successfully' });

  } catch (error: any) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get or create cart for user
 */
async function getOrCreateCart(supabase: any, userId: string) {
  // Try to get existing active cart
  const { data: existingCart } = await supabase
    .from('entertainment_cart')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (existingCart) {
    return existingCart;
  }

  // Create new cart
  const { data: newCart, error } = await supabase
    .from('entertainment_cart')
    .insert([{
      user_id: userId,
      status: 'active',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    }])
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create cart: ' + error.message);
  }

  return newCart;
}
