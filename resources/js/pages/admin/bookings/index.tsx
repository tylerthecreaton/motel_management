import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Rental } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CheckCircle, XCircle, Calendar, User, Home, FileText } from 'lucide-react';

export default function AdminBookingsIndex() {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '/admin' },
        { title: 'Bookings Management', href: '/admin/bookings' },
    ];

    // Fetch all bookings
    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/admin/bookings', {
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
            setFilteredRentals(data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load bookings');
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter by status
    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredRentals(rentals);
        } else {
            setFilteredRentals(rentals.filter(r => r.status === statusFilter));
        }
    }, [statusFilter, rentals]);

    // Handle approve
    const handleApprove = async (id: number) => {
        try {
            setProcessingId(id);
            setError(null);

            const response = await fetch(`/api/admin/bookings/${id}/approve`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie
                            .split('; ')
                            .find(row => row.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1] || ''
                    ),
                },
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to approve booking');
            }

            // Refresh bookings list
            await fetchBookings();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to approve booking');
        } finally {
            setProcessingId(null);
        }
    };

    // Handle reject
    const handleReject = async (id: number) => {
        try {
            setProcessingId(id);
            setError(null);

            const response = await fetch(`/api/admin/bookings/${id}/reject`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie
                            .split('; ')
                            .find(row => row.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1] || ''
                    ),
                },
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reject booking');
            }

            // Refresh bookings list
            await fetchBookings();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reject booking');
        } finally {
            setProcessingId(null);
        }
    };

    // Get status badge
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

    // Count by status
    const pendingCount = rentals.filter(r => r.status === 'pending').length;
    const approvedCount = rentals.filter(r => r.status === 'approved').length;

    if (loading) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="Bookings Management" />
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading bookings...</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Bookings Management" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Bookings Management</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Review and manage rental contract requests
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{rentals.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-amber-600">
                                Pending Approval
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-green-600">
                                Approved
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Filter by Status:</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Bookings List */}
                {filteredRentals.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    No bookings found
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {statusFilter !== 'all'
                                        ? `No bookings with status "${statusFilter}"`
                                        : 'No bookings have been created yet'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filteredRentals.map((rental) => (
                            <Card key={rental.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <CardTitle className="text-xl">
                                                    Contract #{rental.contract_number || rental.id}
                                                </CardTitle>
                                                {getStatusBadge(rental.status)}
                                            </div>
                                            <CardDescription>
                                                Created: {formatDate(rental.created_at)}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                        {/* Room */}
                                        <div className="flex items-start gap-3">
                                            <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Room</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {rental.room?.name || `#${rental.room_id}`}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tenant */}
                                        <div className="flex items-start gap-3">
                                            <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Tenant</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {rental.tenant_information
                                                        ? `${rental.tenant_information.first_name} ${rental.tenant_information.last_name}`
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Period */}
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Period</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="flex items-start gap-3">
                                            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Price</p>
                                                <p className="text-sm font-semibold text-blue-600">
                                                    ฿{parseFloat(rental.total_price).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        {rental.status === 'pending' && (
                                            <>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            disabled={processingId === rental.id}
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Approve
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Approve Booking?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will approve the rental contract and mark the room as occupied.
                                                                The tenant can start moving in on the start date.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleApprove(rental.id)}>
                                                                Approve
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={processingId === rental.id}
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Reject
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Reject Booking?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will reject the rental contract request. The room will remain available
                                                                for other bookings.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleReject(rental.id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Reject
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}

                                        <Link href={`/admin/bookings/${rental.id}`}>
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
