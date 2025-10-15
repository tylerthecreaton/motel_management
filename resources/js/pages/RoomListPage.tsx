import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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

const RoomListPage = () => {
    // State management
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string>('all');
    const [roomTypes, setRoomTypes] = useState<string[]>([]);

    // Fetch rooms from API
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                setError(null);

                // เรียก API โดยไม่ต้อง authentication (public endpoint)
                const response = await fetch('/api/rooms?status=available&per_page=100');

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

    // Filter rooms by type
    useEffect(() => {
        if (selectedType === 'all') {
            setFilteredRooms(rooms);
        } else {
            setFilteredRooms(rooms.filter(room => room.type === selectedType));
        }
    }, [selectedType, rooms]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600 text-lg">Loading rooms...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Available Rooms</h1>
                    <p className="mt-2 text-gray-600">
                        Find your perfect room from our {filteredRooms.length} available options
                    </p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <label htmlFor="room-type" className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Room Type
                    </label>
                    <select
                        id="room-type"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="block w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        <option value="all">All Types ({rooms.length})</option>
                        {roomTypes.map(type => (
                            <option key={type} value={type}>
                                {type} ({rooms.filter(r => r.type === type).length})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {filteredRooms.length === 0 ? (
                    <div className="text-center py-12">
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
        </div>
    );
};

// Room Card Component
interface RoomCardProps {
    room: Room;
}

const RoomCard = ({ room }: RoomCardProps) => {
    // Default image ถ้าไม่มีรูปภาพ
    const imageUrl = room.image_url || '/images/placeholder-room.jpg';

    return (
        <Link
            to={`/rooms/${room.id}`}
            className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-500"
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                        // Fallback ถ้าโหลดรูปไม่ได้
                        e.currentTarget.src = '/images/placeholder-room.jpg';
                    }}
                />
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                        Available
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
};

export default RoomListPage;
