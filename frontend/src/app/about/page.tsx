import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">About Product Data Explorer</h1>

      <div className="prose prose-lg max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-gray-700 mb-4">
            Product Data Explorer is a production-minded product exploration platform that enables users 
            to navigate from high-level headings → categories → products → product detail pages, powered 
            by live, on-demand scraping from World of Books.
          </p>
          <p className="text-gray-700">
            This application demonstrates modern full-stack development practices including real-time 
            data scraping, intelligent caching, responsive design, and accessibility features.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-primary-600">Frontend</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Next.js 14 (App Router)</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• SWR for data fetching</li>
                <li>• Axios for API calls</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-primary-600">Backend</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• NestJS</li>
                <li>• TypeScript</li>
                <li>• PostgreSQL with Prisma ORM</li>
                <li>• Bull Queue with Redis</li>
                <li>• Crawlee + Playwright</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">🚀 Live Scraping</h3>
              <p className="text-gray-700">
                On-demand data fetching from World of Books using Crawlee and Playwright for reliable, 
                headless browser automation.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">💾 Intelligent Caching</h3>
              <p className="text-gray-700">
                Database-backed TTL caching with Redis to minimize unnecessary requests while ensuring 
                data freshness.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">🔍 Advanced Search & Filters</h3>
              <p className="text-gray-700">
                Filter products by category, price range, author, and search keywords with pagination support.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">📱 Responsive Design</h3>
              <p className="text-gray-700">
                Mobile-first design with Tailwind CSS ensuring optimal experience across all devices.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">♿ Accessibility</h3>
              <p className="text-gray-700">
                WCAG AA compliant with semantic HTML, keyboard navigation, and proper ARIA attributes.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">⚡ Queue-Based Processing</h3>
              <p className="text-gray-700">
                Bull Queue for managing scraping jobs with automatic retries and error handling.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Architecture</h2>
          <p className="text-gray-700 mb-4">
            The application follows a modern microservices-inspired architecture:
          </p>
          <ul className="space-y-2 text-gray-700 list-disc list-inside">
            <li><strong>Frontend (Next.js):</strong> Server-side rendering and client-side data fetching</li>
            <li><strong>Backend (NestJS):</strong> RESTful API with modular architecture</li>
            <li><strong>Database (PostgreSQL):</strong> Relational data storage with Prisma ORM</li>
            <li><strong>Cache (Redis):</strong> High-performance caching layer</li>
            <li><strong>Queue (Bull):</strong> Asynchronous job processing</li>
            <li><strong>Scraper (Crawlee + Playwright):</strong> Reliable web scraping</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Ethical Scraping</h2>
          <p className="text-gray-700 mb-4">
            This project implements responsible scraping practices:
          </p>
          <ul className="space-y-2 text-gray-700 list-disc list-inside">
            <li>Configurable delays between requests (default: 2 seconds)</li>
            <li>Exponential backoff on errors</li>
            <li>Respects robots.txt and terms of service</li>
            <li>Aggressive caching to minimize requests (24-hour TTL)</li>
            <li>Rate limiting on API endpoints</li>
            <li>Proper user agent identification</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Contact & Resources</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">API Documentation</h3>
                <a 
                  href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/api`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  View Swagger API Docs →
                </a>
              </div>
              <div>
                <h3 className="font-semibold mb-2">GitHub Repository</h3>
                <a 
                  href="https://github.com/your-repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  View Source Code →
                </a>
              </div>
              <div>
                <h3 className="font-semibold mb-2">World of Books</h3>
                <a 
                  href="https://www.worldofbooks.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Visit World of Books →
                </a>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
          <p className="text-gray-700 mb-4">
            Ready to explore? Start by browsing our collection of products or dive into specific categories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center"
            >
              Browse Products
            </Link>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              View Categories
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
