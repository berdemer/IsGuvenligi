import Link from 'next/link';

// Generate metadata
export const metadata = {
  title: 'İş Güvenliği Admin Panel',
  description: 'Workplace Safety Management System',
  robots: {
    index: false,
    follow: false
  }
};

// Root page - simple welcome page with link to admin dashboard
export default function RootPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">İş Güvenliği Admin Panel</h1>
        <p className="text-muted-foreground">
          Workplace Safety Management System
        </p>
        <div className="space-x-4">
          <Link 
            href="/admin/dashboard"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}