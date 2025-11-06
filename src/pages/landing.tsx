import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: "🎓",
      title: "Quality Education",
      description: "Excellence in academic programs and professional training"
    },
    {
      icon: "👨‍🏫",
      title: "Expert Faculty",
      description: "Learn from experienced and dedicated teaching professionals"
    },
    {
      icon: "🔬",
      title: "Modern Facilities",
      description: "State-of-the-art laboratories and learning resources"
    },
    {
      icon: "🌍",
      title: "Global Standards",
      description: "Education that meets international quality standards"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Graduate",
      text: "Morogoro Teachers College provided me with the skills and knowledge to excel in my career. The practical approach to learning made all the difference!"
    },
    {
      name: "Michael Chen",
      role: "Business Administration",
      text: "The supportive environment and dedicated faculty helped me achieve my academic goals. I'm proud to be an alumnus of this institution."
    },
    {
      name: "Amina Hassan",
      role: "Education Graduate",
      text: "The college's commitment to quality education and student development is exceptional. I gained both knowledge and confidence here."
    }
  ];

  // Memoize the testimonials length to prevent unnecessary re-renders
  const testimonialsLength = testimonials.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonialsLength);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonialsLength]); // Add testimonialsLength as dependency

  // Alternative solution: Move testimonials inside useEffect if they never change
  // useEffect(() => {
  //   const testimonials = [
  //     {
  //       name: "Sarah Johnson",
  //       role: "Computer Science Graduate",
  //       text: "Morogoro Teachers College provided me with the skills and knowledge to excel in my career. The practical approach to learning made all the difference!"
  //     },
  //     {
  //       name: "Michael Chen",
  //       role: "Business Administration",
  //       text: "The supportive environment and dedicated faculty helped me achieve my academic goals. I'm proud to be an alumnus of this institution."
  //     },
  //     {
  //       name: "Amina Hassan",
  //       role: "Education Graduate",
  //       text: "The college's commitment to quality education and student development is exceptional. I gained both knowledge and confidence here."
  //     }
  //   ];
  //   
  //   const interval = setInterval(() => {
  //     setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []); // Empty dependency array since testimonials is defined inside

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                 MTC
                </div>
                <span className="ml-3 text-xl font-bold text-gray-800">
                  Morogoro Teachers College
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#home" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">About</a>
                <a href="#programs" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Programs</a>
                <a href="#testimonials" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Testimonials</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/signin"
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Shaping Future
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Leaders</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-2xl">
                Welcome to Morogoro Teachers College - Where excellence in education meets innovation and character development. Join our community of learners and achievers.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  Start Your Journey
                </Link>
                <a
                  href="#programs"
                  className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
                >
                  Explore Programs
                </a>
              </div>
              <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">5000+</div>
                  <div className="text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">200+</div>
                  <div className="text-gray-600">Faculty</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">50+</div>
                  <div className="text-gray-600">Programs</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-1 shadow-2xl">
                <div className="bg-white rounded-2xl p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6 text-center transform hover:scale-105 transition-transform">
                      <div className="text-4xl mb-4">🎓</div>
                      <h3 className="font-semibold text-gray-800">Undergraduate</h3>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-6 text-center transform hover:scale-105 transition-transform">
                      <div className="text-4xl mb-4">📚</div>
                      <h3 className="font-semibold text-gray-800">Graduate</h3>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6 text-center transform hover:scale-105 transition-transform">
                      <div className="text-4xl mb-4">🔬</div>
                      <h3 className="font-semibold text-gray-800">Research</h3>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-6 text-center transform hover:scale-105 transition-transform">
                      <div className="text-4xl mb-4">🌍</div>
                      <h3 className="font-semibold text-gray-800">International</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Why Choose Morogoro Teachers College?</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              We are committed to providing quality education that transforms lives and communities
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Our Academic Programs</h2>
            <p className="mt-4 text-xl text-gray-600">Comprehensive education for diverse career paths</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Computer Science", icon: "💻", color: "blue" },
              { name: "Business Administration", icon: "📊", color: "green" },
              { name: "Education", icon: "👨‍🏫", color: "purple" },
              { name: "Engineering", icon: "⚙️", color: "orange" },
              { name: "Health Sciences", icon: "🏥", color: "red" },
              { name: "Arts & Humanities", icon: "🎨", color: "pink" }
            ].map((program, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <div className={`text-5xl mb-4 group-hover:scale-110 transition-transform`}>
                  {program.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{program.name}</h3>
                <p className="text-gray-600 mb-6">
                  Comprehensive program designed to prepare students for successful careers in their chosen field.
                </p>
                <button className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">What Our Students Say</h2>
            <p className="mt-4 text-xl text-gray-600">Hear from our successful alumni and current students</p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">❝</div>
                <p className="text-2xl text-gray-700 italic mb-8 min-h-[120px]">
                  {testimonials[currentSlide].text}
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonials[currentSlide].name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonials[currentSlide].name}</div>
                    <div className="text-gray-600">{testimonials[currentSlide].role}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-blue-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Educational Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Join thousands of students who have transformed their lives through quality education at Morogoro Teachers College.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-2xl"
            >
              Apply Now
            </Link>
            <a
              href="#contact"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                 MTC
                </div>
                <span className="ml-3 text-xl font-bold">Morogoro Teachers College</span>
              </div>
              <p className="text-gray-400">
                Committed to excellence in education, research, and community service.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#programs" className="hover:text-white transition-colors">Programs</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li>📍 Morogoro, Tanzania</li>
                <li>📞 +255 123 456 789</li>
                <li>✉️ info@morogoro-college.ac.tz</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    {social.charAt(0)}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Morogoro Teachers College. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;