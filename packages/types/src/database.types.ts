export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole =
  | 'SUPER_ADMIN'
  | 'MANAGEMENT'
  | 'SALES'
  | 'ACCOUNTS'
  | 'OPERATIONS'
  | 'QUARRY_OFFICER'
  | 'DISPATCHER'
  | 'CUSTOMER';

export type CustomerType = 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT' | 'PARTNER';

export type CustomerStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export type TransportationOption = 'SELF_PICKUP' | 'SUPPLY_AND_HAULAGE' | 'HAULAGE_ONLY';

export type OrderStatusEnum =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'LOADING_SCHEDULED'
  | 'LOADING'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'ON_HOLD';

export type PaymentStatusEnum =
  | 'UNPAID'
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type DestinationRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'TIERED_VOLUME';

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          code: string;
          slug: string;
          tax_id: string | null;
          rc_number: string | null;
          contact_email: string;
          contact_phone: string;
          address: string | null;
          currency: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          slug: string;
          tax_id?: string | null;
          rc_number?: string | null;
          contact_email: string;
          contact_phone: string;
          address?: string | null;
          currency?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      branches: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          code: string;
          address: string | null;
          city: string;
          state: string;
          contact_phone: string | null;
          contact_email: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          code: string;
          address?: string | null;
          city: string;
          state: string;
          contact_phone?: string | null;
          contact_email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['branches']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string | null;
          branch_id: string | null;
          first_name: string;
          last_name: string;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          is_super_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          branch_id?: string | null;
          first_name: string;
          last_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          is_super_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      roles: {
        Row: {
          id: string;
          organization_id: string | null;
          code: string;
          name: string;
          description: string | null;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          code: string;
          name: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['roles']['Insert']>;
      };
      permissions: {
        Row: {
          id: string;
          code: string;
          category: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          category: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['permissions']['Insert']>;
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          organization_id: string;
          assigned_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          organization_id: string;
          assigned_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_roles']['Insert']>;
      };
      quarries: {
        Row: {
          id: string;
          organization_id: string;
          code: string;
          name: string;
          location_address: string;
          city: string;
          state: string;
          region: string;
          latitude: number | null;
          longitude: number | null;
          contact_person: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          loading_capacity_tonnes_per_day: number;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          code: string;
          name: string;
          location_address: string;
          city: string;
          state: string;
          region: string;
          latitude?: number | null;
          longitude?: number | null;
          contact_person?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          loading_capacity_tonnes_per_day?: number;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quarries']['Insert']>;
      };
      materials: {
        Row: {
          id: string;
          organization_id: string;
          code: string;
          name: string;
          category: 'granite' | 'dust' | 'sand' | 'hardcore';
          specification: string;
          description: string | null;
          unit: string;
          density_ton_per_cbm: number | null;
          min_order_quantity: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          code: string;
          name: string;
          category: 'granite' | 'dust' | 'sand' | 'hardcore';
          specification: string;
          description?: string | null;
          unit?: string;
          density_ton_per_cbm?: number | null;
          min_order_quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['materials']['Insert']>;
      };
      quarry_materials: {
        Row: {
          id: string;
          quarry_id: string;
          material_id: string;
          is_available: boolean;
          current_stock_estimate_tonnes: number | null;
          daily_extraction_capacity_tonnes: number | null;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quarry_id: string;
          material_id: string;
          is_available?: boolean;
          current_stock_estimate_tonnes?: number | null;
          daily_extraction_capacity_tonnes?: number | null;
          notes?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quarry_materials']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          organization_id: string;
          account_number: string;
          customer_type: CustomerType;
          company_name: string;
          trade_name: string | null;
          rc_number: string | null;
          tax_id: string | null;
          phone: string;
          email: string;
          credit_limit: number;
          payment_terms_days: number;
          status: CustomerStatus;
          preferred_quarry_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          account_number?: string;
          customer_type?: CustomerType;
          company_name: string;
          trade_name?: string | null;
          rc_number?: string | null;
          tax_id?: string | null;
          phone: string;
          email: string;
          credit_limit?: number;
          payment_terms_days?: number;
          status?: CustomerStatus;
          preferred_quarry_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      customer_users: {
        Row: {
          id: string;
          customer_id: string;
          user_id: string;
          role_in_customer: string;
          is_primary_contact: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          user_id: string;
          role_in_customer?: string;
          is_primary_contact?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customer_users']['Insert']>;
      };
      customer_addresses: {
        Row: {
          id: string;
          customer_id: string;
          label: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          postal_code: string | null;
          landmark: string | null;
          latitude: number | null;
          longitude: number | null;
          site_contact_person: string | null;
          site_contact_phone: string | null;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          label: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          postal_code?: string | null;
          landmark?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          site_contact_person?: string | null;
          site_contact_phone?: string | null;
          is_default?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customer_addresses']['Insert']>;
      };
      destinations: {
        Row: {
          id: string;
          organization_id: string;
          code: string;
          name: string;
          state: string;
          city: string;
          area_zone: string | null;
          address_description: string | null;
          latitude: number | null;
          longitude: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          code: string;
          name: string;
          state: string;
          city: string;
          area_zone?: string | null;
          address_description?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['destinations']['Insert']>;
      };
      destination_requests: {
        Row: {
          id: string;
          organization_id: string;
          customer_id: string;
          requested_name: string;
          state: string;
          city: string;
          full_address: string;
          landmark: string | null;
          latitude: number | null;
          longitude: number | null;
          site_contact_name: string;
          site_contact_phone: string;
          status: DestinationRequestStatus;
          rejection_reason: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          customer_id: string;
          requested_name: string;
          state: string;
          city: string;
          full_address: string;
          landmark?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          site_contact_name: string;
          site_contact_phone: string;
          status?: DestinationRequestStatus;
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['destination_requests']['Insert']>;
      };
      truck_types: {
        Row: {
          id: string;
          organization_id: string;
          code: string;
          name: string;
          capacity_tonnes: number;
          axle_configuration: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          code: string;
          name: string;
          capacity_tonnes: number;
          axle_configuration?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['truck_types']['Insert']>;
      };
      material_prices: {
        Row: {
          id: string;
          organization_id: string;
          quarry_id: string;
          material_id: string;
          price_per_unit: number;
          currency: string;
          effective_from: string;
          effective_to: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          quarry_id: string;
          material_id: string;
          price_per_unit: number;
          currency?: string;
          effective_from?: string;
          effective_to?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['material_prices']['Insert']>;
      };
      haulage_rates: {
        Row: {
          id: string;
          organization_id: string;
          quarry_id: string;
          destination_id: string;
          truck_type_id: string;
          rate_per_trip: number;
          rate_per_tonne: number;
          minimum_tonnage: number;
          currency: string;
          effective_from: string;
          effective_to: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          quarry_id: string;
          destination_id: string;
          truck_type_id: string;
          rate_per_trip?: number;
          rate_per_tonne?: number;
          minimum_tonnage?: number;
          currency?: string;
          effective_from?: string;
          effective_to?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['haulage_rates']['Insert']>;
      };
      loading_charges: {
        Row: {
          id: string;
          organization_id: string;
          quarry_id: string;
          material_id: string | null;
          charge_per_tonne: number;
          charge_per_trip: number;
          currency: string;
          effective_from: string;
          effective_to: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          quarry_id: string;
          material_id?: string | null;
          charge_per_tonne?: number;
          charge_per_trip?: number;
          currency?: string;
          effective_from?: string;
          effective_to?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['loading_charges']['Insert']>;
      };
      customer_prices: {
        Row: {
          id: string;
          organization_id: string;
          customer_id: string;
          quarry_id: string;
          material_id: string;
          special_price_per_unit: number;
          currency: string;
          effective_from: string;
          effective_to: string | null;
          notes: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          customer_id: string;
          quarry_id: string;
          material_id: string;
          special_price_per_unit: number;
          currency?: string;
          effective_from?: string;
          effective_to?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customer_prices']['Insert']>;
      };
      promotional_prices: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          quarry_id: string | null;
          material_id: string | null;
          promo_price_per_unit: number | null;
          discount_percentage: number | null;
          currency: string;
          effective_from: string;
          effective_to: string;
          notes: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          quarry_id?: string | null;
          material_id?: string | null;
          promo_price_per_unit?: number | null;
          discount_percentage?: number | null;
          currency?: string;
          effective_from?: string;
          effective_to: string;
          notes?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['promotional_prices']['Insert']>;
      };
      discount_rules: {
        Row: {
          id: string;
          organization_id: string;
          code: string;
          name: string;
          discount_type: DiscountType;
          value: number;
          min_quantity_tonnes: number;
          max_quantity_tonnes: number | null;
          effective_from: string;
          effective_to: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          code: string;
          name: string;
          discount_type?: DiscountType;
          value: number;
          min_quantity_tonnes?: number;
          max_quantity_tonnes?: number | null;
          effective_from?: string;
          effective_to?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['discount_rules']['Insert']>;
      };
      requisitions: {
        Row: {
          id: string;
          organization_id: string;
          requisition_number: string;
          customer_id: string;
          customer_address_id: string | null;
          destination_id: string | null;
          quarry_id: string;
          transportation_option: TransportationOption;
          truck_type_id: string | null;
          status: OrderStatusEnum;
          payment_status: PaymentStatusEnum;
          requested_delivery_date: string;
          destination_name_cache: string;
          destination_address_cache: string;
          notes: string | null;
          special_instructions: string | null;
          material_amount_snapshot: number;
          loading_amount_snapshot: number;
          haulage_amount_snapshot: number;
          other_charges_snapshot: number;
          discount_amount_snapshot: number;
          total_amount_snapshot: number;
          currency: string;
          created_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          submitted_at: string | null;
          cancelled_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          requisition_number?: string;
          customer_id: string;
          customer_address_id?: string | null;
          destination_id?: string | null;
          quarry_id: string;
          transportation_option?: TransportationOption;
          truck_type_id?: string | null;
          status?: OrderStatusEnum;
          payment_status?: PaymentStatusEnum;
          requested_delivery_date: string;
          destination_name_cache: string;
          destination_address_cache: string;
          notes?: string | null;
          special_instructions?: string | null;
          material_amount_snapshot?: number;
          loading_amount_snapshot?: number;
          haulage_amount_snapshot?: number;
          other_charges_snapshot?: number;
          discount_amount_snapshot?: number;
          total_amount_snapshot?: number;
          currency?: string;
          created_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          submitted_at?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['requisitions']['Insert']>;
      };
      requisition_items: {
        Row: {
          id: string;
          requisition_id: string;
          material_id: string;
          quantity: number;
          unit: string;
          unit_price_snapshot: number;
          line_total: number;
          loaded_quantity: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requisition_id: string;
          material_id: string;
          quantity: number;
          unit?: string;
          unit_price_snapshot?: number;
          line_total?: number;
          loaded_quantity?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['requisition_items']['Insert']>;
      };
      requisition_status_history: {
        Row: {
          id: string;
          requisition_id: string;
          previous_status: OrderStatusEnum | null;
          new_status: OrderStatusEnum;
          changed_by: string | null;
          changed_at: string;
          reason: string | null;
        };
        Insert: {
          id?: string;
          requisition_id: string;
          previous_status?: OrderStatusEnum | null;
          new_status: OrderStatusEnum;
          changed_by?: string | null;
          changed_at?: string;
          reason?: string | null;
        };
        Update: Partial<Database['public']['Tables']['requisition_status_history']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          actor_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          actor_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          organization_id: string;
          recipient_user_id: string;
          customer_id: string | null;
          type: string;
          title: string;
          message: string;
          channel: NotificationChannel;
          related_entity_type: string | null;
          related_entity_id: string | null;
          action_url: string | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          recipient_user_id: string;
          customer_id?: string | null;
          type: string;
          title: string;
          message: string;
          channel?: NotificationChannel;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          action_url?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
    Functions: {
      calculate_requisition_price: {
        Args: {
          p_organization_id: string;
          p_customer_id: string | null;
          p_quarry_id: string;
          p_material_id: string;
          p_quantity: number;
          p_transportation_option: TransportationOption;
          p_truck_type_id?: string | null;
          p_destination_id?: string | null;
          p_delivery_date?: string | null;
        };
        Returns: Json;
      };
      submit_requisition: {
        Args: {
          p_requisition_id: string;
          p_expected_total?: number | null;
          p_notes?: string | null;
        };
        Returns: Json;
      };
      transition_requisition_status: {
        Args: {
          p_requisition_id: string;
          p_target_status: OrderStatusEnum;
          p_reason?: string | null;
        };
        Returns: Json;
      };
    };
  };
}

