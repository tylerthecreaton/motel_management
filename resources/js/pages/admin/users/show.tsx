import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { User, Rental } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Edit, Mail, MailCheck, Calendar, Home } from 'lucide-react';

interface UserWithRentals extends User {
    rentals?: Rental[];
    rentals_count?: number;
}

export default function AdminUsersShow({ userId }: { userId: string }) {
    const [user, setUser] = useState<UserWithRentals | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '/admin' },
        { title: 'Users Management', href: '/admin/users' },
        { title: 'User Details', href: `/admin/users/${userId}` },
    ];

    // Fetch user data
    useEffect(() => {
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/admin/users/${userId}`, {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }

            const data = await response.json();
            setUser(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load user');
        } finally {
            setLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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

    if (loading) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="User Details" />
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading user...</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    if (error || !user) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="User Details" />
                <div className="flex h-full items-center justify-center p-4">
                    <Alert variant="destructive">
                        <AlertDescription>{error || 'User not found'}</AlertDescription>
                    </Alert>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`User: ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 overflow-y-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit('/admin/users')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {user.name}
                            </h1>
                            <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => router.visit(`/admin/users/${userId}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit User
                    </Button>
                </div>

                {/* User Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>User account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Verification</p>
                                <div className="mt-1">
                                    {user.email_verified_at ? (
                                        <Badge variant="default" className="gap-1">
                                            <MailCheck className="h-3 w-3" />
                                            Verified on {formatDate(user.email_verified_at)}
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="gap-1">
                                            <Mail className="h-3 w-3" />
                                            Not Verified
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</p>
                                <p className="text-base text-gray-900 dark:text-gray-100">{formatDate(user.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                                <p className="text-base text-gray-900 dark:text-gray-100">{formatDate(user.updated_at)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistics</CardTitle>
                            <CardDescription>User activity overview</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Rentals</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {user.rentals_count || 0}
                                </p>
                            </div>
                            {user.rentals && user.rentals.length > 0 && (
                                <>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Rentals</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {user.rentals.filter(r => r.status === 'active').length}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Rentals</p>
                                        <p className="text-2xl font-bold text-amber-600">
                                            {user.rentals.filter(r => r.status === 'pending').length}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Rental History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rental History</CardTitle>
                        <CardDescription>
                            {user.rentals?.length || 0} rental{(user.rentals?.length || 0) !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!user.rentals || user.rentals.length === 0 ? (
                            <div className="text-center py-12">
                                <Home className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    No rentals yet
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    This user hasn't made any rental bookings
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Contract #</TableHead>
                                            <TableHead>Room</TableHead>
                                            <TableHead className="hidden md:table-cell">Period</TableHead>
                                            <TableHead className="hidden lg:table-cell">Total Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {user.rentals.map((rental) => (
                                            <TableRow key={rental.id}>
                                                <TableCell className="font-medium">
                                                    {rental.contract_number || `#${rental.id}`}
                                                </TableCell>
                                                <TableCell>
                                                    {rental.room?.name || `Room #${rental.room_id}`}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(rental.start_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}{' '}
                                                        -{' '}
                                                        {new Date(rental.end_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell font-semibold text-blue-600">
                                                    ฿{parseFloat(rental.total_price).toLocaleString()}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(rental.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.visit(`/admin/bookings/${rental.id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
