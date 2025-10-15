import { useState, FormEvent } from 'react';
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

export default function RoomCreate() {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        price_per_month: '',
        description: '',
        status: 'available',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [amenities, setAmenities] = useState<string[]>([]);
    const [newAmenity, setNewAmenity] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Rooms', href: '/rooms' },
        { title: 'Create New Room', href: '/rooms/create' },
    ];

    // Handle input change
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
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
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'Image size must not exceed 2MB' }));
                return;
            }

            // Validate file type
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setErrors(prev => ({ ...prev, image: 'Image must be JPEG, PNG, or JPG' }));
                return;
            }

            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Clear error
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
            // Create FormData for multipart/form-data
            const data = new FormData();
            data.append('name', formData.name);
            data.append('type', formData.type);
            data.append('price_per_month', formData.price_per_month);
            data.append('description', formData.description);

            if (imageFile) {
                data.append('image', imageFile);
            }

            amenities.forEach((amenity, index) => {
                data.append(`amenities[${index}]`, amenity);
            });

            const response = await fetch('/api/admin/rooms', {
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
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 422) {
                    // Validation errors
                    setErrors(result.errors || {});
                } else if (response.status === 419) {
                    throw new Error('CSRF token mismatch. Please refresh the page.');
                } else {
                    throw new Error(result.message || 'Failed to create room');
                }
                return;
            }

            // Success - redirect to rooms list
            router.visit('/rooms', {
                onSuccess: () => {
                    // Show success message (you can use toast here)
                    console.log('Room created successfully');
                },
            });
        } catch (error) {
            console.error('Error creating room:', error);
            setErrors({ general: error instanceof Error ? error.message : 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/rooms')}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Rooms
                    </Button>
                    <h1 className="text-3xl font-bold">Create New Room</h1>
                    <p className="text-gray-600 mt-2">Add a new room to the system</p>
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
                            <CardDescription>Enter the details of the new room</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Room Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Room Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Room 101"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
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
                                        <SelectValue placeholder="Select room type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Single Room">Single Room</SelectItem>
                                        <SelectItem value="Double Room">Double Room</SelectItem>
                                        <SelectItem value="Studio">Studio</SelectItem>
                                        <SelectItem value="Deluxe Room">Deluxe Room</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <p className="text-sm text-red-500">{errors.type}</p>
                                )}
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
                                    placeholder="5000"
                                    value={formData.price_per_month}
                                    onChange={(e) => handleInputChange('price_per_month', e.target.value)}
                                    className={errors.price_per_month ? 'border-red-500' : ''}
                                />
                                {errors.price_per_month && (
                                    <p className="text-sm text-red-500">{errors.price_per_month}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter room description..."
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
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
                                {errors.image && (
                                    <p className="text-sm text-red-500">{errors.image}</p>
                                )}
                                <p className="text-sm text-gray-500">
                                    Maximum file size: 2MB. Accepted formats: JPEG, PNG, JPG
                                </p>

                                {/* Image Preview */}
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
                                        placeholder="e.g., wifi, air_con"
                                        value={newAmenity}
                                        onChange={(e) => setNewAmenity(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddAmenity();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddAmenity}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Amenities List */}
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
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Room'
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/rooms')}
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
