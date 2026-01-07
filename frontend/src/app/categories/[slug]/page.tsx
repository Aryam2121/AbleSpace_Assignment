'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import { categoryApi, Category, Product } from '@/lib/api';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorMessage from '@/components/ErrorMessage';
import Pagination from '@/components/Pagination';

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [page, setPage] = useState(1);

  const { data: category, error, isLoading } = useSWR(
    slug ? ['category', slug, page] : null,
    () => categoryApi.getBySlug(slug, true, page, 20)
  );

  if (error) {
    return <ErrorMessage message="Failed to load category. Please try again later." />;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton className="h-20 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <LoadingSkeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return <ErrorMessage message="Category not found." />;
  }

  const totalPages = Math.ceil(category.totalProducts / 20);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        {' / '}
        <span className="text-gray-900">{category.title}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.title}</h1>
        <p className="text-gray-600">
          {category.totalProducts} {category.totalProducts === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {category.children.map((child: Category) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-4 text-center"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{child.title}</h3>
                <p className="text-sm text-gray-600">
                  {child.productCount} {child.productCount === 1 ? 'item' : 'items'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {category.products && category.products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {category.products.map((product: Product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-[3/4] relative bg-gray-100">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {product.title}
                  </h3>
                  {product.author && (
                    <p className="text-sm text-gray-600 mb-2">{product.author}</p>
                  )}
                  <p className="text-lg font-bold text-primary-600">
                    {product.currency} {product.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found in this category.</p>
          <Link
            href="/products"
            className="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      )}
    </div>
  );
}
