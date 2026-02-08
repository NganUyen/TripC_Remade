import { create } from 'zustand';
import { toast } from 'sonner';
import type { PartnerProduct, Product } from '@/lib/shop/types';

interface ProductFilters {
    status: string;
    search: string;
    sort: string;
}

interface PartnerProductState {
    products: PartnerProduct[];
    total: number;
    currentProduct: PartnerProduct | null;
    filters: ProductFilters;
    page: number;
    limit: number;
    isLoading: boolean;
    isLoadingProduct: boolean;
    isSaving: boolean;
    error: string | null;

    // List
    fetchProducts: (params?: Partial<ProductFilters & { page?: number }>) => Promise<void>;
    setFilters: (filters: Partial<ProductFilters>) => void;
    setPage: (page: number) => void;

    // Single product
    fetchProduct: (id: string) => Promise<void>;
    clearCurrentProduct: () => void;

    // CRUD
    createProduct: (data: { title: string; description?: string; category_id?: string; product_type?: string }) => Promise<string | null>;
    updateProduct: (id: string, data: Partial<Pick<Product, 'title' | 'description' | 'category_id' | 'product_type'>>) => Promise<boolean>;
    publishProduct: (id: string) => Promise<boolean>;
    archiveProduct: (id: string) => Promise<boolean>;
    deleteProduct: (id: string) => Promise<boolean>;

    // Variants
    createVariant: (productId: string, data: { sku: string; title: string; price: number; compare_at_price?: number; stock_on_hand?: number }) => Promise<boolean>;
    updateVariant: (productId: string, variantId: string, data: Record<string, unknown>) => Promise<boolean>;
    deleteVariant: (productId: string, variantId: string) => Promise<boolean>;

    // Images
    uploadImage: (productId: string, file: File) => Promise<boolean>;
    deleteImage: (productId: string, imageId: string) => Promise<boolean>;
    reorderImages: (productId: string, imageIds: string[]) => Promise<boolean>;
}

