import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Calendar, Info } from 'lucide-react';

interface Room {
    id: number;
    name: string;
    type: string;
    status: string;
}

interface ElectricityUsage {
    id: number;
    room_id: number;
    reading_date: string;
    previous_units: number;
    current_units: number;
    units_used: number;
}

interface FormData {
    room_id: string;
    reading_date: string;
    current_units: string;
}

interface ValidationErrors {
    room_id?: string[];
    reading_date?: string[];
    current_units?: string[];
}

interface RecordElectricityUsageFormProps {
    onSuccess?: () => void;
}

export default function RecordElectricityUsageForm({ onSuccess }: RecordElectricityUsageFormProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [lastReading, setLastReading] = useState<ElectricityUsage | null>(null);
    const [formData, setFormData] = useState<FormData>({
        room_id: '',
        reading_date: new Date().toISOString().split('T')[0], // Today's date
        current_units: '',
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [fetchingRooms, setFetchingRooms] = useState(true);
    const [fetchingLastReading, setFetchingLastReading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch rooms when component loads
    useEffect(() => {
        fetchRooms();
    }, []);

    // Fetch last reading when room is selected
    useEffect(() => {
        if (formData.room_id) {
            fetchLastReading(parseInt(formData.room_id));
        } else {
            setLastReading(null);
        }
    }, [formData.room_id]);

    const fetchRooms = async () => {
        try {
            setFetchingRooms(true);
            const response = await fetch('/api/rooms', {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch rooms');
            }

            const data = await response.json();
            // Handle both paginated and non-paginated responses
            const roomsData = data.data || data;
            setRooms(Array.isArray(roomsData) ? roomsData : []);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to load rooms');
        } finally {
            setFetchingRooms(false);
        }
    };

    const fetchLastReading = async (roomId: number) => {
        try {
            setFetchingLastReading(true);
            // ใช้ API endpoint ที่จะดึงข้อมูลการบันทึกล่าสุดของห้อง
            // หากยังไม่มี endpoint นี้ ควรสร้างขึ้นมา หรือดึงจาก electricity-usages
            const response = await fetch(`/api/admin/electricity-usages?room_id=${roomId}&latest=1`, {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                // สมมติว่า API ส่งข้อมูลล่าสุดมา
                if (data.data && data.data.length > 0) {
                    setLastReading(data.data[0]);
                } else {
                    setLastReading(null);
                }
            } else {
                setLastReading(null);
            }
        } catch (err) {
            console.error('Error fetching last reading:', err);
            setLastReading(null);
        } finally {
            setFetchingLastReading(false);
        }
    };

    // Handle input change
    const handleChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }));
        }
        // Clear messages
        setSuccessMessage(null);
        setErrorMessage(null);
    };

    // Handle form submit
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const response = await fetch('/api/admin/electricity-usages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie
                            .split('; ')
                            .find((row) => row.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1] || ''
                    ),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    room_id: parseInt(formData.room_id),
                    reading_date: formData.reading_date,
                    current_units: parseInt(formData.current_units),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    // Validation errors
                    setErrors(data.errors);
                } else {
                    throw new Error(data.message || 'Failed to record electricity usage');
                }
                return;
            }

            // Success
            setSuccessMessage('Electricity usage recorded successfully!');
            
            // Reset form
            setFormData({
                room_id: '',
                reading_date: new Date().toISOString().split('T')[0],
                current_units: '',
            });
            setLastReading(null);

            // Call onSuccess callback if provided
            if (onSuccess) {
                onSuccess();
            }

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to record electricity usage');
        } finally {
            setLoading(false);
        }
    };

    const selectedRoom = rooms.find(room => room.id === parseInt(formData.room_id));

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Record Electricity Usage
                </CardTitle>
                <CardDescription>
                    Record the current meter reading for a room
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Success Message */}
                {successMessage && (
                    <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            {successMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Room Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="room_id">
                            Room <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.room_id}
                            onValueChange={(value) => handleChange('room_id', value)}
                            disabled={fetchingRooms}
                        >
                            <SelectTrigger className={errors.room_id ? 'border-red-500' : ''}>
                                <SelectValue placeholder={fetchingRooms ? 'Loading rooms...' : 'Select a room'} />
                            </SelectTrigger>
                            <SelectContent>
                                {rooms.map((room) => (
                                    <SelectItem key={room.id} value={room.id.toString()}>
                                        {room.name} - {room.type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.room_id && (
                            <p className="text-sm text-red-500">{errors.room_id[0]}</p>
                        )}
                    </div>

                    {/* Last Reading Info */}
                    {formData.room_id && (
                        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertDescription className="text-blue-800 dark:text-blue-200">
                                {fetchingLastReading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></span>
                                        Loading last reading...
                                    </span>
                                ) : lastReading ? (
                                    <>
                                        Last recorded reading for <strong>{selectedRoom?.name}</strong> was{' '}
                                        <strong>{lastReading.current_units} units</strong> on{' '}
                                        {new Date(lastReading.reading_date).toLocaleDateString('th-TH')}
                                    </>
                                ) : (
                                    <>
                                        No previous reading found for <strong>{selectedRoom?.name}</strong>.
                                        This will be the first reading (previous units will be 0).
                                    </>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Reading Date */}
                    <div className="space-y-2">
                        <Label htmlFor="reading_date" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Reading Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="reading_date"
                            name="reading_date"
                            type="date"
                            value={formData.reading_date}
                            onChange={(e) => handleChange('reading_date', e.target.value)}
                            required
                            className={errors.reading_date ? 'border-red-500' : ''}
                        />
                        {errors.reading_date && (
                            <p className="text-sm text-red-500">{errors.reading_date[0]}</p>
                        )}
                    </div>

                    {/* Current Units */}
                    <div className="space-y-2">
                        <Label htmlFor="current_units">
                            Current Meter Reading (units) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="current_units"
                            name="current_units"
                            type="number"
                            min="0"
                            step="1"
                            value={formData.current_units}
                            onChange={(e) => handleChange('current_units', e.target.value)}
                            placeholder={lastReading ? `Must be greater than ${lastReading.current_units}` : 'Enter current meter reading'}
                            required
                            className={errors.current_units ? 'border-red-500' : ''}
                        />
                        {errors.current_units && (
                            <p className="text-sm text-red-500">{errors.current_units[0]}</p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter the current reading from the electricity meter
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={loading || fetchingRooms || fetchingLastReading}>
                            <Zap className="mr-2 h-4 w-4" />
                            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
