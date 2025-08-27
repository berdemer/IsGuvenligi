import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '404 - Page Not Found',
  robots: {
    index: false,
    follow: false
  }
};

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you are looking for might have been removed, renamed, or is temporarily unavailable.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/tr/admin/dashboard">
              Go to Dashboard (Turkish)
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/en/admin/dashboard">
              Go to Dashboard (English)
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}