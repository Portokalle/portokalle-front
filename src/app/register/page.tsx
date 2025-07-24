'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient', // Default role
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            // Call the backend API to register the user and send the welcome email
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, name: formData.name }),
            });

            if (!response.ok) {
                throw new Error("Failed to send welcome email");
            }

            console.log("User registered and welcome email sent");
            setShowModal(true);

            setTimeout(() => {
                setShowModal(false);
                router.push("/login"); // Redirect to login
            }, 3000);
        } catch (error) {
            console.error("Registration failed:", error);
            setError("Failed to register user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold text-center mx-auto mb-4 text-gray-800">Register</h2>

                    <form onSubmit={handleSubmit} className="form-control gap-4">
                        <div>
                            <label className="label">
                                <span className="label-text text-gray-900">Name</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                className="input input-bordered w-full"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-gray-900">Surname</span>
                            </label>
                            <input
                                type="text"
                                name="surname"
                                placeholder="Your Surname"
                                className="input input-bordered w-full"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-gray-900">Phone Number</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Your Phone Number"
                                className="input input-bordered w-full"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-gray-900">Email</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="your.email@example.com"
                                className="input input-bordered w-full"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-gray-900">Password</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-gray-900">Confirm Password</span>
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                className="input input-bordered w-full"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-gray-900">Role</span>
                            </label>
                            <select
                                name="role"
                                className="select select-bordered w-full"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                            </select>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <button
                            type="submit"
                            className={`btn btn-primary w-full mt-2 ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>

                    <div className="divider my-6">OR</div>

                    <div className="text-center">
                        <p className="mb-2 text-gray-900">Already have an account?</p>
                        <Link href="/login" className="btn btn-outline btn-wide">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-2xl font-bold mb-4">Registration Successful!</h3>
                        <p className="text-gray-700">You will be redirected to the login page shortly.</p>
                    </div>
                </div>
            )}
        </div>
    );
}