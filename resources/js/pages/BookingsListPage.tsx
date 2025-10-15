import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rental } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Calendar, Home, DollarSign } from 'lucide-react';

const BookingsListPage = () => {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch bookings
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem('auth_token');
                if (!token) {
                    throw new Error('Please login to view your bookings');
                }

                const response = await fetch('/api/bookings', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Rental Contracts</h1>
                            <p className="mt-2 text-gray-600">
                                View and manage your rental contracts
                            </p>
                        </div>
                        <Link to="/rooms">
                            <Button>
                                <Home className="mr-2 h-4 w-4" />
                                Browse Rooms
                            </Button>
                        </Link>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Bookings List */}
                {rentals.length === 0 ? (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">No bookings yet</h3>
                                <p className="mt-2 text-gray-600">
                                    Start by browsing available rooms and create your first rental contract.
                                </p>
                                <Link to="/rooms">
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
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <CardTitle className="text-xl">
                                                    {rental.room?.name || `Room #${rental.room_id}`}
                                                </CardTitle>
                                                {getStatusBadge(rental.status)}
                                            </div>
                                            <CardDescription>
                                                Contract #{rental.contract_number || rental.id}
                                            </CardDescription>
                                        </div>
                                        <Link to={`/bookings/${rental.id}`}>
                                            <Button variant="outline" size="sm">
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
                                                <p className="text-sm font-medium text-gray-900">Rental Period</p>
                                                <p className="text-sm text-gray-600">
                                                    {formatDate(rental.start_date)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    to {formatDate(rental.end_date)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Monthly Rent */}
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Monthly Rent</p>
                                                <p className="text-sm text-gray-600">
                                                    ฿{parseFloat(rental.monthly_rent).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Deposit */}
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Deposit</p>
                                                <p className="text-sm text-gray-600">
                                                    ฿{parseFloat(rental.deposit_amount).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Total Price */}
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Total Price</p>
                                                <p className="text-sm font-semibold text-blue-600">
                                                    ฿{parseFloat(rental.total_price).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tenant Info */}
                                    {rental.tenant_information && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Tenant:</span>{' '}
                                                {rental.tenant_information.first_name} {rental.tenant_information.last_name}
                                            </p>
                                        </div>
                                    )}

                                    {/* Contract Date */}
                                    {rental.contract_date && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-500">
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
        </div>
    );
};

export default BookingsListPage;
