import { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
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
import { Edit, Trash2, Loader2 } from 'lucide-react';

// Types
interface Room {
    id: number;
    name: string;
    type: string;
    price_per_month: string;
    status: 'available' | 'occupied' | 'maintenance';
    description: string | null;
    image_path: string | null;
    image_url: string | null;
    amenities: string[] | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    roomId: string | number;
}

export default function RoomShow({ roomId }: Props) {
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Rooms', href: '/rooms' },
        { title: room?.name || 'Loading...', href: `/rooms/${roomId}` },
    ];

    // Fetch room details
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/rooms/${roomId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Room not found');
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setRoom(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch room details');
                console.error('Error fetching room:', err);
            } finally {
                setLoading(false);
            }
        };

        if (roomId) {
            fetchRoom();
        }
    }, [roomId]);

    // Handle delete
    const handleDelete = async () => {
        setDeleting(true);
        try {
            const response = await fetch(`/api/admin/rooms/${roomId}`, {
                method: 'DELETE',
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

            if (!response.ok) {
                const result = await response.json();
                if (response.status === 419) {
                    throw new Error('CSRF token mismatch. Please refresh the page.');
                }
                throw new Error(result.message || 'Failed to delete room');
            }

            // Success - redirect to rooms list
            router.visit('/rooms');
        } catch (error) {
            console.error('Error deleting room:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete room');
        } finally {
            setDeleting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 text-lg">Loading room details...</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    // Error state
    if (error || !room) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md mx-auto p-6">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            <h3 className="font-bold text-lg mb-2">Error</h3>
                            <p>{error || 'Room not found'}</p>
                            <Link
                                href="/rooms"
                                className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                            >
                                Back to Rooms
                            </Link>
                        </div>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    // Status badge color
    const statusColors = {
        available: 'bg-green-500 text-white',
        occupied: 'bg-red-500 text-white',
        maintenance: 'bg-yellow-500 text-white',
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="p-6">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href="/rooms"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        <span className="mr-2">←</span>
                        Back to All Rooms
                    </Link>
                </div>

                {/* Room Details */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Image Section */}
                        <div className="relative h-64 sm:h-96 lg:h-full bg-gray-200">
                            {room.image_url ? (
                                <img
                                    src={room.image_url}
                                    alt={room.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                    <div className="text-center">
                                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mt-4 text-lg text-gray-500">No Image Available</p>
                                    </div>
                                </div>
                            )}
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                                <span className={`${statusColors[room.status]} px-4 py-2 rounded-full text-sm font-semibold shadow-lg capitalize`}>
                                    {room.status}
                                </span>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="p-6 sm:p-8 lg:p-10">
                            {/* Room Name & Type */}
                            <div className="mb-6">
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                                    {room.name}
                                </h1>
                                <p className="text-lg text-gray-600">{room.type}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-bold text-blue-600">
                                        ฿{parseFloat(room.price_per_month).toLocaleString()}
                                    </span>
                                    <span className="text-xl text-gray-500 ml-2">/month</span>
                                </div>
                            </div>

                            {/* Description */}
                            {room.description && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                                    <p className="text-gray-700 leading-relaxed">{room.description}</p>
                                </div>
                            )}

                            {/* Amenities */}
                            {room.amenities && room.amenities.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h2>
                                    <div className="grid grid-cols-2 gap-2">
                                        {room.amenities.map((amenity, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center text-gray-700"
                                            >
                                                <span className="text-green-500 mr-2">✓</span>
                                                <span className="capitalize">{amenity.replace(/_/g, ' ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Current Tenant */}
                            {room.status === 'occupied' && room.rentals && room.rentals.length > 0 && (
                                <div className="mb-6 pb-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Current Tenant</h2>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Tenant:</span>
                                                <span className="font-medium text-gray-900">
                                                    {room.rentals[0].tenant_information 
                                                        ? `${room.rentals[0].tenant_information.first_name} ${room.rentals[0].tenant_information.last_name}`
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Contract:</span>
                                                <span className="font-medium text-gray-900">
                                                    #{room.rentals[0].contract_number || room.rentals[0].id}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Start Date:</span>
                                                <span className="font-medium text-gray-900">
                                                    {new Date(room.rentals[0].start_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">End Date:</span>
                                                <span className="font-medium text-gray-900">
                                                    {new Date(room.rentals[0].end_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className={`font-medium ${
                                                    room.rentals[0].status === 'approved' ? 'text-green-600' :
                                                    room.rentals[0].status === 'active' ? 'text-blue-600' :
                                                    'text-gray-600'
                                                }`}>
                                                    {room.rentals[0].status.charAt(0).toUpperCase() + room.rentals[0].status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">Information</h2>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Room ID:</span>
                                        <span className="font-medium text-gray-900">#{room.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(room.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Updated:</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(room.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        onClick={() => router.visit(`/rooms/${roomId}/edit`)}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                className="w-full"
                                                disabled={deleting}
                                            >
                                                {deleting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </>
                                                )}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the room
                                                    "{room.name}" from the system.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDelete}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                {room.status === 'available' ? (
                                    <Link href={`/bookings/create/${room.id}`}>
                                        <Button className="w-full" size="lg">
                                            Book This Room
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button 
                                        className="w-full" 
                                        size="lg" 
                                        disabled
                                        variant="secondary"
                                    >
                                        {room.status === 'occupied' 
                                            ? 'Room Occupied - Not Available' 
                                            : room.status === 'maintenance'
                                                ? 'Under Maintenance'
                                                : 'Not Available'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
