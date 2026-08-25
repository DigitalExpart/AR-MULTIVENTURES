import { Link } from 'react-router-dom';
import { APP_NAME, APP_TAGLINE, FOOTER_LINKS } from '@/lib/constants';
import { MapPin, Phone, Mail } from 'lucide-react';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-neutral-300" id="contact">
      <div className="container-wide">
        {/* Main Footer */}
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
                <span className="text-white font-bold text-body-lg">A</span>
              </div>
              <span className="text-label font-bold text-white tracking-tight">
                {APP_NAME.toUpperCase()}
              </span>
            </div>
            <p className="text-body-sm text-neutral-400 mb-5 max-w-xs">
              {APP_TAGLINE}
            </p>
            <div className="space-y-3 text-body-sm">
              <div className="flex items-center gap-2 text-neutral-400">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+234 800 AR MULTI</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@armultiventures.com</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="text-label text-white mb-4">Company</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-body-sm text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-label text-white mb-4">Services</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-body-sm text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-label text-white mb-4">Support</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-body-sm text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-caption text-neutral-500">
            © {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-caption text-neutral-500">
            <a href="#" className="hover:text-neutral-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
