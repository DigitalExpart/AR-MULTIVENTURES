-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 012: DEVELOPMENT SEED DATA
-- Safe Development Baseline Data for Quarries, Materials, Truck Types, Roles & Permissions
-- ============================================================================

DO $$
DECLARE
    org_id UUID;
    branch_lagos_id UUID;
    branch_abk_id UUID;
    role_super_admin UUID;
    role_mgmt UUID;
    role_sales UUID;
    role_accounts UUID;
    role_ops UUID;
    role_quarry UUID;
    role_dispatcher UUID;
    role_customer UUID;

    -- Quarry IDs
    qry_abk UUID := '11111111-1111-4111-a111-111111111111';
    qry_ish UUID := '22222222-2222-4222-a222-222222222222';
    qry_ibd UUID := '33333333-3333-4333-a333-333333333333';
    qry_sgm UUID := '44444444-4444-4444-a444-444444444444';

    -- Material IDs
    mat_34 UUID := 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';
    mat_12 UUID := 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    mat_10 UUID := 'cccccccc-cccc-4ccc-cccc-cccccccccccc';
    mat_20 UUID := 'dddddddd-dddd-4ddd-dddd-dddddddddddd';
    mat_30 UUID := 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee';
    mat_sd UUID := 'ffffffff-ffff-4fff-ffff-ffffffffffff';
    mat_qd UUID := '00000000-0000-4000-a000-000000000001';
    mat_ss UUID := '00000000-0000-4000-a000-000000000002';

    -- Truck Type IDs
    trk_30t UUID := '99999999-9999-4999-a999-999999999930';
    trk_45t UUID := '99999999-9999-4999-a999-999999999945';
    trk_20t UUID := '99999999-9999-4999-a999-999999999920';

    -- Destination IDs
    dst_lekki UUID := '88888888-8888-4888-a888-888888888801';
    dst_vi UUID := '88888888-8888-4888-a888-888888888802';
    dst_epe UUID := '88888888-8888-4888-a888-888888888803';
    dst_ikeja UUID := '88888888-8888-4888-a888-888888888804';
