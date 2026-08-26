-- ============================================================================
-- AR MULTIVENTURES — MIGRATION 023: PHASE 7 RLS & PRIVATE STORAGE POLICIES
-- ============================================================================

-- 1. ENABLE RLS ON ALL PHASE 7 TABLES
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE truck_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE truck_maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_truck_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_weighbridge_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_proof_of_delivery ENABLE ROW LEVEL SECURITY;

-- 2. STAFF POLICIES (Full fleet & operations access for internal staff)
CREATE POLICY "Staff can view all trucks" ON trucks
    FOR SELECT TO authenticated
    USING (is_staff(auth.uid()));

CREATE POLICY "Staff can manage trucks" ON trucks
    FOR ALL TO authenticated
    USING (is_staff(auth.uid()))
    WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can view truck documents" ON truck_documents
    FOR ALL TO authenticated
    USING (is_staff(auth.uid()))
    WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can view and manage maintenance" ON truck_maintenance_records
    FOR ALL TO authenticated
    USING (is_staff(auth.uid()))
    WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can view all drivers" ON drivers
    FOR SELECT TO authenticated
    USING (is_staff(auth.uid()));

CREATE POLICY "Staff can manage drivers" ON drivers
    FOR ALL TO authenticated
    USING (is_staff(auth.uid()))
    WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can view driver documents" ON driver_documents
    FOR ALL TO authenticated
    USING (is_staff(auth.uid()))
    WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can view driver assignments" ON driver_truck_assignments
    FOR ALL TO authenticated
    USING (is_staff(auth.uid()))
    WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can view all delivery trips" ON delivery_trips
    FOR ALL TO authenticated
    USING (is_staff(auth.uid()))
    WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can view all weighbridge records" ON trip_weighbridge_records
    FOR ALL TO authenticated
    USING (is_staff(auth.uid()))
    WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can view all POD records" ON trip_proof_of_delivery
    FOR ALL TO authenticated
    USING (is_staff(auth.uid()))
    WITH CHECK (is_staff(auth.uid()));

-- 3. CUSTOMER POLICIES (Strict isolation: Customers view only own delivery trips & PODs)
CREATE POLICY "Customers can view own delivery trips" ON delivery_trips
    FOR SELECT TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id FROM customer_users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Customers can view own trip weighbridge" ON trip_weighbridge_records
    FOR SELECT TO authenticated
    USING (
        trip_id IN (
            SELECT id FROM delivery_trips WHERE customer_id IN (
                SELECT customer_id FROM customer_users WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Customers can view own trip POD" ON trip_proof_of_delivery
    FOR SELECT TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id FROM customer_users WHERE user_id = auth.uid()
        )
    );

-- 4. DRIVER POLICIES (Drivers view assigned trips only)
CREATE POLICY "Drivers can view assigned trips" ON delivery_trips
    FOR SELECT TO authenticated
    USING (
        driver_id IN (
            SELECT id FROM drivers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Drivers can view own profile" ON drivers
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- 5. PRIVATE STORAGE BUCKETS CONFIGURATION
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('weighbridge-tickets', 'weighbridge-tickets', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
    ('pod-signatures', 'pod-signatures', FALSE, 5242880, ARRAY['image/png', 'image/jpeg', 'image/svg+xml']),
    ('pod-photos', 'pod-photos', FALSE, 10485760, ARRAY['image/jpeg', 'image/png']),
    ('fleet-documents', 'fleet-documents', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS
CREATE POLICY "Staff can manage weighbridge tickets storage" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'weighbridge-tickets' AND is_staff(auth.uid()))
    WITH CHECK (bucket_id = 'weighbridge-tickets' AND is_staff(auth.uid()));

CREATE POLICY "Authenticated users can upload pod signatures" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'pod-signatures');

CREATE POLICY "Authenticated users can view pod signatures" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'pod-signatures');

CREATE POLICY "Authenticated users can upload pod photos" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'pod-photos');

CREATE POLICY "Authenticated users can view pod photos" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'pod-photos');

CREATE POLICY "Staff can manage fleet documents storage" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'fleet-documents' AND is_staff(auth.uid()))
    WITH CHECK (bucket_id = 'fleet-documents' AND is_staff(auth.uid()));
