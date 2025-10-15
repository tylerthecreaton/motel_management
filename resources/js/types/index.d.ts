import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href?: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[]; // Support nested items for submenu
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

// Room Types
export interface Room {
    id: number;
    name: string;
    type: string;
    price_per_month: string;
    status: 'available' | 'occupied' | 'maintenance';
    description: string | null;
    image_path: string | null;
    image_url: string | null;
    amenities: string[] | null;
    created_at: string;
    updated_at: string;
    // Relationships
    rentals?: Rental[];
}

// Tenant Information Types
export interface TenantInformation {
    id: number;
    rental_id: number;
    // Personal Information
    first_name: string;
    last_name: string;
    id_card_number: string;
    date_of_birth: string;
    // Address
    current_address: string;
    province: string;
    district: string;
    sub_district: string;
    postal_code: string;
    // Contact Information
    phone_number: string;
    email: string | null;
    line_id: string | null;
    // Emergency Contact
    emergency_contact_name: string;
    emergency_contact_relationship: string;
    emergency_contact_phone: string;
    // Occupation
    occupation: string;
    workplace: string | null;
    monthly_income: string | null;
    // Documents
    id_card_copy_path: string | null;
    photo_path: string | null;
    additional_documents: string[] | null;
    created_at: string;
    updated_at: string;
}

// Rental/Contract Types
export interface Rental {
    id: number;
    user_id: number;
    room_id: number;
    start_date: string;
    end_date: string;
    status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
    total_price: string;
    // Contract Information
    contract_number: string | null;
    contract_date: string | null;
    deposit_amount: string;
    advance_payment: string;
    monthly_rent: string;
    special_conditions: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    // Relationships
    room?: Room;
    user?: User;
    tenant_information?: TenantInformation;
}

// Form Data Types
export interface BookingFormData {
    room_id: number;
    start_date: string;
    end_date: string;
    deposit_amount: number;
    advance_payment: number;
    special_conditions?: string;
    notes?: string;
    tenant: TenantFormData;
}

export interface TenantFormData {
    first_name: string;
    last_name: string;
    id_card_number: string;
    date_of_birth: string;
    current_address: string;
    province: string;
    district: string;
    sub_district: string;
    postal_code: string;
    phone_number: string;
    email?: string;
    line_id?: string;
    emergency_contact_name: string;
    emergency_contact_relationship: string;
    emergency_contact_phone: string;
    occupation: string;
    workplace?: string;
    monthly_income?: number;
    id_card_copy?: File;
    photo?: File;
}

export interface UserFormData {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    roles?: number[];
}

// Role Types
export interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    // Relationships
    users?: User[];
    users_count?: number;
    permissions?: Permission[];
}

// Permission Types  
export interface Permission {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    group: string | null;
    created_at: string;
    updated_at: string;
    // Relationships
    roles?: Role[];
}
