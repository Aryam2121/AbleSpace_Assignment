'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { productApi, ProductWithDetail, Product, Review } from '@/lib/api';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorMessage from '@/components/ErrorMessage';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [refreshing, setRefreshing] = useState(false);

  const { data: product, error, isLoading, mutate } = useSWR<ProductWithDetail>(
    id ? ['product', id] : null,
    () => productApi.getById(id)
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await productApi.triggerScrape(id);
      // Wait a bit for scraping to complete
      setTimeout(() => {
        mutate();
        setRefreshing(false);
      }, 3000);
    } catch (err) {
      setRefreshing(false);
    }
  };

  if (error) {
    return <ErrorMessage message="Failed to load product details. Please try again later." />;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <LoadingSkeleton className="h-96" />
          <LoadingSkeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!product) {
    return <ErrorMessage message="Product not found." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-primary-600">Home</Link>
        {' / '}
        <Link href="/products" className="hover:text-primary-600">Products</Link>
        {' / '}
        <span className="text-gray-900">{product.title}</span>
      </nav>

      {/* Product Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="aspect-[3/4] relative bg-gray-100 rounded-lg overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image Available
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
          
          {product.author && (
            <p className="text-lg text-gray-600 mb-4">by {product.author}</p>
          )}

          <div className="flex items-center gap-4 mb-6">
            <p className="text-3xl font-bold text-primary-600">
              {product.currency} {product.price.toFixed(2)}
            </p>
            {product.detail?.ratingsAvg && (
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="font-semibold">{product.detail.ratingsAvg.toFixed(1)}</span>
                <span className="text-gray-600 ml-2">
                  ({product.detail.reviewsCount} {product.detail.reviewsCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>

          {product.detail?.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.detail.description}</p>
            </div>
          )}

          {/* Additional Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">Product Details</h3>
            <dl className="space-y-2">
              {product.detail?.publisher && (
                <>
                  <dt className="text-sm text-gray-600">Publisher</dt>
                  <dd className="text-sm font-medium">{product.detail.publisher}</dd>
                </>
              )}
              {product.detail?.publicationDate && (
                <>
                  <dt className="text-sm text-gray-600">Publication Date</dt>
                  <dd className="text-sm font-medium">{product.detail.publicationDate}</dd>
                </>
              )}
              {product.detail?.isbn && (
                <>
                  <dt className="text-sm text-gray-600">ISBN</dt>
                  <dd className="text-sm font-medium">{product.detail.isbn}</dd>
                </>
              )}
            </dl>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="space-y-4">
            {product.reviews.map((review: Review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold">{review.author}</p>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="font-semibold">{review.rating}</span>
                  </div>
                </div>
                <p className="text-gray-700">{review.text}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {product.recommendedProducts && product.recommendedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Recommended Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {product.recommendedProducts.map((rec: Product) => (
              <Link
                key={rec.id}
                href={`/products/${rec.id}`}
                className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="aspect-[3/4] relative bg-gray-100">
                  {rec.imageUrl ? (
                    <Image
                      src={rec.imageUrl}
                      alt={rec.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                    {rec.title}
                  </h3>
                  <p className="text-sm font-bold text-primary-600">
                    {rec.currency} {rec.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
