import { redirect } from 'next/navigation';

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  redirect(category ? `/book?category=${encodeURIComponent(category)}` : '/book');
}
