export const PUBLIC_NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/#services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Materials', href: '/#materials' },
  { label: 'Haulage', href: '/#haulage' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
] as const;

export const CUSTOMER_SIDEBAR_LINKS = [
  { label: 'Dashboard', href: '/app', icon: 'LayoutDashboard' },
  { label: 'New Requisition', href: '/app/requisitions/new', icon: 'PlusCircle', isPrimaryAction: true },
  { label: 'Requisitions', href: '/app/requisitions', icon: 'FileText' },
  { label: 'Orders', href: '/app/orders', icon: 'Package' },
  { label: 'Deliveries', href: '/app/deliveries', icon: 'Truck' },
  { label: 'Invoices', href: '/app/invoices', icon: 'Receipt' },
  { label: 'Payments', href: '/app/payments', icon: 'CreditCard' },
  { label: 'Account', href: '/app/account', icon: 'Building2' },
  { label: 'Notifications', href: '/app/notifications', icon: 'Bell' },
] as const;

export interface AdminNavSection {
  title: string;
  items: {
    label: string;
    href: string;
    icon: string;
    permission?: string;
    badge?: string;
  }[];
}

export const ADMIN_SIDEBAR_SECTIONS: AdminNavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Command Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    ],
  },
  {
    title: 'OPERATIONS & DISPATCH',
    items: [
      { label: 'Operations Command', href: '/admin/operations', icon: 'LayoutDashboard', permission: 'requisitions.view' },
      { label: 'Dispatch Board', href: '/admin/operations/dispatch', icon: 'Truck', permission: 'requisitions.view' },
      { label: 'Requisitions', href: '/admin/requisitions', icon: 'FileText', permission: 'requisitions.view' },
      { label: 'Customers', href: '/admin/customers', icon: 'Building2', permission: 'customers.view' },
    ],
  },
  {
    title: 'FLEET & DRIVERS',
    items: [
      { label: 'Heavy Trucks', href: '/admin/fleet/trucks', icon: 'Truck', permission: 'fleet.manage' },
      { label: 'Drivers Roster', href: '/admin/fleet/drivers', icon: 'Users', permission: 'fleet.manage' },
      { label: 'Maintenance Logs', href: '/admin/fleet/maintenance', icon: 'Settings', permission: 'fleet.manage' },
    ],
  },
  {
    title: 'CATALOG & SITES',
    items: [
      { label: 'Quarries', href: '/admin/quarries', icon: 'Mountain', permission: 'quarries.manage' },
      { label: 'Materials', href: '/admin/materials', icon: 'Layers', permission: 'materials.manage' },
      { label: 'Destinations', href: '/admin/destinations', icon: 'MapPin', permission: 'destinations.manage' },
      { label: 'Site Requests', href: '/admin/destination-requests', icon: 'MapPinned', permission: 'destinations.manage' },
    ],
  },
  {
    title: 'COMMERCIAL & PRICING',
    items: [
      { label: 'Pricing Center', href: '/admin/pricing', icon: 'Calculator', permission: 'pricing.view' },
      { label: 'Material Prices', href: '/admin/pricing/materials', icon: 'Coins', permission: 'pricing.manage' },
      { label: 'Haulage Tariffs', href: '/admin/pricing/haulage', icon: 'Truck', permission: 'pricing.manage' },
      { label: 'Customer Rates', href: '/admin/pricing/customers', icon: 'BadgePercent', permission: 'pricing.manage' },
      { label: 'Promotions', href: '/admin/pricing/promotions', icon: 'Sparkles', permission: 'pricing.manage' },
      { label: 'Discounts & Fuel', href: '/admin/pricing/discounts', icon: 'Percent', permission: 'pricing.manage' },
    ],
  },
  {
    title: 'FINANCE & SUB-LEDGER',
    items: [
      { label: 'Finance Command', href: '/admin/finance', icon: 'Banknote', permission: 'reports.view' },
      { label: 'Customer Accounts', href: '/admin/finance/accounts', icon: 'Wallet', permission: 'customers.view' },
      { label: 'Invoices', href: '/admin/finance/invoices', icon: 'Receipt', permission: 'requisitions.view' },
      { label: 'Payments & Transfers', href: '/admin/finance/payments', icon: 'CreditCard', permission: 'payments.confirm' },
      { label: 'Credit Facilities', href: '/admin/finance/credit', icon: 'BadgePercent', permission: 'customers.manage' },
      { label: 'Customer Statements', href: '/admin/finance/statements', icon: 'FileSpreadsheet', permission: 'reports.view' },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { label: 'Users & Roles', href: '/admin/users', icon: 'Users', permission: 'users.manage' },
      { label: 'Role Matrix', href: '/admin/roles', icon: 'ShieldCheck', permission: 'users.manage' },
      { label: 'Audit Trail', href: '/admin/audit', icon: 'History', permission: 'reports.view' },
      { label: 'Settings', href: '/admin/settings', icon: 'Settings', permission: 'settings.manage' },
    ],
  },
];

export const FOOTER_LINKS = {
  company: [
    { label: 'About AR Multiventures', href: '/#about' },
    { label: 'Quarry Network', href: '/#materials' },
    { label: 'Haulage Logistics', href: '/#haulage' },
    { label: 'Contact Us', href: '/#contact' },
  ],
  services: [
    { label: 'Granite Supply', href: '/#services' },
    { label: 'Quarry Direct Requisition', href: '/#services' },
    { label: 'Truck Haulage', href: '/#services' },
    { label: 'Loading & Dispatch', href: '/#services' },
  ],
  portal: [
    { label: 'Customer Portal', href: '/app' },
    { label: 'Submit Requisition', href: '/app/requisitions/new' },
    { label: 'Track Delivery', href: '/app/orders' },
    { label: 'Billing & Invoices', href: '/app/invoices' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Supply', href: '#' },
    { label: 'Safety & Compliance', href: '#' },
  ],
} as const;
