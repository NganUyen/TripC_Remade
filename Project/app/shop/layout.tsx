import { CartFlyLayer } from "@/components/shop/cart/CartFlyLayer";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen">
            {children}
            <CartFlyLayer />
        </div>
    );
}
