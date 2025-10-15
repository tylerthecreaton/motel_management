import { useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Rental } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Calendar, Home, DollarSign } from 'lucide-react';

export default function BookingsIndex() {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Contracts', href: '/bookings' },
    ];

    // Fetch bookings
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/bookings', {
                    headers: {
                        'Accept': 'application/json',
                    },
                    credentials: 'same-origin',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch bookings');
                }

                const data = await response.json();
                setRentals(data.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load bookings');
                console.error('Error fetching bookings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Get status badge color
    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
            pending: { variant: 'secondary', label: 'Pending' },
            approved: { variant: 'default', label: 'Approved' },
            active: { variant: 'default', label: 'Active' },
            completed: { variant: 'outline', label: 'Completed' },
            cancelled: { variant: 'destructive', label: 'Cancelled' },
        };

        const config = variants[status] || variants.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="My Contracts" />
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading your bookings...</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="My Contracts" />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Rental Contracts</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            View and manage your rental contracts
                        </p>
                    </div>
                    <Link href="/rooms">
                        <Button>
                            <Home className="mr-2 h-4 w-4" />
                            Browse Rooms
                        </Button>
                    </Link>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Bookings List */}
                {rentals.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No bookings yet</h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    Start by browsing available rooms and create your first rental contract.
                                </p>
                                <Link href="/rooms">
                                    <Button className="mt-6">
                                        Browse Available Rooms
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {rentals.map((rental) => (
                            <Card key={rental.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <CardTitle className="text-xl">
                                                    {rental.room?.name || `Room #${rental.room_id}`}
                                                </CardTitle>
                                                {getStatusBadge(rental.status)}
                                            </div>
                                            <CardDescription>
                                                Contract #{rental.contract_number || rental.id}
                                            </CardDescription>
                                        </div>
                                        <Link href={`/bookings/${rental.id}`} className="w-full sm:w-auto">
                                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Rental Period */}
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Rental Period</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDate(rental.start_date)}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    to {formatDate(rental.end_date)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Monthly Rent */}
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Monthly Rent</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    ฿{parseFloat(rental.monthly_rent).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Deposit */}
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Deposit</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    ฿{parseFloat(rental.deposit_amount).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Total Price */}
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Price</p>
                                                <p className="text-sm font-semibold text-blue-600">
                                                    ฿{parseFloat(rental.total_price).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tenant Info */}
                                    {rental.tenant_information && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Tenant:</span>{' '}
                                                {rental.tenant_information.first_name} {rental.tenant_information.last_name}
                                            </p>
                                        </div>
                                    )}

                                    {/* Contract Date */}
                                    {rental.contract_date && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                Contract Date: {formatDate(rental.contract_date)}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
