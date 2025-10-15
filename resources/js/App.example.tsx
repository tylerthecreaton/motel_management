import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoomListPage from './pages/RoomListPage';
import RoomDetailPage from './pages/RoomDetailPage';

/**
 * Main App Component with React Router
 * 
 * วิธีใช้งาน:
 * 1. เปลี่ยนชื่อไฟล์นี้เป็น App.tsx
 * 2. ติดตั้ง dependencies: npm install react-router-dom
 * 3. Import ใน main.tsx หรือ index.tsx
 */

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                {/* Optional: Add Navigation Bar */}
                <nav className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <a href="/" className="text-xl font-bold text-gray-900">
                                    Motel Management
                                </a>
                            </div>
                            <div className="flex items-center space-x-4">
                                <a
                                    href="/rooms"
                                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                >
                                    Browse Rooms
                                </a>
                                <a
                                    href="/login"
                                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                >
                                    Login
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Routes */}
                <Routes>
                    {/* Redirect root to rooms */}
                    <Route path="/" element={<Navigate to="/rooms" replace />} />
                    
                    {/* Room routes */}
                    <Route path="/rooms" element={<RoomListPage />} />
                    <Route path="/rooms/:id" element={<RoomDetailPage />} />
                    
                    {/* 404 Not Found */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>

                {/* Optional: Add Footer */}
                <footer className="bg-white border-t mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center text-gray-600">
                            <p>&copy; 2024 Motel Management. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </BrowserRouter>
    );
}

// 404 Not Found Page Component
const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page not found</p>
                <a
                    href="/rooms"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                    Back to Rooms
                </a>
            </div>
        </div>
    );
};

export default App;
