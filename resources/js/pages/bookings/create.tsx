import { useState, useEffect, FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Room, BookingFormData } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
    roomId: string | number;
}

export default function BookingCreate({ roomId }: Props) {
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Rooms', href: '/rooms' },
        { title: 'Create Contract', href: `/bookings/create/${roomId}` },
    ];

    // Form state
    const [formData, setFormData] = useState<BookingFormData>({
        room_id: parseInt(roomId.toString()),
        start_date: '',
        end_date: '',
        deposit_amount: 0,
        advance_payment: 0,
        special_conditions: '',
        notes: '',
        tenant: {
            first_name: '',
            last_name: '',
            id_card_number: '',
            date_of_birth: '',
            current_address: '',
            province: '',
            district: '',
            sub_district: '',
            postal_code: '',
            phone_number: '',
            email: '',
            line_id: '',
            emergency_contact_name: '',
            emergency_contact_relationship: '',
            emergency_contact_phone: '',
            occupation: '',
            workplace: '',
            monthly_income: undefined,
        },
    });

    // Fetch room details
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/rooms/${roomId}`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                    credentials: 'same-origin',
                });
                
                if (!response.ok) throw new Error('Failed to fetch room');
                
                const data = await response.json();
                setRoom(data.data);
            } catch (err) {
                setError('Failed to load room details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (roomId) {
            fetchRoom();
        }
    }, [roomId]);

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // ตรวจสอบว่ามี start_date และ end_date
            if (!formData.start_date) {
                // Scroll to start_date field
                document.getElementById('start_date')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                document.getElementById('start_date')?.focus();
                throw new Error('Please select a start date');
            }
            if (!formData.end_date) {
                // Scroll to start_date field (เพราะต้องเลือก start_date ก่อน)
                document.getElementById('start_date')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                document.getElementById('start_date')?.focus();
                throw new Error('End date is required. Please select a start date first.');
            }

            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie
                            .split('; ')
                            .find(row => row.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1] || ''
                    ),
                },
                credentials: 'same-origin',
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create booking');
            }

            // Redirect to bookings list using Inertia
            router.visit('/bookings', {
                onSuccess: () => {
                    // Success message will be shown on the bookings page
                }
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create booking');
            console.error('Booking error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle input changes
    const handleChange = (field: string, value: string | number | undefined) => {
        if (field.startsWith('tenant.')) {
            const tenantField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                tenant: {
                    ...prev.tenant,
                    [tenantField]: value,
                },
            }));
        } else {
            // ถ้าเปลี่ยน start_date ให้คำนวณ end_date อัตโนมัติ (1 ปีจาก start_date)
            if (field === 'start_date' && typeof value === 'string' && value) {
                const startDate = new Date(value);
                const endDate = new Date(startDate);
                endDate.setFullYear(endDate.getFullYear() + 1); // เพิ่ม 1 ปี
                
                const calculatedEndDate = endDate.toISOString().split('T')[0];
                
                console.log('Start Date:', value);
                console.log('Calculated End Date:', calculatedEndDate);
                
                setFormData(prev => ({
                    ...prev,
                    [field]: value,
                    end_date: calculatedEndDate, // ตั้งค่า end_date อัตโนมัติ
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [field]: value,
                }));
            }
        }
    };

    if (loading) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="Create Contract" />
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    if (!room) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="Error" />
                <div className="flex h-full items-center justify-center">
                    <Alert variant="destructive">
                        <AlertDescription>Room not found</AlertDescription>
                    </Alert>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Create Contract - ${room.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4 overflow-y-auto">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Rental Contract</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Fill in the details to create a rental contract for {room.name}
                    </p>
                </div>

                {/* Room Info Card */}
                <Card className="mb-2">
                    <CardHeader>
                        <CardTitle>Room Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Room Name</p>
                                <p className="font-semibold">{room.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                                <p className="font-semibold">{room.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Rent</p>
                                <p className="font-semibold text-blue-600">
                                    ฿{parseFloat(room.price_per_month).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                    room.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {room.status}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Booking Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contract Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contract Details</CardTitle>
                            <CardDescription>Rental period and payment information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="start_date" className={!formData.start_date ? 'text-blue-600 font-semibold' : ''}>
                                        Start Date * {!formData.start_date && '← Please select this first'}
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        required
                                        value={formData.start_date}
                                        onChange={(e) => handleChange('start_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={!formData.start_date ? 'border-blue-500 border-2' : ''}
                                    />
                                    <p className={`text-xs mt-1 ${!formData.start_date ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                                        {!formData.start_date 
                                            ? '👉 Select start date to auto-calculate end date' 
                                            : '✓ Start date selected'}
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor="end_date">End Date (Auto: 1 year from start) *</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        required
                                        value={formData.end_date || ''}
                                        readOnly
                                        className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                                        title="End date is automatically set to 1 year from start date"
                                        placeholder="Select start date first"
                                    />
                                    <p className={`text-xs mt-1 ${formData.end_date ? 'text-green-600' : 'text-amber-600'}`}>
                                        {formData.end_date 
                                            ? `✓ Contract ends: ${new Date(formData.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` 
                                            : '⚠ Please select start date first'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="deposit_amount">Deposit Amount (฿) *</Label>
                                    <Input
                                        id="deposit_amount"
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.deposit_amount}
                                        onChange={(e) => handleChange('deposit_amount', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="advance_payment">Advance Payment (฿) *</Label>
                                    <Input
                                        id="advance_payment"
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.advance_payment}
                                        onChange={(e) => handleChange('advance_payment', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="special_conditions">Special Conditions</Label>
                                <Textarea
                                    id="special_conditions"
                                    placeholder="Any special conditions or requirements..."
                                    value={formData.special_conditions}
                                    onChange={(e) => handleChange('special_conditions', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Additional notes..."
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tenant Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tenant Personal Information</CardTitle>
                            <CardDescription>Basic information about the tenant</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="first_name">First Name *</Label>
                                    <Input
                                        id="first_name"
                                        required
                                        value={formData.tenant.first_name}
                                        onChange={(e) => handleChange('tenant.first_name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="last_name">Last Name *</Label>
                                    <Input
                                        id="last_name"
                                        required
                                        value={formData.tenant.last_name}
                                        onChange={(e) => handleChange('tenant.last_name', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="id_card_number">ID Card Number (13 digits) *</Label>
                                    <Input
                                        id="id_card_number"
                                        required
                                        maxLength={13}
                                        pattern="[0-9]{13}"
                                        value={formData.tenant.id_card_number}
                                        onChange={(e) => handleChange('tenant.id_card_number', e.target.value)}
                                        placeholder="1234567890123"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        required
                                        value={formData.tenant.date_of_birth}
                                        onChange={(e) => handleChange('tenant.date_of_birth', e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Address Information</CardTitle>
                            <CardDescription>Current residential address</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="current_address">Current Address *</Label>
                                <Textarea
                                    id="current_address"
                                    required
                                    value={formData.tenant.current_address}
                                    onChange={(e) => handleChange('tenant.current_address', e.target.value)}
                                    placeholder="House number, street, etc."
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="sub_district">Sub-district *</Label>
                                    <Input
                                        id="sub_district"
                                        required
                                        value={formData.tenant.sub_district}
                                        onChange={(e) => handleChange('tenant.sub_district', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="district">District *</Label>
                                    <Input
                                        id="district"
                                        required
                                        value={formData.tenant.district}
                                        onChange={(e) => handleChange('tenant.district', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="province">Province *</Label>
                                    <Input
                                        id="province"
                                        required
                                        value={formData.tenant.province}
                                        onChange={(e) => handleChange('tenant.province', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="postal_code">Postal Code (5 digits) *</Label>
                                    <Input
                                        id="postal_code"
                                        required
                                        maxLength={5}
                                        pattern="[0-9]{5}"
                                        value={formData.tenant.postal_code}
                                        onChange={(e) => handleChange('tenant.postal_code', e.target.value)}
                                        placeholder="10110"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>Phone, email, and social media</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="phone_number">Phone Number *</Label>
                                    <Input
                                        id="phone_number"
                                        required
                                        maxLength={10}
                                        pattern="0[0-9]{9}"
                                        value={formData.tenant.phone_number}
                                        onChange={(e) => handleChange('tenant.phone_number', e.target.value)}
                                        placeholder="0812345678"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.tenant.email}
                                        onChange={(e) => handleChange('tenant.email', e.target.value)}
                                        placeholder="example@email.com"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="line_id">LINE ID</Label>
                                    <Input
                                        id="line_id"
                                        value={formData.tenant.line_id}
                                        onChange={(e) => handleChange('tenant.line_id', e.target.value)}
                                        placeholder="@lineid"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency Contact</CardTitle>
                            <CardDescription>Person to contact in case of emergency</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="emergency_contact_name">Name *</Label>
                                    <Input
                                        id="emergency_contact_name"
                                        required
                                        value={formData.tenant.emergency_contact_name}
                                        onChange={(e) => handleChange('tenant.emergency_contact_name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="emergency_contact_relationship">Relationship *</Label>
                                    <Input
                                        id="emergency_contact_relationship"
                                        required
                                        value={formData.tenant.emergency_contact_relationship}
                                        onChange={(e) => handleChange('tenant.emergency_contact_relationship', e.target.value)}
                                        placeholder="e.g., Mother, Father, Sibling"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="emergency_contact_phone">Phone Number *</Label>
                                    <Input
                                        id="emergency_contact_phone"
                                        required
                                        maxLength={10}
                                        pattern="0[0-9]{9}"
                                        value={formData.tenant.emergency_contact_phone}
                                        onChange={(e) => handleChange('tenant.emergency_contact_phone', e.target.value)}
                                        placeholder="0812345678"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Occupation Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Occupation Information</CardTitle>
                            <CardDescription>Employment and income details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="occupation">Occupation *</Label>
                                    <Input
                                        id="occupation"
                                        required
                                        value={formData.tenant.occupation}
                                        onChange={(e) => handleChange('tenant.occupation', e.target.value)}
                                        placeholder="e.g., Software Engineer"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="workplace">Workplace</Label>
                                    <Input
                                        id="workplace"
                                        value={formData.tenant.workplace}
                                        onChange={(e) => handleChange('tenant.workplace', e.target.value)}
                                        placeholder="Company name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="monthly_income">Monthly Income (฿)</Label>
                                    <Input
                                        id="monthly_income"
                                        type="number"
                                        min="0"
                                        value={formData.tenant.monthly_income || ''}
                                        onChange={(e) => handleChange('tenant.monthly_income', parseFloat(e.target.value))}
                                        placeholder="50000"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 justify-end pb-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/rooms')}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="min-w-[150px]"
                        >
                            {submitting ? 'Creating Contract...' : 'Create Contract'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
