import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Calendar, DollarSign } from 'lucide-react';

interface Invoice {
    id: number;
    rental_id: number;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    room_rent: string;
    electricity_charge: string;
    water_charge: string;
    total_amount: string;
    status: 'unpaid' | 'paid' | 'overdue';
    electricity_units: number;
    created_at: string;
    updated_at: string;
    rental: {
        id: number;
        room: {
            id: number;
            name: string;
            type: string;
        };
    };
}

export default function TenantInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Invoices', href: '/tenant/invoices' },
    ];

    // Fetch invoices when component loads
    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/user/invoices', {
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch invoices');
            }

            const data = await response.json();
            setInvoices(data.data || []);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
            case 'unpaid':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Unpaid</Badge>;
            case 'overdue':
                return <Badge variant="destructive">Overdue</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
        }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
    };

    if (loading) {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                <Head title="My Invoices" />
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading invoices...</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="My Invoices" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <FileText className="h-8 w-8" />
                            My Invoices
                        </h1>
                        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                            View and manage your rental invoices
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <Alert variant="destructive">
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                {/* Invoices Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice History</CardTitle>
                        <CardDescription>
                            All invoices for your rental payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {invoices.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    No invoices found
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice Number</TableHead>
                                            <TableHead>Room</TableHead>
                                            <TableHead>Issue Date</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead className="text-right">Total Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoices.map((invoice) => (
                                            <TableRow
                                                key={invoice.id}
                                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                                onClick={() => handleViewDetails(invoice)}
                                            >
                                                <TableCell className="font-medium">
                                                    {invoice.invoice_number}
                                                </TableCell>
                                                <TableCell>
                                                    {invoice.rental.room.name}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        {formatDate(invoice.issue_date)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(invoice.due_date)}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {formatCurrency(invoice.total_amount)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(invoice.status)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewDetails(invoice);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
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

            {/* Invoice Details Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Invoice Details
                        </DialogTitle>
                        <DialogDescription>
                            {selectedInvoice?.invoice_number}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-6">
                            {/* Invoice Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Room</p>
                                    <p className="font-semibold">{selectedInvoice.rental.room.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                    <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Issue Date</p>
                                    <p className="font-medium">{formatDate(selectedInvoice.issue_date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
                                    <p className="font-medium">{formatDate(selectedInvoice.due_date)}</p>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg">Payment Breakdown</h3>
                                
                                <div className="space-y-2">
                                    {/* Room Rent */}
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-gray-700 dark:text-gray-300">
                                            ค่าเช่าห้อง
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(selectedInvoice.room_rent)}
                                        </span>
                                    </div>

                                    {/* Electricity */}
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-gray-700 dark:text-gray-300">
                                            ค่าไฟฟ้า ({selectedInvoice.electricity_units} หน่วย)
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(selectedInvoice.electricity_charge)}
                                        </span>
                                    </div>

                                    {/* Water */}
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-gray-700 dark:text-gray-300">
                                            ค่าน้ำ (เหมาจ่าย)
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(selectedInvoice.water_charge)}
                                        </span>
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center py-3 bg-blue-50 dark:bg-blue-900/20 px-4 rounded-lg mt-4">
                                        <span className="text-lg font-semibold flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            รวมทั้งสิ้น
                                        </span>
                                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                            {formatCurrency(selectedInvoice.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-end pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
