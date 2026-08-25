import { Link } from 'react-router-dom';
import { ArrowLeft, Home, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/motion/page-transition';

export function NotFoundPage() {
  return (
    <PageTransition>
      <div className="min-h-[80vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-500 flex items-center justify-center mx-auto">
            <FileQuestion className="h-10 w-10" />
          </div>

          <div>
            <span className="font-mono text-caption font-bold text-accent-700 uppercase tracking-widest px-2.5 py-1 bg-accent-50 rounded border border-accent-200">
              ERROR 404
            </span>
            <h1 className="text-display font-extrabold text-neutral-900 mt-3 mb-2">
              Page Not Found
            </h1>
            <p className="text-body text-neutral-600 leading-relaxed">
              The requested logistics or requisition URL does not exist or has been moved.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link to="/">
              <Button variant="primary" leftIcon={<Home className="h-4 w-4" />}>
                Return to Home
              </Button>
            </Link>
            <Link to="/app">
              <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Customer Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
