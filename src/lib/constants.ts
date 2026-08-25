export const APP_NAME = 'AR Multiventures';
export const APP_TAGLINE = 'Global Perspective. Endless Possibilities.';

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/#services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Quarries', href: '/#materials' },
  { label: 'Haulage', href: '/#haulage' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
] as const;

export const ORDER_STATUSES = [
  'draft',
  'submitted',
  'approved',
  'payment_pending',
  'payment_confirmed',
  'loading_scheduled',
  'loading',
  'dispatched',
  'delivered',
  'completed',
  'cancelled',
  'rejected',
  'on_hold',
] as const;

export const MATERIAL_CATEGORIES = [
  { id: 'granite-3-4', name: '3/4 Granite', description: '19mm crushed granite aggregate' },
  { id: 'granite-1-2', name: '1/2 Granite', description: '12.5mm crushed granite aggregate' },
  { id: 'granite-10mm', name: '10mm Granite', description: 'Fine crushed granite' },
  { id: 'granite-20mm', name: '20mm Granite', description: 'Medium crushed granite' },
  { id: 'granite-30mm', name: '30mm Granite', description: 'Coarse crushed granite' },
  { id: 'stone-dust', name: 'Stone Dust', description: 'Fine aggregate from crushing' },
  { id: 'quarry-dust', name: 'Quarry Dust', description: 'Quarry by-product material' },
  { id: 'sharp-sand', name: 'Sharp Sand', description: 'Coarse sand for construction' },
] as const;

export const REQUISITION_STEPS = [
  { id: 1, title: 'Select Quarry', description: 'Choose your supply source' },
  { id: 2, title: 'Select Material', description: 'Pick material type' },
  { id: 3, title: 'Quantity', description: 'Specify tonnage' },
  { id: 4, title: 'Transportation', description: 'Transport arrangement' },
  { id: 5, title: 'Truck', description: 'Select truck' },
  { id: 6, title: 'Destination', description: 'Delivery location' },
  { id: 7, title: 'Delivery Date', description: 'Preferred schedule' },
  { id: 8, title: 'Pricing Review', description: 'Review cost breakdown' },
  { id: 9, title: 'Confirmation', description: 'Confirm & submit' },
] as const;

export const SIDEBAR_LINKS = [
  { label: 'Dashboard', href: '/app', icon: 'LayoutDashboard' },
  { label: 'New Requisition', href: '/app/requisitions/new', icon: 'PlusCircle', primary: true },
  { label: 'Requisitions', href: '/app/requisitions', icon: 'FileText' },
  { label: 'Orders', href: '/app/orders', icon: 'Package' },
  { label: 'Deliveries', href: '/app/deliveries', icon: 'Truck' },
  { label: 'Invoices', href: '/app/invoices', icon: 'Receipt' },
  { label: 'Payments', href: '/app/payments', icon: 'CreditCard' },
  { label: 'Account', href: '/app/account', icon: 'Building2' },
  { label: 'Notifications', href: '/app/notifications', icon: 'Bell' },
] as const;

export const FOOTER_LINKS = {
  company: [
    { label: 'About Us', href: '/#about' },
    { label: 'Our Quarries', href: '/#materials' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '/#contact' },
  ],
  services: [
    { label: 'Material Supply', href: '/#services' },
    { label: 'Quarry Requisition', href: '/#services' },
    { label: 'Haulage & Transportation', href: '/#services' },
    { label: 'Loading Coordination', href: '/#services' },
  ],
  portal: [
    { label: 'Customer Dashboard', href: '/app' },
    { label: 'New Requisition', href: '/app/requisitions/new' },
    { label: 'Track Orders', href: '/app/orders' },
    { label: 'Invoices', href: '/app/invoices' },
  ],
  support: [
    { label: 'Help Center', href: '#' },
    { label: 'FAQs', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
} as const;
