import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Services from './pages/Services';
import Barbers from './pages/Barbers';
import Booking from './pages/Booking';
import Reviews from './pages/Reviews';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Шапка сайту буде відображатись скрізь */}
        <Navbar />

        {/* Основний контент, який змінюється залежно від сторінки */}
        <main className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/barbers" element={<Barbers />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        {/* Футер також буде на кожній сторінці */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;