BEGIN
    -- 1. Primary Organization: AR Multiventures
    INSERT INTO public.organizations (
        name, code, slug, tax_id, rc_number, contact_email, contact_phone, address
    ) VALUES (
        'AR Multiventures Nigeria Limited',
        'ARM-HQ',
        'ar-multiventures',
        'TIN-10928374-0001',
        'RC-1849204',
        'info@armultiventures.com',
        '+234 800 AR MULTI',
        'Victoria Island & Quarry Operational Hubs, Lagos, Nigeria'
    ) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO org_id;

    -- 2. Branches
    INSERT INTO public.branches (organization_id, name, code, city, state, address)
    VALUES
        (org_id, 'Lagos Head Office & Dispatch Hub', 'BR-LAG', 'Victoria Island', 'Lagos', 'Plot 14B, Kofo Abayomi Street, Victoria Island, Lagos'),
        (org_id, 'Abeokuta Quarry Operations Base', 'BR-ABK', 'Abeokuta', 'Ogun', 'Abeokuta North Quarry Road, Ogun State')
    ON CONFLICT (organization_id, code) DO NOTHING;

    -- 3. System Roles
    INSERT INTO public.roles (organization_id, code, name, description, is_system)
    VALUES
        (org_id, 'SUPER_ADMIN', 'Super Administrator', 'Full platform operational, security and tenant access', true),
        (org_id, 'MANAGEMENT', 'Executive Management', 'Executive visibility, financial reports, operational control', true),
        (org_id, 'SALES', 'Sales & Procurement Officer', 'Customer management, requisition pricing and order setup', true),
        (org_id, 'ACCOUNTS', 'Accounts & Finance', 'Payment verification, customer credit limits, invoice audits', true),
        (org_id, 'OPERATIONS', 'Logistics & Operations Manager', 'Fleet routing, quarry loading bay management, fulfillment', true),
        (org_id, 'QUARRY_OFFICER', 'Quarry Weighbridge Officer', 'Quarry scale management, loading tickets, stock monitoring', true),
        (org_id, 'DISPATCHER', 'Haulage Fleet Dispatcher', 'Driver assignment, truck tracking, transit checkpoints', true),
        (org_id, 'CUSTOMER', 'Contractor / Customer', 'Material requisitions, delivery tracking, billing review', true)
    ON CONFLICT (code, organization_id) DO NOTHING;

    -- 4. Permissions Catalog
    INSERT INTO public.permissions (code, category, name, description)
    VALUES
        ('customers.view', 'customers', 'View Customers', 'View customer company profiles and accounts'),
        ('customers.manage', 'customers', 'Manage Customers', 'Create, update, and manage customer accounts and credit'),
        ('requisitions.view', 'requisitions', 'View Requisitions', 'View requisitions and order details'),
        ('requisitions.create', 'requisitions', 'Create Requisition', 'Create new material supply requisitions'),
        ('requisitions.approve', 'requisitions', 'Approve Requisition', 'Approve submitted requisitions for operations'),
        ('requisitions.cancel', 'requisitions', 'Cancel Requisition', 'Cancel requisitions prior to dispatch'),
        ('pricing.view', 'pricing', 'View Pricing', 'View base prices, haulage tariffs, and loading charges'),
        ('pricing.manage', 'pricing', 'Manage Pricing', 'Update material prices, haulage matrices, and customer rates'),
        ('payments.view', 'payments', 'View Payments', 'View transaction history and payment records'),
        ('payments.confirm', 'payments', 'Confirm Payments', 'Verify and confirm incoming payments'),
        ('fleet.view', 'fleet', 'View Fleet', 'View truck types, fleet capacity, and driver allocations'),
        ('fleet.manage', 'fleet', 'Manage Fleet', 'Assign vehicles, manage haulier registrations'),
        ('loading.view', 'loading', 'View Loading', 'View quarry loading queues and weighbridge tickets'),
        ('loading.manage', 'loading', 'Manage Loading', 'Authorize quarry bay loading and weighbridge sign-offs'),
        ('delivery.view', 'delivery', 'View Deliveries', 'View delivery status and route checkpoints'),
        ('delivery.manage', 'delivery', 'Manage Deliveries', 'Update delivery tracking and site sign-offs'),
        ('reports.view', 'reports', 'View Reports', 'Access analytics and audit log reports'),
        ('users.manage', 'users', 'Manage Users', 'Manage user profiles and role assignments')
    ON CONFLICT (code) DO NOTHING;

    -- 5. Role-Permission Mappings for CUSTOMER role
    SELECT id INTO role_customer FROM public.roles WHERE code = 'CUSTOMER' AND organization_id = org_id LIMIT 1;
    IF role_customer IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT role_customer, id FROM public.permissions
        WHERE code IN ('requisitions.view', 'requisitions.create', 'pricing.view', 'payments.view', 'delivery.view')
        ON CONFLICT DO NOTHING;
    END IF;

    -- 6. Master Quarries
    INSERT INTO public.quarries (
        id, organization_id, code, name, location_address, city, state, region, latitude, longitude, loading_capacity_tonnes_per_day
    ) VALUES
        (qry_abk, org_id, 'QRY-ABK-01', 'Abeokuta North Quarry Complex', 'Abeokuta North Expressway', 'Abeokuta', 'Ogun', 'South West', 7.1475000, 3.3619000, 5000.00),
        (qry_ish, org_id, 'QRY-ISH-02', 'Ishiagu Granite Quarry Hub', 'Ishiagu Industrial Quarry Belt, Ivo LGA', 'Ishiagu', 'Ebonyi', 'South East', 5.9524000, 7.5684000, 3500.00),
        (qry_ibd, org_id, 'QRY-IBD-03', 'Ibadan Central Rock & Aggregate Works', 'Oluyole Industrial Area, Ibadan', 'Ibadan', 'Oyo', 'South West', 7.3775000, 3.9470000, 4200.00),
        (qry_sgm, org_id, 'QRY-SGM-04', 'Sagamu Interchange Material Depot & Quarry', 'Sagamu-Benin Expressway', 'Sagamu', 'Ogun', 'South West', 6.8485000, 3.6465000, 6000.00)
    ON CONFLICT (organization_id, code) DO NOTHING;

    -- 7. Master Materials Catalog
    INSERT INTO public.materials (
        id, organization_id, code, name, category, specification, description, unit, min_order_quantity
    ) VALUES
        (mat_34, org_id, 'GR-34', '3/4" Granite Aggregate', 'granite', '19mm - 20mm clean aggregate', 'Standard structural concrete aggregate for columns, slabs, and heavy foundations.', 'tonnes', 10.00),
        (mat_12, org_id, 'GR-12', '1/2" Granite Aggregate', 'granite', '12.5mm crushed aggregate', 'Precast concrete units, thin-slab elements, and fine industrial flooring.', 'tonnes', 10.00),
        (mat_10, org_id, 'GR-10', '10mm Granite Aggregate', 'granite', '10mm screened aggregate', 'Asphalt mix formulation, precast kerbs, and specialty screeding.', 'tonnes', 10.00),
        (mat_20, org_id, 'GR-20', '20mm Granite Aggregate', 'granite', '20mm structural granite', 'Heavy civil construction, road bases, and mass structural framing.', 'tonnes', 10.00),
        (mat_30, org_id, 'GR-30', '30mm Granite Aggregate', 'granite', '30mm coarse aggregate', 'Retaining walls, mass concrete footings, and drainage ballasts.', 'tonnes', 10.00),
        (mat_sd, org_id, 'SD-01', 'Stone Dust / Rock Dust', 'dust', '0-5mm quarry crushing dust', 'Interlocking paving stones, mortar bedding, and block manufacturing.', 'tonnes', 10.00),
        (mat_qd, org_id, 'QD-01', 'Quarry Waste Dust', 'dust', 'Unscreened quarry byproduct', 'Cost-effective site filling, leveling, and road sub-base compaction.', 'tonnes', 10.00),
        (mat_ss, org_id, 'SS-01', 'Sharp Sand (Washed)', 'sand', 'Washed coarse construction sand', 'Clean structural plastering, block casting, and concrete mixing.', 'tonnes', 10.00)
    ON CONFLICT (organization_id, code) DO NOTHING;

    -- 8. Quarry-Materials Availability Matrix
    INSERT INTO public.quarry_materials (quarry_id, material_id, is_available, current_stock_estimate_tonnes)
    VALUES
        (qry_abk, mat_34, true, 8500.00),
        (qry_abk, mat_12, true, 4200.00),
        (qry_abk, mat_20, true, 12000.00),
        (qry_abk, mat_sd, true, 6000.00),
        (qry_ish, mat_20, true, 9500.00),
        (qry_ish, mat_30, true, 5000.00),
        (qry_ibd, mat_34, true, 7000.00),
        (qry_ibd, mat_ss, true, 4000.00),
        (qry_sgm, mat_20, true, 15000.00),
        (qry_sgm, mat_sd, true, 8000.00)
    ON CONFLICT (quarry_id, material_id) DO NOTHING;

    -- 9. Master Truck Types
    INSERT INTO public.truck_types (id, organization_id, code, name, capacity_tonnes, axle_configuration)
    VALUES
        (trk_30t, org_id, 'TRK-30T', '30 Tonne Heavy Tipper (10-Wheeler)', 30.00, '6x4 10-Wheeler'),
        (trk_45t, org_id, 'TRK-45T', '45 Tonne Articulated Trailer', 45.00, '8x4 Articulated'),
        (trk_20t, org_id, 'TRK-20T', '20 Tonne Medium Tipper', 20.00, '4x2 6-Wheeler')
    ON CONFLICT (organization_id, code) DO NOTHING;

    -- 10. Master Destinations
    INSERT INTO public.destinations (id, organization_id, code, name, state, city, area_zone, address_description)
    VALUES
        (dst_lekki, org_id, 'DST-LEK-01', 'Lekki Coastal & Phase 1 Zone', 'Lagos', 'Lekki', 'Lekki Corridor', 'Lekki Phase 1, Coastal Road & Freedom Way axis'),
        (dst_vi, org_id, 'DST-VI-02', 'Victoria Island Commercial Hub', 'Lagos', 'Victoria Island', 'Lagos Island Zone', 'Ahmadu Bello, Kofo Abayomi, Adeola Odeku axis'),
        (dst_epe, org_id, 'DST-EPE-03', 'Epe Expressway Construction Corridor', 'Lagos', 'Epe', 'Epe Corridor', 'KM 10-40 Lekki-Epe Expressway construction zone'),
        (dst_ikeja, org_id, 'DST-IKJ-04', 'Ikeja Industrial Zone', 'Lagos', 'Ikeja', 'Ikeja / Mainland', 'Allen Avenue, Commercial Avenue, Oba Akran axis')
    ON CONFLICT (organization_id, code) DO NOTHING;

    -- 11. Baseline Material Sourcing Prices (Sample Dev Rates)
    INSERT INTO public.material_prices (organization_id, quarry_id, material_id, price_per_unit, currency)
    VALUES
        (org_id, qry_abk, mat_34, 8500.00, 'NGN'),
        (org_id, qry_abk, mat_12, 9000.00, 'NGN'),
        (org_id, qry_abk, mat_20, 8000.00, 'NGN'),
        (org_id, qry_abk, mat_sd, 4000.00, 'NGN'),
        (org_id, qry_ish, mat_20, 7800.00, 'NGN'),
        (org_id, qry_ibd, mat_34, 8400.00, 'NGN'),
        (org_id, qry_sgm, mat_20, 8200.00, 'NGN')
    ON CONFLICT DO NOTHING;

    -- 12. Baseline Haulage Tariffs
    INSERT INTO public.haulage_rates (organization_id, quarry_id, destination_id, truck_type_id, rate_per_trip, rate_per_tonne, minimum_tonnage)
    VALUES
        (org_id, qry_abk, dst_lekki, trk_30t, 85000.00, 2833.33, 30.00),
        (org_id, qry_abk, dst_vi, trk_30t, 80000.00, 2666.67, 30.00),
        (org_id, qry_ibd, dst_epe, trk_30t, 140000.00, 2333.33, 30.00),
        (org_id, qry_sgm, dst_ikeja, trk_30t, 55000.00, 1833.33, 30.00)
    ON CONFLICT DO NOTHING;

    -- 13. Baseline Loading Charges
    INSERT INTO public.loading_charges (organization_id, quarry_id, charge_per_tonne, charge_per_trip)
    VALUES
        (org_id, qry_abk, 500.00, 15000.00),
        (org_id, qry_ish, 450.00, 13500.00),
        (org_id, qry_ibd, 500.00, 15000.00),
        (org_id, qry_sgm, 500.00, 15000.00)
    ON CONFLICT DO NOTHING;

    -- 14. Promotional Sourcing Prices (Sample Dev Fixture)
    INSERT INTO public.promotional_prices (
        organization_id, name, quarry_id, material_id, promo_price_per_unit, currency, effective_from, effective_to, notes
    ) VALUES (
        org_id, 'South-West Infrastructure Stimulus Promo', qry_abk, mat_34, 8100.00, 'NGN', now() - INTERVAL '1 day', now() + INTERVAL '30 days', 'Special promotional price for 3/4 granite from Abeokuta'
    ) ON CONFLICT DO NOTHING;

    -- 15. Volume Tiered Discount Rules (Sample Dev Fixture)
    INSERT INTO public.discount_rules (
        organization_id, code, name, discount_type, value, min_quantity_tonnes, max_quantity_tonnes, effective_from, effective_to
    ) VALUES
        (org_id, 'DISC-VOL-60T', 'High Volume Tier (>=60T)', 'PERCENTAGE', 3.00, 60.00, NULL, now() - INTERVAL '30 days', now() + INTERVAL '365 days'),
        (org_id, 'DISC-VOL-100T', 'Mega Commercial Tier (>=100T)', 'PERCENTAGE', 5.00, 100.00, NULL, now() - INTERVAL '30 days', now() + INTERVAL '365 days')
    ON CONFLICT DO NOTHING;

    -- 16. Macro Fuel Adjustment Surcharge (Sample Dev Fixture)
    INSERT INTO public.fuel_adjustments (
        organization_id, percentage_surcharge, effective_from, effective_to, notes
    ) VALUES (
        org_id, 2.50, now() - INTERVAL '10 days', now() + INTERVAL '60 days', 'Standard quarterly logistics fuel adjustment'
    ) ON CONFLICT DO NOTHING;

END $$;
