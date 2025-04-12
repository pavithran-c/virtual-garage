import React from 'react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[28rem] md:h-[32rem] flex items-center justify-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 via-black/60 to-teal-900/50"></div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 animate-fade-in-down tracking-tight drop-shadow-lg">
            About Friends Car Care
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            Your trusted partner for exceptional auto repair and maintenance.
          </p>
        </div>
      </section>
      

      {/* Main Content */}
      <section className="max-w-7xl mx-auto py-24 px-6 md:px-8">
        {/* Who We Are */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          
          <div className="flex flex-col justify-center order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-extrabold text-teal-900 mb-6 animate-fade-in-up bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-900">
              Who We Are
            </h2>
            <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
              Founded in 2010, Friends Car Care is dedicated to providing exceptional auto repair and maintenance services. Our mission is to ensure every vehicle leaves our shop in top condition, with a focus on customer satisfaction and quality workmanship.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 order-1 lg:order-2">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
              alt="Car repair"
              className="w-full h-80 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        </div>

        {/* Our Services */}
        <div className="mb-24">
          <h2 className="text-4xl md:text-5xl font-extrabold text-teal-900 mb-12 text-center animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-900">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border-t-4 border-orange-500">
              <h3 className="text-2xl font-bold text-orange-600 mb-4">Routine Maintenance</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                From oil changes to tire rotations, we keep your car running smoothly.
              </p>
            </div>
            <div className="relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border-t-4 border-orange-500">
              <h3 className="text-2xl font-bold text-orange-600 mb-4">Engine Repairs</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Our certified technicians handle complex engine repairs with precision.
              </p>
            </div>
            <div className="relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border-t-4 border-orange-500">
              <h3 className="text-2xl font-bold text-orange-600 mb-4">AI-Powered Diagnostics</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Get real-time insights and recommendations for your vehicle issues.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="relative bg-gradient-to-r from-teal-800 to-teal-600 text-white p-12 rounded-2xl mb-24 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-10"></div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-center relative z-10">Why Choose Us?</h2>
          <p className="text-center max-w-4xl mx-auto text-lg md:text-xl font-light leading-relaxed relative z-10">
            With a team of certified technicians and state-of-the-art facilities, we provide top-notch services tailored to your needs. Our website offers a seamless experience for booking, tracking, and managing your car care—all designed to make your life easier.
          </p>
        </div>

        {/* Meet the Team */}
        <div className="mb-24">
          <h2 className="text-4xl md:text-5xl font-extrabold text-teal-900 mb-12 text-center animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-900">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-t-2 border-teal-600">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-6 overflow-hidden shadow-inner"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">John Doe</h3>
              <p className="text-gray-600 text-base">Lead Technician</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-t-2 border-teal-600">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-6 overflow-hidden shadow-inner"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Jane Smith</h3>
              <p className="text-gray-600 text-base">Customer Service Manager</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-t-2 border-teal-600">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-6 overflow-hidden shadow-inner"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Mike Johnson</h3>
              <p className="text-gray-600 text-base">Diagnostics Specialist</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <a
            href="/services"
            className="inline-block bg-gradient-to-r from-orange-500 to-orange-700 text-white px-12 py-5 rounded-full font-semibold text-lg hover:from-orange-600 hover:to-orange-800 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Book a Service Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;