export const usePartnerProductStore = create<PartnerProductState>((set, get) => ({
    products: [],
    total: 0,
    currentProduct: null,
    filters: { status: 'all', search: '', sort: 'newest' },
    page: 1,
    limit: 20,
    isLoading: false,
    isLoadingProduct: false,
    isSaving: false,
    error: null,

    fetchProducts: async (params) => {
        const { filters, page, limit } = get();
        const merged = {
            status: params?.status ?? filters.status,
            search: params?.search ?? filters.search,
            sort: params?.sort ?? filters.sort,
        };
        const currentPage = params?.page ?? page;
        const offset = (currentPage - 1) * limit;

        // Update filters and page
        set({ filters: merged, page: currentPage, isLoading: true, error: null });

        try {
            const searchParams = new URLSearchParams();
            if (merged.status && merged.status !== 'all') searchParams.set('status', merged.status);
            if (merged.search) searchParams.set('search', merged.search);
            if (merged.sort) searchParams.set('sort', merged.sort);
            searchParams.set('limit', limit.toString());
            searchParams.set('offset', offset.toString());

            const res = await fetch(`/api/shop/partners/products?${searchParams}`);
            if (res.ok) {
                const body = await res.json();
                set({ products: body.data, total: body.meta?.total || 0 });
            } else {
                const body = await res.json().catch(() => null);
                set({ error: body?.error?.message || 'Failed to load products' });
            }
        } catch (err) {
            console.error('Failed to fetch partner products:', err);
            toast.error('Failed to load products');
        } finally {
            set({ isLoading: false });
        }
    },

    setFilters: (newFilters) => {
        const { filters } = get();
        const merged = { ...filters, ...newFilters };
        // Reset to page 1 when filters change
        get().fetchProducts({ ...merged, page: 1 });
    },

    setPage: (page) => {
        get().fetchProducts({ page });
    },

    fetchProduct: async (id) => {
        set({ isLoadingProduct: true, error: null });
        try {
            const res = await fetch(`/api/shop/partners/products/${id}`);
            if (res.ok) {
                const { data } = await res.json();
                set({ currentProduct: data });
            } else {
                const body = await res.json().catch(() => null);
                set({ error: body?.error?.message || 'Product not found' });
            }
        } catch (err) {
            console.error('Failed to fetch product:', err);
            toast.error('Failed to load product details');
        } finally {
            set({ isLoadingProduct: false });
        }
    },

    clearCurrentProduct: () => set({ currentProduct: null }),

    createProduct: async (data) => {
        set({ isSaving: true, error: null });
        try {
            const res = await fetch('/api/shop/partners/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const body = await res.json();

            if (res.ok) {
                toast.success('Product created');
                return body.data.id;
            } else {
                toast.error(body.error?.message || 'Failed to create product');
                return null;
            }
        } catch (err) {
            toast.error('Connection error');
            return null;
        } finally {
            set({ isSaving: false });
        }
    },

    updateProduct: async (id, data) => {
        set({ isSaving: true });
        try {
            const res = await fetch(`/api/shop/partners/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const body = await res.json();

            if (res.ok) {
                // Update current product if viewing it
                const { currentProduct } = get();
                if (currentProduct?.id === id) {
                    set({ currentProduct: { ...currentProduct, ...body.data } });
                }
                toast.success('Product updated');
                return true;
            } else {
                toast.error(body.error?.message || 'Failed to update product');
                return false;
            }
        } catch (err) {
            toast.error('Connection error');
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    publishProduct: async (id) => {
        set({ isSaving: true });
        try {
            const res = await fetch(`/api/shop/partners/products/${id}/publish`, {
                method: 'POST',
            });

            const body = await res.json();

            if (res.ok) {
                // Update local state
                const { currentProduct, products } = get();
                if (currentProduct?.id === id) {
                    set({ currentProduct: { ...currentProduct, status: 'active' } });
                }
                set({
                    products: products.map(p =>
                        p.id === id ? { ...p, status: 'active' as const } : p
                    ),
                });
                toast.success('Product published');
                return true;
            } else {
                // Show validation errors
                if (body.error?.details?.details) {
                    const errors = body.error.details.details as { field: string; message: string }[];
                    errors.forEach(e => toast.error(`${e.field}: ${e.message}`));
                } else {
                    toast.error(body.error?.message || 'Failed to publish product');
                }
                return false;
            }
        } catch (err) {
            toast.error('Connection error');
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    archiveProduct: async (id) => {
        set({ isSaving: true });
        try {
            const res = await fetch(`/api/shop/partners/products/${id}/archive`, {
                method: 'POST',
            });

            if (res.ok) {
                const { currentProduct, products } = get();
                if (currentProduct?.id === id) {
                    set({ currentProduct: { ...currentProduct, status: 'archived' } });
                }
                set({
                    products: products.map(p =>
                        p.id === id ? { ...p, status: 'archived' as const } : p
                    ),
                });
                toast.success('Product archived');
                return true;
            } else {
                const body = await res.json().catch(() => null);
                toast.error(body?.error?.message || 'Failed to archive product');
                return false;
            }
        } catch (err) {
            toast.error('Connection error');
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    deleteProduct: async (id) => {
        set({ isSaving: true });
        try {
            const res = await fetch(`/api/shop/partners/products/${id}`, {
                method: 'DELETE',
            });

            if (res.ok || res.status === 204) {
                const { products } = get();
                set({
                    products: products.filter(p => p.id !== id),
                    total: get().total - 1,
                    currentProduct: get().currentProduct?.id === id ? null : get().currentProduct,
                });
                toast.success('Product deleted');
                return true;
            } else {
                const body = await res.json().catch(() => null);
                toast.error(body?.error?.message || 'Failed to delete product');
                return false;
            }
        } catch (err) {
            toast.error('Connection error');
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    // Variant operations
    createVariant: async (productId, data) => {
        set({ isSaving: true });
        try {
            const res = await fetch(`/api/shop/partners/products/${productId}/variants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                toast.success('Variant added');
                // Refetch product to get updated variants
                await get().fetchProduct(productId);
                return true;
            } else {
                const body = await res.json().catch(() => null);
                toast.error(body?.error?.message || 'Failed to add variant');
                return false;
            }
        } catch (err) {
            toast.error('Connection error');
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    updateVariant: async (productId, variantId, data) => {
        set({ isSaving: true });
        try {
            const res = await fetch(`/api/shop/partners/products/${productId}/variants/${variantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                toast.success('Variant updated');
                await get().fetchProduct(productId);
                return true;
            } else {
                const body = await res.json().catch(() => null);
                toast.error(body?.error?.message || 'Failed to update variant');
                return false;
            }
        } catch (err) {
            toast.error('Connection error');
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    deleteVariant: async (productId, variantId) => {
        set({ isSaving: true });
        try {
            const res = await fetch(`/api/shop/partners/products/${productId}/variants/${variantId}`, {
                method: 'DELETE',
            });

            if (res.ok || res.status === 204) {
                toast.success('Variant removed');
                await get().fetchProduct(productId);
                return true;
            } else {
                const body = await res.json().catch(() => null);
                toast.error(body?.error?.message || 'Failed to remove variant');
                return false;
            }
        } catch (err) {
            toast.error('Connection error');
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    // Image operations
    uploadImage: async (productId, file) => {
        set({ isSaving: true });
        try {
            // Step 1: Request signed upload URL
            const reqRes = await fetch('/api/shop/partners/upload/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content_type: file.type,
                    file_size: file.size,
                    product_id: productId,
                    filename: file.name,  // BUG-002 Fix: Add missing filename
                }),
            });

            if (!reqRes.ok) {
                const body = await reqRes.json().catch(() => null);
                toast.error(body?.error?.message || 'Failed to get upload URL');
                return false;
            }

            const { data: uploadData } = await reqRes.json();

            // Step 2: Upload file to signed URL (BUG-010 Fix: use upload_url not signed_url)
            const uploadRes = await fetch(uploadData.upload_url, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            if (!uploadRes.ok) {
                toast.error('Failed to upload image');
                return false;
            }

            // Step 3: Confirm upload
            const confirmRes = await fetch('/api/shop/partners/upload/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: uploadData.key,
                    product_id: productId,
                    alt: file.name.replace(/\.[^/.]+$/, ''),
                }),
            });

            if (confirmRes.ok) {
                toast.success('Image uploaded');
                await get().fetchProduct(productId);
                return true;
            } else {
                toast.error('Failed to confirm upload');
                return false;
            }
        } catch (err) {
            toast.error('Connection error');
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    deleteImage: async (productId, imageId) => {
        set({ isSaving: true });
        try {
            const res = await fetch(`/api/shop/partners/products/${productId}/images/${imageId}`, {
                method: 'DELETE',
            });

            if (res.ok || res.status === 204) {
                toast.success('Image removed');
                await get().fetchProduct(productId);
                return true;
            } else {
                const body = await res.json().catch(() => null);
                toast.error(body?.error?.message || 'Failed to remove image');
                return false;
            }
        } catch (err) {
            toast.error('Connection error');
            return false;
        } finally {
            set({ isSaving: false });
        }
    },

    reorderImages: async (productId, imageIds) => {
        set({ isSaving: true });
        try {
            const res = await fetch(`/api/shop/partners/products/${productId}/images/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_ids: imageIds }),
            });

            if (res.ok) {
                await get().fetchProduct(productId);
                return true;
            } else {
                const body = await res.json().catch(() => null);
                toast.error(body?.error?.message || 'Failed to reorder images');
                return false;
            }
        } catch (err) {
            toast.error('Connection error');
            return false;
        } finally {
            set({ isSaving: false });
        }
    },
}));
