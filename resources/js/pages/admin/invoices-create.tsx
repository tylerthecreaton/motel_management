import { useState, useEffect, FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, User, Home, Phone, Mail, FileText } from 'lucide-react';

interface Rental {
    id: number;
    user_id: number;
    room_id: number;
    status: string;
    monthly_rent: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    room: {
        id: number;
        name: string;
        type: string;
        price_per_month: string;
    };
    tenant_information?: {
        id: number;
        phone_number: string;
        id_card_number: string;
        emergency_contact_name: string;
        emergency_contact_phone: string;
    };
}

interface FormData {
    rental_id: string;
    room_rent: string;
    electricity_charge: string;
    water_charge: string;
}

interface ValidationErrors {
    rental_id?: string[];
    room_rent?: string[];
    electricity_charge?: string[];
    water_charge?: string[];
}

export default function AdminInvoicesCreatePage() {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
    const [formData, setFormData] = useState<FormData>({
        rental_id: '',
        room_rent: '',
        electricity_charge: '0',
        water_charge: '0',
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [fetchingRentals, setFetchingRentals] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '/admin' },
        { title: 'Create Invoice', href: '/admin/invoices/create' },
    ];

    // Fetch active rentals
    useEffect(() => {
        fetchActiveRentals();
    }, []);

    const fetchActiveRentals = async () => {
        try {
            setFetchingRentals(true);
            const response = await fetch('/api/admin/invoices/active-rentals', {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch rentals');
            }

            const data = await response.json();
            setRentals(data.data || []);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to load rentals');
        } finally {
            setFetchingRentals(false);
        }
    };

    const handleRentalChange = (rentalId: string) => {
        const rental = rentals.find(r => r.id === parseInt(rentalId));
        setSelectedRental(rental || null);
        
        setFormData({
            rental_id: rentalId,
            room_rent: rental?.room.price_per_month || '',
            electricity_charge: '0',
            water_charge: '0',
        });
        
        setErrors({});
        setSuccessMessage(null);
        setErrorMessage(null);
    };

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }));
        }
        
        setSuccessMessage(null);
        setErrorMessage(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/admin/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie
                            .split('; ')
                            .find((row) => row.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1] || ''
                    ),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    rental_id: parseInt(formData.rental_id),
                    room_rent: parseFloat(formData.room_rent),
                    electricity_charge: parseFloat(formData.electricity_charge),
                    water_charge: parseFloat(formData.water_charge),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    setErrors(data.errors);
                } else {
                    throw new Error(data.message || 'Failed to create invoice');
                }
                return;
            }

            setSuccessMessage('Invoice created successfully!');
            
            // Reset form
            setFormData({
                rental_id: '',
                room_rent: '',
                electricity_charge: '0',
                water_charge: '0',
            });
            setSelectedRental(null);

            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = parseFloat(formData.room_rent || '0') + 
                       parseFloat(formData.electricity_charge || '0') + 
                       parseFloat(formData.water_charge || '0');

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Invoice" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 overflow-y-auto">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FileText className="h-8 w-8" />
                        Create Invoice
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                        Create an invoice for a tenant with custom charges
                    </p>
                </div>

                {successMessage && (
                    <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            {successMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {errorMessage && (
                    <Alert variant="destructive">
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Invoice Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Details</CardTitle>
                                <CardDescription>
                                    Select tenant and enter charges
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Tenant Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="rental_id">
                                            Select Tenant <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={formData.rental_id}
                                            onValueChange={handleRentalChange}
                                            disabled={fetchingRentals}
                                        >
                                            <SelectTrigger className={errors.rental_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder={fetchingRentals ? 'Loading...' : 'Select a tenant'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {rentals.map((rental) => (
                                                    <SelectItem key={rental.id} value={rental.id.toString()}>
                                                        {rental.user.name} - {rental.room.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.rental_id && (
                                            <p className="text-sm text-red-500">{errors.rental_id[0]}</p>
                                        )}
                                    </div>

                                    {/* Room Rent */}
                                    <div className="space-y-2">
                                        <Label htmlFor="room_rent">
                                            Room Rent (฿) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="room_rent"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.room_rent}
                                            onChange={(e) => handleChange('room_rent', e.target.value)}
                                            placeholder="0.00"
                                            required
                                            className={errors.room_rent ? 'border-red-500' : ''}
                                        />
                                        {errors.room_rent && (
                                            <p className="text-sm text-red-500">{errors.room_rent[0]}</p>
                                        )}
                                    </div>

                                    {/* Electricity Charge */}
                                    <div className="space-y-2">
                                        <Label htmlFor="electricity_charge">
                                            Electricity Charge (฿) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="electricity_charge"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.electricity_charge}
                                            onChange={(e) => handleChange('electricity_charge', e.target.value)}
                                            placeholder="0.00"
                                            required
                                            className={errors.electricity_charge ? 'border-red-500' : ''}
                                        />
                                        {errors.electricity_charge && (
                                            <p className="text-sm text-red-500">{errors.electricity_charge[0]}</p>
                                        )}
                                    </div>

                                    {/* Water Charge */}
                                    <div className="space-y-2">
                                        <Label htmlFor="water_charge">
                                            Water Charge (฿) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="water_charge"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.water_charge}
                                            onChange={(e) => handleChange('water_charge', e.target.value)}
                                            placeholder="0.00"
                                            required
                                            className={errors.water_charge ? 'border-red-500' : ''}
                                        />
                                        {errors.water_charge && (
                                            <p className="text-sm text-red-500">{errors.water_charge[0]}</p>
                                        )}
                                    </div>

                                    {/* Total */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold">Total Amount:</span>
                                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                ฿{totalAmount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3 pt-4">
                                        <Button type="submit" disabled={loading || !formData.rental_id}>
                                            <DollarSign className="mr-2 h-4 w-4" />
                                            {loading ? 'Creating...' : 'Create Invoice'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tenant Information */}
                    <div>
                        {selectedRental && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Tenant Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                                        <p className="font-semibold">{selectedRental.user.name}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                            <p className="text-sm">{selectedRental.user.email}</p>
                                        </div>
                                    </div>

                                    {selectedRental.tenant_information?.phone_number && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                                                <p className="text-sm">{selectedRental.tenant_information.phone_number}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Home className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm font-semibold">Room Details</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Room:</span>{' '}
                                                <span className="font-medium">{selectedRental.room.name}</span>
                                            </p>
                                            <p className="text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Type:</span>{' '}
                                                <span className="font-medium">{selectedRental.room.type}</span>
                                            </p>
                                            <p className="text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Monthly Rent:</span>{' '}
                                                <span className="font-medium">฿{parseFloat(selectedRental.room.price_per_month).toFixed(2)}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {selectedRental.tenant_information && (
                                        <div className="border-t pt-4">
                                            <p className="text-sm font-semibold mb-2">Emergency Contact</p>
                                            <div className="space-y-1">
                                                <p className="text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Name:</span>{' '}
                                                    {selectedRental.tenant_information.emergency_contact_name}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>{' '}
                                                    {selectedRental.tenant_information.emergency_contact_phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
