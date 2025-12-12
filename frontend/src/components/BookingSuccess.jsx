import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Home, CheckCircle, Calendar, Smartphone, User, Hash, Info } from 'lucide-react';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const booking = location.state?.booking;

  useEffect(() => {
    if (!booking) {
      navigate('/');
    }
    setTimeout(() => setIsAnimating(false), 800);
  }, [booking, navigate]);

  const downloadCard = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null, // Transparent bg to pick up the gradient if any
        scale: 3, // Higher resolution
        useCORS: true // For images
      });

      const link = document.createElement('a');
      link.download = `AFEH-Token-${booking.token_number}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading card:', error);
    }
  };

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 py-8 px-4 flex items-center justify-center font-sans">
      <div className="container mx-auto max-w-2xl animate-fade-in relative">
        {/* Confetti or decorative elements could go here */}

        {/* Success Message */}
        <div className="text-center mb-10 space-y-4">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full shadow-lg border-4 border-white ${isAnimating ? 'animate-bounce' : ''
            }`}>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 pb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-500 text-lg">Your appointment has been successfully scheduled.</p>
          </div>
        </div>

        {/* Booking Card */}
        <div className={`transition-all duration-1000 ease-out transform ${isAnimating ? 'scale-90 opacity-0 translate-y-10' : 'scale-100 opacity-100 translate-y-0'
          }`}>
          <div ref={cardRef} className="relative group perspective-1000">
            {/* Card Background Wrapper for download consistency */}
            <Card className="overflow-hidden border-0 shadow-2xl bg-white relative rounded-3xl">
              {/* Decorative Top Banner */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-teal-500" />
              <div className="absolute top-0 left-0 w-full h-32 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

              <div className="relative pt-8 px-8 pb-8">
                {/* Hospital Logo/Header */}
                <div className="text-center mb-8 relative z-10">
                  <div className="bg-white rounded-2xl p-4 shadow-lg inline-block mb-3 w-24 h-24 flex items-center justify-center mx-auto">
                    <img
                      src="https://customer-assets.emergentagent.com/job_7b5beda7-2c8f-4bc5-ad96-7a281f7f183a/artifacts/fshz7h5o_Untitled.png"
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-md">Ahalia Foundation Eye Hospital</h2>
                  <p className="text-blue-50 text-sm font-medium opacity-90">World-Class Eye Care</p>
                </div>

                {/* Main Content Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 mt-4">
                  {/* Token Display */}
                  <div className="text-center mb-8">
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 mb-2">Token Number</p>
                    <div className="inline-block relative">
                      <span className="text-6xl font-black text-gray-800 tracking-tighter z-10 relative">
                        {booking.token_number}
                      </span>
                      <div className="absolute -bottom-2 -nav-right-2 w-full h-3 bg-yellow-300/50 -rotate-2 rounded-full" />
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><User className="w-3 h-3" /> Patient Name</span>
                      <span className="text-gray-900 font-semibold text-lg truncate">{booking.patient_name}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</span>
                      <span className="text-blue-600 font-bold text-lg">
                        {format(new Date(booking.appointment_date), 'dd MMM yyyy')}
                      </span>
                    </div>
                    {booking.mr_number && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Hash className="w-3 h-3" /> MR Number</span>
                        <span className="text-gray-900 font-mono font-medium bg-gray-50 px-2 py-0.5 rounded w-fit">{booking.mr_number}</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Smartphone className="w-3 h-3" /> Mobile</span>
                      <span className="text-gray-900 font-medium">{booking.mobile}</span>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="mt-8 bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800 leading-relaxed">
                      <strong className="block mb-1 font-bold">Important Information</strong>
                      Please arrive <strong>15 minutes</strong> prior to your appointment time. Present this digital token at the reception desk.
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom Gradient Line */}
              <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-500" />
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
          <Button
            onClick={downloadCard}
            className="bg-gray-900 hover:bg-black text-white px-8 py-6 h-auto text-lg rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3"
          >
            <Download className="w-5 h-5" />
            Download Token
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="bg-white border-2 border-gray-100 hover:border-blue-200 text-gray-600 hover:text-blue-600 px-8 py-6 h-auto text-lg rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-3"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;