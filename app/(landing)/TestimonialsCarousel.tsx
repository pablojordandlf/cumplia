// apps/web/app/(landing)/TestimonialsCarousel.tsx
import React from 'react';
import TestimonialCard from './TestimonialCard';
import { motion, AnimatePresence } from 'framer-motion'; // framer-motion for animations

// Dummy data - replace with actual testimonials
const dummyTestimonials = [
  {
    quote: "CumplIA has revolutionized how we handle AI compliance. It's surprisingly simple!",
    author: "Alice Johnson",
    title: "CTO",
    company: "Tech Innovations Inc.",
    avatar: "https://via.placeholder.com/150/CCCCCC/000000?text=AJ",
  },
  {
    quote: "Never thought compliance could be this accessible. Highly recommended for any SaaS company.",
    author: "Bob Williams",
    title: "Head of Product",
    company: "Innovate Solutions",
    avatar: "https://via.placeholder.com/150/AAAAAA/000000?text=BW",
  },
  {
    quote: "The platform is incredibly intuitive and the support is top-notch.",
    author: "Charlie Brown",
    title: "Lead Developer",
    company: "Creative Labs",
    avatar: "https://via.placeholder.com/150/DDDDDD/000000?text=CB",
  },
];

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % dummyTestimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + dummyTestimonials.length) % dummyTestimonials.length);
  };

  const currentTestimonial = dummyTestimonials[currentIndex];

  return (
    <section id="testimonials" className="py-20 bg-gray-950 text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="relative flex items-center justify-center">
          <AnimatePresence initial={false} custom={{ currentIndex, direction: 1 }}> {/* Direction could be managed */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl"
            >
              <TestimonialCard
                quote={currentTestimonial.quote}
                author={currentTestimonial.author}
                title={currentTestimonial.title}
                company={currentTestimonial.company}
                avatar={currentTestimonial.avatar}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-gray-800 bg-opacity-50 hover:bg-opacity-100 transition duration-200"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-gray-800 bg-opacity-50 hover:bg-opacity-100 transition duration-200"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
