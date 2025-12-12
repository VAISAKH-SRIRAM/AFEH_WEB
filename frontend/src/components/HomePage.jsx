import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, Activity, ShieldCheck, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col font-sans overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground tracking-tight">
              AFEH <span className="text-primary">PWA</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 text-secondary-foreground text-sm font-medium border border-secondary/50 mb-4 animate-delay-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              Accepting New Patients
            </div>

            <h1 className="text-5xl md:text-7xl font-heading font-bold text-foreground leading-tight tracking-tight animate-delay-100">
              Vision Care, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                Reimagined.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-delay-200">
              Experience world-class ophthalmology with a touch of care.
              Book appointments instantly, manage records, and track your eye health.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-delay-300">
              <Button
                size="lg"
                onClick={() => navigate('/book-appointment')}
                className="bg-primary hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto group"
              >
                Book Appointment
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="container mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8 text-blue-500" />}
              title="Expert Care"
              desc="Top-tier ophthalmologists using state-of-the-art diagnostic technology."
              delay="animate-delay-100"
            />
            <FeatureCard
              icon={<Calendar className="w-8 h-8 text-teal-500" />}
              title="Instant Booking"
              desc="Book appointments in seconds. No waiting lines, no hassle."
              delay="animate-delay-200"
            />
            <FeatureCard
              icon={<Activity className="w-8 h-8 text-indigo-500" />}
              title="Digital Records"
              desc="Secure, cloud-based patient history accessible anywhere, anytime."
              delay="animate-delay-300"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-gray-100 py-10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-gray-400 font-medium mb-4">
            © {new Date().getFullYear()} Ahalia Foundation Eye Hospital. Made with ❤️ for better vision.
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => navigate('/login')}
            className="text-gray-300 hover:text-primary transition-colors text-xs"
          >
            Staff Access
          </Button>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
  <div className={`glass p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group animate-fade-in ${delay}`}>
    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-heading font-bold mb-3 text-gray-800">{title}</h3>
    <p className="text-gray-500 leading-relaxed">
      {desc}
    </p>
  </div>
);

export default HomePage;