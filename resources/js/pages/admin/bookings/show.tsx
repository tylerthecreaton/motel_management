import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Rental } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
import { ArrowLeft, FileText, Calendar, Home, User, Phone, Mail, MapPin, Briefcase, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Props {
    id: string;
}

export default function AdminBookingShow({ id }: Props) {
    const [rental, setRental] = useState<Rental | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '/admin' },
        { title: 'Bookings', href: '/admin/bookings' },
        { title: 'Details', href: `/admin/bookings/${id}` },
    ];

    // Fetch booking details
    useEffect(() => {
        const fetchBooking = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/admin/bookings/${id}`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                    credentials: 'same-origin',
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Booking not found');
                    }
                    throw new Error('Failed to fetch booking details');
                }

                const data = await response.json();
                setRental(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load booking details');
                console.error('Error fetching booking:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBooking();
        }
    }, [id]);

    // Handle approve
    const handleApprove = async () => {
        try {
            setProcessing(true);
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

            // Refresh booking data
            setRental(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to approve booking');
        } finally {
            setProcessing(false);
        }
    };

    // Handle reject
    const handleReject = async () => {
        try {
            setProcessing(true);
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

            // Refresh booking data
            setRental(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reject booking');
        } finally {
            setProcessing(false);
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
        return <Badge variant={config.variant} className="text-sm">{config.label}</Badge>;
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="Booking Details" />
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading booking details...</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    if (error || !rental) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="Error" />
                <div className="flex h-full items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-red-600">Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">{error || 'Booking not found'}</p>
                            <Link href="/admin/bookings">
                                <Button>Back to Bookings</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </AppSidebarLayout>
        );
    }

    const tenant = rental.tenant_information;

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Contract #${rental.contract_number || rental.id}`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4 overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rental Contract Details</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Contract #{rental.contract_number || rental.id}
                        </p>
                    </div>
                    {getStatusBadge(rental.status)}
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-6">
                    {/* Room Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="h-5 w-5" />
                                Room Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Room Name</p>
                                    <p className="font-semibold text-lg">{rental.room?.name || `Room #${rental.room_id}`}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Room Type</p>
                                    <p className="font-semibold">{rental.room?.type || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Rent</p>
                                    <p className="font-semibold text-blue-600">
                                        ฿{parseFloat(rental.monthly_rent).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Room Status</p>
                                    <Badge variant={rental.room?.status === 'available' ? 'default' : 'secondary'}>
                                        {rental.room?.status || 'Unknown'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contract Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Contract Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Contract Date</p>
                                    <p className="font-semibold">
                                        {rental.contract_date ? formatDate(rental.contract_date) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Contract Status</p>
                                    {getStatusBadge(rental.status)}
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Start Date
                                    </p>
                                    <p className="font-semibold">{formatDate(rental.start_date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        End Date
                                    </p>
                                    <p className="font-semibold">{formatDate(rental.end_date)}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Deposit Amount</p>
                                    <p className="font-semibold text-lg">
                                        ฿{parseFloat(rental.deposit_amount).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Advance Payment</p>
                                    <p className="font-semibold text-lg">
                                        ฿{parseFloat(rental.advance_payment).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Price</p>
                                    <p className="font-semibold text-lg text-blue-600">
                                        ฿{parseFloat(rental.total_price).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {rental.special_conditions && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Special Conditions</p>
                                        <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md">{rental.special_conditions}</p>
                                    </div>
                                </>
                            )}

                            {rental.notes && (
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Notes</p>
                                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md">{rental.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tenant Information */}
                    {tenant && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Tenant Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Personal Info */}
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                                            <p className="font-semibold">{tenant.first_name} {tenant.last_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                                            <p className="font-semibold">{formatDate(tenant.date_of_birth)}</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Contact Info */}
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Contact Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-2">
                                            <Phone className="h-4 w-4 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                                                <p className="font-semibold">{tenant.phone_number}</p>
                                            </div>
                                        </div>
                                        {tenant.email && (
                                            <div className="flex items-start gap-2">
                                                <Mail className="h-4 w-4 text-gray-400 mt-1" />
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                                    <p className="font-semibold">{tenant.email}</p>
                                                </div>
                                            </div>
                                        )}
                                        {tenant.line_id && (
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">LINE ID</p>
                                                <p className="font-semibold">{tenant.line_id}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Address */}
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Address
                                    </h3>
                                    <p className="text-sm">
                                        {tenant.current_address}, {tenant.sub_district}, {tenant.district},{' '}
                                        {tenant.province} {tenant.postal_code}
                                    </p>
                                </div>

                                <Separator />

                                {/* Emergency Contact */}
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">Emergency Contact</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                                            <p className="font-semibold">{tenant.emergency_contact_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Relationship</p>
                                            <p className="font-semibold">{tenant.emergency_contact_relationship}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                                            <p className="font-semibold">{tenant.emergency_contact_phone}</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Occupation */}
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Occupation
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Occupation</p>
                                            <p className="font-semibold">{tenant.occupation}</p>
                                        </div>
                                        {tenant.workplace && (
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Workplace</p>
                                                <p className="font-semibold">{tenant.workplace}</p>
                                            </div>
                                        )}
                                        {tenant.monthly_income && (
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</p>
                                                <p className="font-semibold">
                                                    ฿{parseFloat(tenant.monthly_income).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Admin Actions */}
                    {rental.status === 'pending' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Admin Actions</CardTitle>
                                <CardDescription>
                                    Review and approve or reject this rental contract request
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-3">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button disabled={processing}>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                {processing ? 'Processing...' : 'Approve Contract'}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Approve Rental Contract?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will approve the rental contract and mark the room as occupied.
                                                    The tenant can start moving in on {formatDate(rental.start_date)}.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleApprove}>
                                                    Approve
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" disabled={processing}>
                                                <XCircle className="mr-2 h-4 w-4" />
                                                {processing ? 'Processing...' : 'Reject Contract'}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Reject Rental Contract?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will reject the rental contract request. The room will remain available
                                                    for other bookings.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction 
                                                    onClick={handleReject}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Reject
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppSidebarLayout>
    );
}
