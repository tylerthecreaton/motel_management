import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Room, BookingFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const BookingFormPage = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState<BookingFormData>({
        room_id: parseInt(roomId || '0'),
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
                const response = await fetch(`/api/rooms/${roomId}`);
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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // Get auth token from localStorage or cookie
            const token = localStorage.getItem('auth_token');
            
            if (!token) {
                throw new Error('Please login to create a booking');
            }

            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create booking');
            }

            setSuccess(true);
            // Redirect to bookings list after 2 seconds
            setTimeout(() => {
                navigate('/bookings');
            }, 2000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create booking');
            console.error('Booking error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle input changes
    const handleChange = (field: string, value: any) => {
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
            setFormData(prev => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert variant="destructive">
                    <AlertDescription>Room not found</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-green-600">Success!</CardTitle>
                        <CardDescription>
                            Your rental contract has been created successfully.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">
                            Redirecting to your bookings...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Rental Contract</h1>
                    <p className="mt-2 text-gray-600">
                        Fill in the details to create a rental contract for {room.name}
                    </p>
                </div>

                {/* Room Info Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Room Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Room Name</p>
                                <p className="font-semibold">{room.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Type</p>
                                <p className="font-semibold">{room.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Monthly Rent</p>
                                <p className="font-semibold text-blue-600">
                                    ฿{parseFloat(room.price_per_month).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
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
                    <Alert variant="destructive" className="mb-6">
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
                                    <Label htmlFor="start_date">Start Date *</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        required
                                        value={formData.start_date}
                                        onChange={(e) => handleChange('start_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="end_date">End Date *</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        required
                                        value={formData.end_date}
                                        onChange={(e) => handleChange('end_date', e.target.value)}
                                        min={formData.start_date || new Date().toISOString().split('T')[0]}
                                    />
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
                    <div className="flex gap-4 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
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
        </div>
    );
};

export default BookingFormPage;
