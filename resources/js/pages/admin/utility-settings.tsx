import { useState, useEffect, FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Zap, Droplet } from 'lucide-react';

interface UtilityRate {
    id: number;
    electricity_rate_per_unit: string;
    water_flat_rate: string;
    created_at: string;
    updated_at: string;
}

interface FormData {
    electricity_rate_per_unit: string;
    water_flat_rate: string;
}

interface ValidationErrors {
    electricity_rate_per_unit?: string[];
    water_flat_rate?: string[];
}

export default function UtilitySettingsPage() {
    const [utilityRate, setUtilityRate] = useState<UtilityRate | null>(null);
    const [formData, setFormData] = useState<FormData>({
        electricity_rate_per_unit: '',
        water_flat_rate: '',
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '/admin' },
        { title: 'Utility Settings', href: '/admin/utility-settings' },
    ];

    // Fetch utility rates when component loads
    useEffect(() => {
        fetchUtilityRates();
    }, []);

    const fetchUtilityRates = async () => {
        try {
            setFetchLoading(true);
            const response = await fetch('/api/admin/utility-rates', {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch utility rates');
            }

            const data = await response.json();
            setUtilityRate(data.data);
            setFormData({
                electricity_rate_per_unit: data.data.electricity_rate_per_unit,
                water_flat_rate: data.data.water_flat_rate,
            });
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to load utility rates');
        } finally {
            setFetchLoading(false);
        }
    };

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field
        if (errors[name as keyof ValidationErrors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
        // Clear messages
        setSuccessMessage(null);
        setErrorMessage(null);
    };

    // Handle form submit
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/admin/utility-rates', {
                method: 'PUT',
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
                    electricity_rate_per_unit: parseFloat(formData.electricity_rate_per_unit),
                    water_flat_rate: parseFloat(formData.water_flat_rate),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    // Validation errors
                    setErrors(data.errors);
                } else {
                    throw new Error(data.message || 'Failed to update utility rates');
                }
                return;
            }

            // Success
            setUtilityRate(data.data);
            setFormData({
                electricity_rate_per_unit: data.data.electricity_rate_per_unit,
                water_flat_rate: data.data.water_flat_rate,
            });
            setSuccessMessage('Utility rates updated successfully!');

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to update utility rates');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="Utility Settings" />
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading utility rates...</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Utility Settings" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 overflow-y-auto">
                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Utility Settings
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                        Manage electricity and water rates for billing
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            {successMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <Alert variant="destructive">
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                {/* Form */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Utility Rates</CardTitle>
                        <CardDescription>
                            Set the rates for electricity and water billing
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Electricity Rate */}
                            <div className="space-y-2">
                                <Label htmlFor="electricity_rate_per_unit" className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-yellow-500" />
                                    Electricity Rate per Unit (฿/kWh)
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="electricity_rate_per_unit"
                                    name="electricity_rate_per_unit"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.electricity_rate_per_unit}
                                    onChange={handleChange}
                                    placeholder="5.00"
                                    required
                                    className={errors.electricity_rate_per_unit ? 'border-red-500' : ''}
                                />
                                {errors.electricity_rate_per_unit && (
                                    <p className="text-sm text-red-500">
                                        {errors.electricity_rate_per_unit[0]}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Price per kilowatt-hour (kWh) for electricity usage
                                </p>
                            </div>

                            {/* Water Rate */}
                            <div className="space-y-2">
                                <Label htmlFor="water_flat_rate" className="flex items-center gap-2">
                                    <Droplet className="h-4 w-4 text-blue-500" />
                                    Water Flat Rate (฿/month)
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="water_flat_rate"
                                    name="water_flat_rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.water_flat_rate}
                                    onChange={handleChange}
                                    placeholder="150.00"
                                    required
                                    className={errors.water_flat_rate ? 'border-red-500' : ''}
                                />
                                {errors.water_flat_rate && (
                                    <p className="text-sm text-red-500">
                                        {errors.water_flat_rate[0]}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Fixed monthly water charge per room
                                </p>
                            </div>

                            {/* Current Rates Info */}
                            {utilityRate && (
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Current Rates
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Electricity:</span>
                                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                                                ฿{utilityRate.electricity_rate_per_unit}/kWh
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Water:</span>
                                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                                                ฿{utilityRate.water_flat_rate}/month
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Last updated: {new Date(utilityRate.updated_at).toLocaleString('th-TH')}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={loading}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {loading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
