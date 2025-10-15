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
import { DollarSign, Calendar, FileText, User, Home, Phone, Mail, Zap } from 'lucide-react';
import RecordElectricityUsageForm from '@/components/RecordElectricityUsageForm';

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

interface BulkFormData {
    month: string;
    year: string;
}

interface IndividualFormData {
    rental_id: string;
    room_rent: string;
    electricity_charge: string;
    water_charge: string;
}

interface ValidationErrors {
    month?: string[];
    year?: string[];
    rental_id?: string[];
    room_rent?: string[];
    electricity_charge?: string[];
    water_charge?: string[];
}

export default function AdminInvoicesPage() {
    const currentDate = new Date();
    const [activeTab, setActiveTab] = useState<'individual' | 'bulk' | 'electricity'>('individual');
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
    const [fetchingRentals, setFetchingRentals] = useState(true);
    
    // Bulk generation form
    const [bulkFormData, setBulkFormData] = useState<BulkFormData>({
        month: (currentDate.getMonth() + 1).toString(),
        year: currentDate.getFullYear().toString(),
    });
    
    // Individual invoice form
    const [individualFormData, setIndividualFormData] = useState<IndividualFormData>({
        rental_id: '',
        room_rent: '',
        electricity_charge: '0',
        water_charge: '0',
    });
    
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '/admin' },
        { title: 'Invoice Management', href: '/admin/invoices' },
    ];

    const months = [
        { value: '1', label: 'มกราคม' },
        { value: '2', label: 'กุมภาพันธ์' },
        { value: '3', label: 'มีนาคม' },
        { value: '4', label: 'เมษายน' },
        { value: '5', label: 'พฤษภาคม' },
        { value: '6', label: 'มิถุนายน' },
        { value: '7', label: 'กรกฎาคม' },
        { value: '8', label: 'สิงหาคม' },
        { value: '9', label: 'กันยายน' },
        { value: '10', label: 'ตุลาคม' },
        { value: '11', label: 'พฤศจิกายน' },
        { value: '12', label: 'ธันวาคม' },
    ];

    const years = Array.from({ length: 3 }, (_, i) => {
        const year = currentDate.getFullYear() - i;
        return { value: year.toString(), label: year.toString() };
    });

    // Fetch active rentals
    useEffect(() => {
        fetchActiveRentals();
    }, []);

    const fetchActiveRentals = async () => {
        try {
            setFetchingRentals(true);
            console.log('Fetching active rentals...');
            
            const response = await fetch('/api/admin/invoices/active-rentals', {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error(errorData.message || 'Failed to fetch rentals');
            }

            const data = await response.json();
            console.log('Rentals data:', data);
            console.log('Rentals count:', data.data?.length || 0);
            
            setRentals(data.data || []);
        } catch (err) {
            console.error('Fetch error:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to load rentals');
        } finally {
            setFetchingRentals(false);
        }
    };

    const handleRentalChange = (rentalId: string) => {
        const rental = rentals.find(r => r.id === parseInt(rentalId));
        setSelectedRental(rental || null);
        
        setIndividualFormData({
            rental_id: rentalId,
            room_rent: rental?.room.price_per_month || '',
            electricity_charge: '0',
            water_charge: '0',
        });
        
        setErrors({});
        setSuccessMessage(null);
        setErrorMessage(null);
    };

    const handleIndividualChange = (field: keyof IndividualFormData, value: string) => {
        setIndividualFormData((prev) => ({
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

    const handleBulkChange = (field: keyof BulkFormData, value: string) => {
        setBulkFormData((prev) => ({
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

    const handleIndividualSubmit = async (e: FormEvent) => {
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
                    rental_id: parseInt(individualFormData.rental_id),
                    room_rent: parseFloat(individualFormData.room_rent),
                    electricity_charge: parseFloat(individualFormData.electricity_charge),
                    water_charge: parseFloat(individualFormData.water_charge),
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
            
            setIndividualFormData({
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

    const handleBulkSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/admin/invoices/generate', {
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
                    month: parseInt(bulkFormData.month),
                    year: parseInt(bulkFormData.year),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    setErrors(data.errors);
                } else {
                    throw new Error(data.message || 'Failed to generate invoices');
                }
                return;
            }

            setSuccessMessage(data.message);

            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to generate invoices');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = parseFloat(individualFormData.room_rent || '0') + 
                       parseFloat(individualFormData.electricity_charge || '0') + 
                       parseFloat(individualFormData.water_charge || '0');

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoice Management" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 overflow-y-auto">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FileText className="h-8 w-8" />
                        Invoice Management
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                        Create invoices and record electricity usage
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

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-900 rounded-lg border">
                    <div className="border-b">
                        <div className="flex gap-4 p-2">
                            <button
                                onClick={() => setActiveTab('individual')}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    activeTab === 'individual'
                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <FileText className="inline h-4 w-4 mr-2" />
                                Create Invoice
                            </button>
                            <button
                                onClick={() => setActiveTab('bulk')}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    activeTab === 'bulk'
                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Calendar className="inline h-4 w-4 mr-2" />
                                Bulk Generate
                            </button>
                            <button
                                onClick={() => setActiveTab('electricity')}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    activeTab === 'electricity'
                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Zap className="inline h-4 w-4 mr-2" />
                                Record Electricity
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Individual Invoice Tab */}
                        {activeTab === 'individual' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Create Individual Invoice</CardTitle>
                                            <CardDescription>
                                                Select tenant and enter charges
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handleIndividualSubmit} className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="rental_id">
                                                        Select Tenant <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Select
                                                        value={individualFormData.rental_id}
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

                                                <div className="space-y-2">
                                                    <Label htmlFor="room_rent">
                                                        Room Rent (฿) <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="room_rent"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={individualFormData.room_rent}
                                                        onChange={(e) => handleIndividualChange('room_rent', e.target.value)}
                                                        placeholder="0.00"
                                                        required
                                                        className={errors.room_rent ? 'border-red-500' : ''}
                                                    />
                                                    {errors.room_rent && (
                                                        <p className="text-sm text-red-500">{errors.room_rent[0]}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="electricity_charge">
                                                        Electricity Charge (฿) <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="electricity_charge"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={individualFormData.electricity_charge}
                                                        onChange={(e) => handleIndividualChange('electricity_charge', e.target.value)}
                                                        placeholder="0.00"
                                                        required
                                                        className={errors.electricity_charge ? 'border-red-500' : ''}
                                                    />
                                                    {errors.electricity_charge && (
                                                        <p className="text-sm text-red-500">{errors.electricity_charge[0]}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="water_charge">
                                                        Water Charge (฿) <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="water_charge"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={individualFormData.water_charge}
                                                        onChange={(e) => handleIndividualChange('water_charge', e.target.value)}
                                                        placeholder="0.00"
                                                        required
                                                        className={errors.water_charge ? 'border-red-500' : ''}
                                                    />
                                                    {errors.water_charge && (
                                                        <p className="text-sm text-red-500">{errors.water_charge[0]}</p>
                                                    )}
                                                </div>

                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-lg font-semibold">Total Amount:</span>
                                                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                            ฿{totalAmount.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <Button type="submit" disabled={loading || !individualFormData.rental_id}>
                                                        <DollarSign className="mr-2 h-4 w-4" />
                                                        {loading ? 'Creating...' : 'Create Invoice'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </div>

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
                        )}

                        {/* Bulk Generation Tab */}
                        {activeTab === 'bulk' && (
                            <Card className="max-w-2xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Bulk Invoice Generation
                                    </CardTitle>
                                    <CardDescription>
                                        Generate invoices for all active rentals for a specific month
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleBulkSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="month" className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Month <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={bulkFormData.month}
                                                onValueChange={(value) => handleBulkChange('month', value)}
                                            >
                                                <SelectTrigger className={errors.month ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select month" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((month) => (
                                                        <SelectItem key={month.value} value={month.value}>
                                                            {month.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.month && (
                                                <p className="text-sm text-red-500">{errors.month[0]}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="year">
                                                Year <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={bulkFormData.year}
                                                onValueChange={(value) => handleBulkChange('year', value)}
                                            >
                                                <SelectTrigger className={errors.year ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem key={year.value} value={year.value}>
                                                            {year.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.year && (
                                                <p className="text-sm text-red-500">{errors.year[0]}</p>
                                            )}
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                                                What will happen:
                                            </h3>
                                            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                                                <li>Find all active rentals</li>
                                                <li>Calculate room rent, electricity, and water charges</li>
                                                <li>Create invoices with unique invoice numbers</li>
                                                <li>Mark electricity usage records as billed</li>
                                            </ul>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button type="submit" disabled={loading}>
                                                <DollarSign className="mr-2 h-4 w-4" />
                                                {loading ? 'Generating...' : 'Generate Invoices'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Electricity Usage Tab */}
                        {activeTab === 'electricity' && (
                            <div className="max-w-2xl">
                                <RecordElectricityUsageForm 
                                    onSuccess={() => {
                                        setSuccessMessage('Electricity usage recorded successfully!');
                                        setTimeout(() => setSuccessMessage(null), 3000);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
