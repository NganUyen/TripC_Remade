import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shop API Monitor',
    description: 'Internal monitoring dashboard for Shop API health',
};

export default function ShopAPILayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
