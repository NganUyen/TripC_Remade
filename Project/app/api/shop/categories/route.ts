import {
    successResponse,
    getCategoryTree,
} from '@/lib/shop';

export async function GET() {
    try {
        const tree = await getCategoryTree();

        const formatted = tree.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            parent_id: c.parent_id,
            image_url: c.image_url,
            children: c.children.map((child) => ({
                id: child.id,
                slug: child.slug,
                name: child.name,
                parent_id: child.parent_id,
                image_url: child.image_url,
            })),
        }));

        return successResponse(formatted);
    } catch (error) {
        console.error('Categories error:', error);
        return successResponse([]);
    }
}
