import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-navy/10 flex items-center justify-center text-2xl">404</div>
      <h1 className="text-2xl font-display font-bold text-navy">Page not found</h1>
      <p className="text-text-muted max-w-sm">The page you&apos;re looking for doesn&apos;t exist or has been moved. Try searching or return to your dashboard.</p>
      <div className="flex items-center gap-3 mt-2">
        <Link href="/dashboard" className="btn btn-primary h-11">Back to Dashboard</Link>
        <Link href="/tickets" className="btn btn-secondary h-11">Search tickets</Link>
      </div>
    </div>
  );
}
