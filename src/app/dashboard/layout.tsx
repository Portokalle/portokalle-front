'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { logout } from '../services/authService';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        // Debug output
        console.log('Dashboard Layout: Loading');
        
        // Function to fetch user role from localStorage
        const fetchUserRole = () => {
            try {
                // For demonstration, we'll use localStorage
                const storedRole = localStorage.getItem('userRole');
                console.log('Dashboard Layout: Role from localStorage:', storedRole);
                
                if (storedRole) {
                    setUserRole(storedRole);
                } else {
                    console.warn('No user role found in localStorage, using default');
                    setUserRole('patient'); // Default fallback
                }
            } catch (error) {
                console.error('Failed to fetch user role:', error);
                setUserRole('patient'); // Keep default role in case of error
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchUserRole();
        
        // Window resize handler
        if (typeof window !== 'undefined') {
            const handleResize = () => {
                if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                } else {
                    setSidebarOpen(true);
                }
            };
            handleResize();
            window.addEventListener('resize', handleResize);
            
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    // Debug - log when children prop changes
    useEffect(() => {
        console.log('Dashboard Layout: Children prop updated');
    }, [children]);

    const handleLogout = async () => {
        const success = await logout();
        if (success) {
            // Use hard navigation for logout
            window.location.href = '/login';
        }
    };

    const navItems = userRole === 'doctor'
        ? [
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Upcoming Appointments', href: '/dashboard/appointments/upcoming' },
            { name: 'Appointment History', href: '/dashboard/appointments' },
            { name: 'My Profile', href: '/dashboard/profile' },
        ]
        : [
            { name: 'Dashboard', href: '/dashboard' },
            { name: 'Search Doctors', href: '/dashboard/search' },
            { name: 'New Appointment', href: '/dashboard/new-appointment' },
            { name: 'Appointment History', href: '/dashboard/appointments' },
            { name: 'My Profile', href: '/dashboard/profile' },
        ];

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="loading loading-spinner loading-lg"></div>
            <span className="ml-2">Loading dashboard...</span>
        </div>;
    }

    return (
        <div className="min-h-screen bg-base-200">
            {/* Sidebar - with overlay for mobile */}
            {sidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-base-100 shadow-xl transition-all duration-300 z-30 
                    ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}
            >
                <div className="p-4 w-64">
                    <div className="mb-6 text-center">
                        <div className="text-lg font-bold">{userRole === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}</div>
                    </div>
                    <nav className="mt-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block py-2.5 px-4 rounded-lg hover:bg-base-200 transition-colors"
                                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        
                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left py-2.5 px-4 rounded-lg hover:bg-base-200 transition-colors mt-8 text-error"
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
                <header className="bg-base-100 shadow-md">
                    <div className="flex items-center justify-between p-4 relative">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="btn btn-square btn-ghost z-10"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>

                        {/* Logo centered using flex and responsive width */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 max-w-[50%]">
                            <Image 
                                src="/img/logo.png" 
                                alt="logo" 
                                width={200} 
                                height={100} 
                                className="w-auto h-auto" 
                                style={{ maxHeight: '2.5rem' }}
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium hidden md:inline-block">
                                {userRole === 'doctor' ? 'Doctor Account' : 'Patient Account'}
                            </span>
                            <div className="avatar placeholder">
                                <div className="bg-neutral text-neutral-content rounded-full w-8">
                                    <span className="text-xs">{userRole?.charAt(0).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="p-3 md:p-6">
                    {/* Render children */}
                    {children}
                </main>
            </div>
        </div>
    );
}
