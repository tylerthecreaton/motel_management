import { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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

interface PaginatedResponse {
    current_page: number;
    data: Room[];
    per_page: number;
    total: number;
    last_page: number;
}

export default function RoomsIndex() {
    // State management
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [roomTypes, setRoomTypes] = useState<string[]>([]);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Rooms', href: '/rooms' },
    ];

    // Fetch rooms from API
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/rooms?per_page=100');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: PaginatedResponse = await response.json();
                setRooms(data.data);
                setFilteredRooms(data.data);

                // สร้างรายการ room types ที่ไม่ซ้ำกัน
                const types = Array.from(new Set(data.data.map(room => room.type)));
                setRoomTypes(types);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
                console.error('Error fetching rooms:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    // Filter rooms by type and status
    useEffect(() => {
        let filtered = rooms;

        if (selectedType !== 'all') {
            filtered = filtered.filter(room => room.type === selectedType);
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(room => room.status === selectedStatus);
        }

        setFilteredRooms(filtered);
    }, [selectedType, selectedStatus, rooms]);

    // Loading state
    if (loading) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 text-lg">Loading rooms...</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md mx-auto p-6">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            <h3 className="font-bold text-lg mb-2">Error</h3>
                            <p>{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
                        <p className="mt-2 text-gray-600">
                            Manage and view all rooms ({filteredRooms.length} of {rooms.length} rooms)
                        </p>
                    </div>
                    <Button onClick={() => router.visit('/rooms/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Room
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Type Filter */}
                        <div>
                            <label htmlFor="room-type" className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Room Type
                            </label>
                            <select
                                id="room-type"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="all">All Types ({rooms.length})</option>
                                {roomTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type} ({rooms.filter(r => r.type === type).length})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label htmlFor="room-status" className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Status
                            </label>
                            <select
                                id="room-status"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="all">All Status ({rooms.length})</option>
                                <option value="available">Available ({rooms.filter(r => r.status === 'available').length})</option>
                                <option value="occupied">Occupied ({rooms.filter(r => r.status === 'occupied').length})</option>
                                <option value="maintenance">Maintenance ({rooms.filter(r => r.status === 'maintenance').length})</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Rooms Grid */}
                {filteredRooms.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border">
                        <p className="text-gray-500 text-lg">No rooms found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredRooms.map(room => (
                            <RoomCard key={room.id} room={room} />
                        ))}
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}

// Room Card Component
interface RoomCardProps {
    room: Room;
}

function RoomCard({ room }: RoomCardProps) {
    // Status badge color
    const statusColors = {
        available: 'bg-green-500 text-white',
        occupied: 'bg-red-500 text-white',
        maintenance: 'bg-yellow-500 text-white',
    };

    return (
        <Link
            href={`/rooms/${room.id}`}
            className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-500"
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-200 overflow-hidden">
                {room.image_url ? (
                    <img
                        src={room.image_url}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">No Image</p>
                        </div>
                    </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`${statusColors[room.status]} text-xs font-semibold px-3 py-1 rounded-full shadow-lg capitalize`}>
                        {room.status}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Room Name */}
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {room.name}
                </h3>

                {/* Room Type */}
                <p className="text-sm text-gray-500 mt-1">{room.type}</p>

                {/* Description */}
                {room.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {room.description}
                    </p>
                )}

                {/* Amenities */}
                {room.amenities && room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                            <span
                                key={index}
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                            >
                                {amenity}
                            </span>
                        ))}
                        {room.amenities.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                +{room.amenities.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-baseline justify-between">
                        <div>
                            <span className="text-2xl font-bold text-blue-600">
                                ฿{parseFloat(room.price_per_month).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">/month</span>
                        </div>
                        <span className="text-blue-600 group-hover:translate-x-1 transition-transform inline-block">
                            →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
