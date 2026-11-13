import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminSidebar from './components/AdminSidebar';

import Home from './pages/Home';
import Services from './pages/Services';
import Barbers from './pages/Barbers';
import Booking from './pages/Booking';
import Reviews from './pages/Reviews';

import Admin from './pages/Admin';
import AdminClients from './pages/AdminClients';
import AdminBarbers from './pages/AdminBarbers';
import AdminServices from './pages/AdminServices';
import AdminSchedules from './pages/AdminSchedules';
import AdminPayments from './pages/AdminPayments';
import AdminReviews from './pages/AdminReviews';
import AdminLogin from './pages/AdminLogin';

function Layout() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem('isAdminAuth') === 'true';
    });

    const isAdmin = isAdminRoute && isAuthenticated;

    return (
        <div className="flex flex-col min-h-screen bg-barber-main text-barber-light">
            <ScrollToTop />
            
            {/* Хедер зникає на будь-якій сторінці /admin */}
            {!isAdminRoute && <Navbar />}

            <div className={isAdmin ? "flex flex-1" : "flex flex-col grow"}>
                {isAdmin && <AdminSidebar />}

                <main className="grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/barbers" element={<Barbers />} />
                        <Route path="/booking" element={<Booking />} />
                        <Route path="/reviews" element={<Reviews />} />

                        {/* Логіка входу в адмінку */}
                        {isAdminRoute && !isAuthenticated ? (
                            <Route path="/admin/*" element={<AdminLogin onLogin={() => setIsAuthenticated(true)} />} />
                        ) : (
                            <>
                                <Route path="/admin" element={<Admin />} />
                                <Route path="/admin/clients" element={<AdminClients />} />
                                <Route path="/admin/barbers" element={<AdminBarbers />} />
                                <Route path="/admin/services" element={<AdminServices />} />
                                <Route path="/admin/schedules" element={<AdminSchedules />} />
                                <Route path="/admin/payments" element={<AdminPayments />} />
                                <Route path="/admin/reviews" element={<AdminReviews />} />
                            </>
                        )}
                    </Routes>
                </main>
            </div>

            {/* Футер зникає на будь-якій сторінці /admin */}
            {!isAdminRoute && <Footer />}
        </div>
    );
}

function App() {
    return (
        <Router>
            <Layout />
        </Router>
    );
}

export default App;