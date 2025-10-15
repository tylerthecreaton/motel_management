import { useState, FormEvent, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';

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
}

interface Props {
    roomId: string | number;
}

export default function RoomEdit({ roomId }: Props) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [room, setRoom] = useState<Room | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        price_per_month: '',
        description: '',
        status: 'available' as 'available' | 'occupied' | 'maintenance',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [amenities, setAmenities] = useState<string[]>([]);
    const [newAmenity, setNewAmenity] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Rooms', href: '/rooms' },
        { title: room?.name || 'Edit Room', href: `/rooms/${roomId}/edit` },
    ];

    // Fetch room data
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await fetch(`/api/rooms/${roomId}`);
                if (!response.ok) throw new Error('Failed to fetch room');

                const data = await response.json();
                const roomData = data.data;

                setRoom(roomData);
                setFormData({
                    name: roomData.name,
                    type: roomData.type,
                    price_per_month: roomData.price_per_month,
                    description: roomData.description || '',
                    status: roomData.status,
                });
                setAmenities(roomData.amenities || []);
                setImagePreview(roomData.image_url);
            } catch (error) {
                console.error('Error fetching room:', error);
                setErrors({ general: 'Failed to load room data' });
            } finally {
                setFetching(false);
            }
        };

        fetchRoom();
    }, [roomId]);

    // Handle input change
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Handle image change
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'Image size must not exceed 2MB' }));
                return;
            }

            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setErrors(prev => ({ ...prev, image: 'Image must be JPEG, PNG, or JPG' }));
                return;
            }

            setImageFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            if (errors.image) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.image;
                    return newErrors;
                });
            }
        }
    };

    // Add amenity
    const handleAddAmenity = () => {
        if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
            setAmenities(prev => [...prev, newAmenity.trim()]);
            setNewAmenity('');
        }
    };

    // Remove amenity
    const handleRemoveAmenity = (amenity: string) => {
        setAmenities(prev => prev.filter(a => a !== amenity));
    };

    // Handle submit
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const data = new FormData();
            data.append('_method', 'PUT'); // Laravel method spoofing
            data.append('name', formData.name);
            data.append('type', formData.type);
            data.append('price_per_month', formData.price_per_month);
            data.append('description', formData.description);
            data.append('status', formData.status);

            if (imageFile) {
                data.append('image', imageFile);
            }

            amenities.forEach((amenity, index) => {
                data.append(`amenities[${index}]`, amenity);
            });

            const response = await fetch(`/api/admin/rooms/${roomId}`, {
                method: 'POST', // Use POST with _method=PUT for multipart/form-data
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
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 422) {
                    setErrors(result.errors || {});
                } else if (response.status === 419) {
                    throw new Error('CSRF token mismatch. Please refresh the page.');
                } else {
                    throw new Error(result.message || 'Failed to update room');
                }
                return;
            }

            // Success - redirect to room detail
            router.visit(`/rooms/${roomId}`, {
                onSuccess: () => {
                    console.log('Room updated successfully');
                },
            });
        } catch (error) {
            console.error('Error updating room:', error);
            setErrors({ general: error instanceof Error ? error.message : 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </AppSidebarLayout>
        );
    }

    if (!room) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        Room not found
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.visit(`/rooms/${roomId}`)}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Room Details
                    </Button>
                    <h1 className="text-3xl font-bold">Edit Room</h1>
                    <p className="text-gray-600 mt-2">Update room information</p>
                </div>

                {/* Error Alert */}
                {errors.general && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {errors.general}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Room Information</CardTitle>
                            <CardDescription>Update the room details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Room Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Room Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            {/* Room Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">
                                    Room Type <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => handleInputChange('type', value)}
                                >
                                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Single Room">Single Room</SelectItem>
                                        <SelectItem value="Double Room">Double Room</SelectItem>
                                        <SelectItem value="Studio">Studio</SelectItem>
                                        <SelectItem value="Deluxe Room">Deluxe Room</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <Label htmlFor="price">
                                    Price per Month (฿) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price_per_month}
                                    onChange={(e) => handleInputChange('price_per_month', e.target.value)}
                                    className={errors.price_per_month ? 'border-red-500' : ''}
                                />
                                {errors.price_per_month && (
                                    <p className="text-sm text-red-500">{errors.price_per_month}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: any) => handleInputChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="occupied">Occupied</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="image">Room Image</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={handleImageChange}
                                    className={errors.image ? 'border-red-500' : ''}
                                />
                                {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
                                <p className="text-sm text-gray-500">
                                    Leave empty to keep current image. Max: 2MB
                                </p>

                                {imagePreview && (
                                    <div className="mt-4">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-w-xs rounded-lg border"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Amenities */}
                            <div className="space-y-2">
                                <Label>Amenities</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add amenity"
                                        value={newAmenity}
                                        onChange={(e) => setNewAmenity(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddAmenity();
                                            }
                                        }}
                                    />
                                    <Button type="button" variant="outline" onClick={handleAddAmenity}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {amenities.map((amenity) => (
                                            <div
                                                key={amenity}
                                                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2"
                                            >
                                                <span className="text-sm">{amenity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAmenity(amenity)}
                                                    className="hover:text-blue-900"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 mt-6">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Room'
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(`/rooms/${roomId}`)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
