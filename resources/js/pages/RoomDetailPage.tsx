import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

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

const RoomDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch room details
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/rooms/${id}`);

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

        if (id) {
            fetchRoom();
        }
    }, [id]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600 text-lg">Loading room details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !room) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        <h3 className="font-bold text-lg mb-2">Error</h3>
                        <p>{error || 'Room not found'}</p>
                        <Link
                            to="/rooms"
                            className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                        >
                            Back to Rooms
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const imageUrl = room.image_url || '/images/placeholder-room.jpg';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Button */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        to="/rooms"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        <span className="mr-2">←</span>
                        Back to All Rooms
                    </Link>
                </div>
            </div>

            {/* Room Details */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Image Section */}
                        <div className="relative h-64 sm:h-96 lg:h-full bg-gray-200">
                            <img
                                src={imageUrl}
                                alt={room.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = '/images/placeholder-room.jpg';
                                }}
                            />
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4">
                                <span
                                    className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${room.status === 'available'
                                        ? 'bg-green-500 text-white'
                                        : room.status === 'occupied'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-yellow-500 text-white'
                                        }`}
                                >
                                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
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

                            {/* Action Buttons */}
                            <div className="mt-8 space-y-3">
                                {room.status === 'available' ? (
                                    <>
                                        <Link to={`/bookings/create/${room.id}`}>
                                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md">
                                                Book This Room
                                            </button>
                                        </Link>
                                        <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors">
                                            Contact Us
                                        </button>
                                    </>
                                ) : (
                                    <div className="bg-gray-100 text-gray-600 text-center py-3 px-6 rounded-lg">
                                        This room is currently {room.status}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetailPage;
