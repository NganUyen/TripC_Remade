/**
 * Category Detail API - Get single category with items
 * 
 * GET /api/entertainment/categories/:slug - Get category details and items
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createServiceSupabaseClient();
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Get category
    const { data: category, error: categoryError } = await supabase
      .from('entertainment_categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get items in this category
    const { data: items, error: itemsError, count } = await supabase
      .from('entertainment_items')
      .select('*', { count: 'exact' })
      .eq('category_id', category.id)
      .eq('status', 'published')
      .eq('available', true)
      .order(sortBy as any, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (itemsError) {
      console.error('Items query error:', itemsError);
      return NextResponse.json(
        { error: 'Failed to fetch category items', details: itemsError.message },
        { status: 500 }
      );
    }

    // Get subcategories
    const { data: subcategories } = await supabase
      .from('entertainment_categories')
      .select('*')
      .eq('parent_id', category.id)
      .eq('is_active', true)
      .order('display_order');

    return NextResponse.json({
      category: {
        ...category,
        subcategories: subcategories || []
      },
      items,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    });

  } catch (error: any) {
    console.error('Category detail GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
