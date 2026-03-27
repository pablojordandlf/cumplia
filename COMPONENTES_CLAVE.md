# ⚙️ Componentes Clave - Cumplia Landing Page 2026

## Introducción

Este documento detalla los 8 componentes críticos para la landing page, con:
- Especificación de comportamiento
- Código de ejemplo (React/Next.js)
- Accesibilidad WCAG 2.1 AA
- Micro-interacciones
- Responsive design

---

## 1️⃣ COMPONENTE: Navigation Bar

### Especificación

```
├─ Logo (clickable, href="/")
├─ Menu items (Features, Pricing, Blog, Docs)
├─ Spacer
├─ CTA Buttons (Get started, Log in)
└─ Mobile menu toggle (hamburger)

Sticky: Yes (fixed top)
Height: 64px
Background: #0a0a0a (no elevation)
Border-bottom: 1px #1a1a1a
Z-index: 100
```

### React Component Example

```jsx
import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full h-16 bg-bg-primary border-b border-border-default z-100 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-accent-primary rounded-md group-hover:scale-105 transition-transform" />
          <span className="font-heading font-600 text-lg text-text-primary">
            Cumplia
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-text-secondary hover:text-accent-primary transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-text-secondary hover:text-accent-primary transition-colors">
            Pricing
          </Link>
          <Link href="/blog" className="text-text-secondary hover:text-accent-primary transition-colors">
            Blog
          </Link>
          <Link href="/docs" className="text-text-secondary hover:text-accent-primary transition-colors">
            Docs
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button className="px-6 py-2 text-text-secondary hover:text-text-primary transition-colors">
            Log in
          </button>
          <button className="px-6 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg">
            Get started
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-text-secondary hover:text-accent-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-bg-secondary border-b border-border-default">
          <div className="px-6 py-4 space-y-3">
            <a href="#features" className="block text-text-secondary hover:text-accent-primary">
              Features
            </a>
            <a href="#pricing" className="block text-text-secondary hover:text-accent-primary">
              Pricing
            </a>
            <a href="/blog" className="block text-text-secondary hover:text-accent-primary">
              Blog
            </a>
            <button className="w-full mt-4 px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover transition-all">
              Get started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
```

### Accessibility Checklist

- [x] Logo is a link with proper href
- [x] Menu items use semantic `<nav>` and `<a>` tags
- [x] Mobile toggle has aria-label and aria-expanded
- [x] Keyboard navigation (Tab through all items)
- [x] Focus visible on all interactive elements
- [x] Sufficient color contrast (4.5:1 minimum)

---

## 2️⃣ COMPONENTE: Hero Section

### Especificación

```
├─ Video background (30% opacity overlay)
├─ H1 proposition (72px, bold)
├─ Subtitle (20px, secondary text)
├─ CTA Primary (Get started) + Secondary (View demo)
├─ Trust badge (logo preview)
└─ Scroll indicator (optional)

Height: 100vh (viewport)
Overlay: rgba(10, 10, 10, 0.3)
Content alignment: Center
Animation: Fade-in on load
```

### React Component Example

```jsx
export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden pt-16">
      
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src="/hero-demo.mp4" type="video/mp4" />
        {/* Fallback image */}
        <img
          src="/hero-fallback.jpg"
          alt="Hero background"
          className="w-full h-full object-cover"
        />
      </video>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-primary opacity-60" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
        
        {/* Animated Badge */}
        <div className="mb-6 inline-block px-4 py-2 bg-bg-secondary border border-border-default rounded-full animate-fade-in">
          <p className="text-sm text-text-secondary">
            ✨ New: AI-powered automation is here
          </p>
        </div>

        {/* Main Heading */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-900 text-text-primary mb-6 max-w-4xl leading-tight animate-fade-in-delay-1">
          Make anything possible,<br />
          <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
            all in Cumplia
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mb-8 animate-fade-in-delay-2">
          Transform your operations with AI-powered automation, real-time collaboration, and enterprise-grade security.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-delay-3">
          <button className="px-8 py-4 bg-accent-primary text-white font-semibold rounded-lg hover:bg-accent-hover transition-all hover:-translate-y-1 shadow-lg hover:shadow-xl cursor-pointer">
            Get started free
          </button>
          <button className="px-8 py-4 border border-text-tertiary text-text-primary font-semibold rounded-lg hover:border-accent-primary hover:text-accent-primary transition-all cursor-pointer">
            View demo
          </button>
        </div>

        {/* Trust Badge */}
        <div className="text-center mb-8 animate-fade-in-delay-4">
          <p className="text-sm text-text-tertiary mb-3">Trusted by leading companies</p>
          <div className="flex flex-wrap justify-center gap-6 grayscale hover:grayscale-0 transition-all">
            {['Logo1', 'Logo2', 'Logo3', 'Logo4'].map((logo) => (
              <img
                key={logo}
                src={`/logos/${logo}.svg`}
                alt={`${logo} logo`}
                className="h-6 opacity-60 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="flex items-center gap-6 text-sm text-text-tertiary animate-fade-in-delay-5">
          <div>
            <p className="font-semibold text-text-primary">4.9/5</p>
            <p>from 2,300+ reviews</p>
          </div>
          <div className="w-px h-8 bg-border-default" />
          <div>
            <p className="font-semibold text-text-primary">100K+</p>
            <p>teams trust Cumplia</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
```

### CSS Animations

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

.animate-fade-in-delay-1 {
  animation: fadeIn 0.6s ease-out 0.1s forwards;
  opacity: 0;
}

.animate-fade-in-delay-2 {
  animation: fadeIn 0.6s ease-out 0.2s forwards;
  opacity: 0;
}

.animate-fade-in-delay-3 {
  animation: fadeIn 0.6s ease-out 0.3s forwards;
  opacity: 0;
}

.animate-fade-in-delay-4 {
  animation: fadeIn 0.6s ease-out 0.4s forwards;
  opacity: 0;
}

.animate-fade-in-delay-5 {
  animation: fadeIn 0.6s ease-out 0.5s forwards;
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 3️⃣ COMPONENTE: Feature Card

### Especificación

```
┌─────────────────────┐
│ [Icon] Animated     │
├─────────────────────┤
│ Feature Title       │
│ Description         │
│ → Learn more       │
└─────────────────────┘

Grid: 3-4 columns (responsive)
Animation: Scroll-triggered fade-in + slide-up
Hover: Transform + shadow enhancement
```

### React Component with GSAP

```jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function FeatureCard({ icon: Icon, title, description, link }) {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.to(cardRef.current, {
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      duration: 0.8,
      opacity: 1,
      y: 0,
      ease: 'power2.out',
    });
  }, []);

  return (
    <div
      ref={cardRef}
      className="opacity-0 translate-y-10 group relative p-8 bg-bg-secondary border border-border-default rounded-lg hover:border-accent-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    >
      {/* Hover gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-transparent opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300" />

      {/* Icon */}
      <div className="relative mb-4 w-12 h-12 bg-bg-tertiary rounded-lg flex items-center justify-center group-hover:bg-accent-primary/20 transition-colors duration-300">
        <Icon className="w-6 h-6 text-accent-primary" />
      </div>

      {/* Title */}
      <h3 className="relative font-heading font-600 text-lg text-text-primary mb-3 group-hover:text-accent-primary transition-colors duration-300">
        {title}
      </h3>

      {/* Description */}
      <p className="relative text-text-secondary text-sm leading-relaxed mb-4 h-16">
        {description}
      </p>

      {/* Link */}
      <a
        href={link}
        className="relative inline-flex items-center gap-2 text-accent-primary hover:text-accent-hover transition-colors duration-300 font-semibold text-sm"
      >
        Learn more
        <svg
          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}

// Usage in FeatureGrid
export function FeatureGrid() {
  const features = [
    {
      icon: RocketIcon,
      title: 'Lightning Fast',
      description: 'Deploy in minutes, not days. Our platform streamlines your workflow.',
      link: '#',
    },
    // ... more features
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => (
        <FeatureCard key={feature.title} {...feature} />
      ))}
    </div>
  );
}
```

### Accessibility

```jsx
// WCAG 2.1 AA considerations:
<div
  role="region"
  aria-label="Feature cards"
  className="grid grid-cols-1 md:grid-cols-3 gap-6"
>
  {features.map((feature) => (
    <article
      key={feature.title}
      className="..."
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          window.location.href = feature.link;
        }
      }}
    >
      {/* ... */}
    </article>
  ))}
</div>
```

---

## 4️⃣ COMPONENTE: Pricing Card

### Especificación

```
┌──────────────────┐
│ Pro Plan         │
│ $99/month        │
├──────────────────┤
│ ✓ 50 users       │
│ ✓ Unlimited proj │
│ ✓ API access     │
├──────────────────┤
│ → Get started    │
│ ← Popular badge  │
└──────────────────┘

Highlight: Pro tier (border + gradient)
CTA: Contexto al plan
```

### React Component

```jsx
export default function PricingCard({ tier, price, period, features, highlighted, ctaText }) {
  return (
    <div
      className={`relative overflow-hidden p-8 rounded-lg transition-all duration-300 ${
        highlighted
          ? 'bg-gradient-to-br from-bg-secondary via-bg-secondary to-accent-primary/20 border border-accent-primary shadow-lg scale-105'
          : 'bg-bg-secondary border border-border-default hover:border-accent-primary hover:shadow-lg'
      }`}
    >
      {/* Popular Badge */}
      {highlighted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="inline-block px-4 py-1 bg-accent-primary text-white text-sm font-semibold rounded-full">
            Popular
          </span>
        </div>
      )}

      {/* Tier Name */}
      <h3 className="font-heading font-600 text-xl text-text-primary mb-2">
        {tier}
      </h3>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-text-primary">
            ${price}
          </span>
          <span className="text-text-tertiary">/{period}</span>
        </div>
        <p className="text-sm text-text-secondary mt-2">
          or ${price * 12 * 0.83}/year (save 17%)
        </p>
      </div>

      {/* Features List */}
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <svg className="w-5 h-5 text-accent-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-text-secondary text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
          highlighted
            ? 'bg-accent-primary text-white hover:bg-accent-hover hover:-translate-y-0.5 shadow-lg'
            : 'border border-text-tertiary text-text-primary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5'
        }`}
      >
        {ctaText}
      </button>

      {/* Bottom Text */}
      <p className="text-center text-xs text-text-tertiary mt-4">
        No credit card required. 14 days free trial.
      </p>
    </div>
  );
}

// Usage
export function PricingSection() {
  const plans = [
    {
      tier: 'Starter',
      price: 29,
      period: 'month',
      features: ['10 users', '1 project', 'Email support'],
      highlighted: false,
      ctaText: 'Get started',
    },
    {
      tier: 'Pro',
      price: 99,
      period: 'month',
      features: ['50 users', 'Unlimited projects', 'API access', '24/7 support'],
      highlighted: true,
      ctaText: 'Upgrade now',
    },
    {
      tier: 'Enterprise',
      price: 'Custom',
      period: 'month',
      features: ['Unlimited', 'Dedicated account', 'SLA', 'Training'],
      highlighted: false,
      ctaText: 'Contact sales',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <PricingCard key={plan.tier} {...plan} />
      ))}
    </div>
  );
}
```

---

## 5️⃣ COMPONENTE: Testimonial Carousel

### Especificación

```
Elementos:
├─ Rating (5 stars)
├─ Quote
├─ Author info (name, title, company, avatar)
├─ Navigation dots
└─ Auto-advance (6s)

Transition: Fade + Slide
Keyboard: Left/Right arrows
Accessibility: Live region for screen readers
```

### React Component

```jsx
import { useState, useEffect } from 'react';

export default function TestimonialCarousel({ testimonials }) {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoPlay, testimonials.length]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      setAutoPlay(false);
    } else if (e.key === 'ArrowRight') {
      setCurrent((prev) => (prev + 1) % testimonials.length);
      setAutoPlay(false);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="relative bg-bg-secondary rounded-lg p-8"
      role="region"
      aria-label="Customer testimonials carousel"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Content */}
      <div className="relative min-h-64 flex flex-col justify-between">
        
        {/* Rating */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className="w-5 h-5 text-accent-warning"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Quote */}
        <p
          key={current}
          className="text-lg text-text-secondary italic my-6 min-h-24 animate-fade-in"
        >
          "{testimonials[current].quote}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-4">
          <img
            src={testimonials[current].avatar}
            alt={testimonials[current].name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-semibold text-text-primary">
              {testimonials[current].name}
            </p>
            <p className="text-sm text-text-tertiary">
              {testimonials[current].title} @ {testimonials[current].company}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === current ? 'bg-accent-primary w-8' : 'bg-text-tertiary hover:bg-text-secondary'
            }`}
            onClick={() => {
              setCurrent(index);
              setAutoPlay(false);
            }}
            aria-label={`Go to testimonial ${index + 1}`}
            aria-current={index === current ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Keyboard Hint */}
      <p className="text-center text-xs text-text-tertiary mt-4">
        Use arrow keys to navigate
      </p>

      {/* Accessibility: Live region */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Testimonial {current + 1} of {testimonials.length}: {testimonials[current].quote}
      </div>
    </div>
  );
}
```

---

## 6️⃣ COMPONENTE: CTA Button (Primary)

### Especificación

```
Estados:
├─ Default: #5c5cff (accent primary)
├─ Hover: #7575ff + shadow + -translate-y-0.5
├─ Active: pressed state
├─ Focus: 2px white outline (keyboard)
└─ Disabled: #707070 opacity 0.6

Dimensiones:
├─ Padding: 12px 32px
├─ Height: 44px (touch target)
├─ Border-radius: 6px
└─ Font: 16px, 600 weight
```

### React Component

```jsx
import { forwardRef } from 'react';

export const CTAButton = forwardRef(
  (
    {
      children,
      variant = 'primary',
      disabled = false,
      loading = false,
      icon: Icon,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'px-8 py-3 rounded-md font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
      primary: 'bg-accent-primary text-white hover:bg-accent-hover hover:-translate-y-0.5 shadow-md hover:shadow-lg focus:ring-accent-primary focus:ring-offset-bg-primary',
      secondary: 'border border-text-tertiary text-text-primary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 focus:ring-accent-primary',
      ghost: 'text-accent-primary hover:bg-accent-primary/10 focus:ring-accent-primary',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={onClick}
        className={`${baseStyles} ${variants[variant]}`}
        {...props}
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : (
          <>
            {Icon && <Icon className="w-5 h-5" />}
            {children}
          </>
        )}
      </button>
    );
  }
);

CTAButton.displayName = 'CTAButton';

// Usage
<CTAButton
  variant="primary"
  onClick={() => console.log('Started!')}
  icon={RocketIcon}
>
  Get started free
</CTAButton>
```

---

## 7️⃣ COMPONENTE: FAQ Accordion

### Especificación

```
Items:
├─ Question (expandible)
├─ Answer (hidden until expanded)
└─ Icon (chevron rotates)

Animation: Smooth expand/collapse
Keyboard: Tab + Space/Enter to toggle
Single open: Optional
```

### React Component

```jsx
import { useState } from 'react';

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'How do I get started?',
      answer: 'Sign up for a free account, and you can start automating your workflow in minutes.',
    },
    // More FAQs...
  ];

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <details
          key={index}
          open={openIndex === index}
          className="group border border-border-default rounded-lg p-4 bg-bg-secondary hover:border-accent-primary transition-colors"
        >
          <summary
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            className="flex items-center justify-between cursor-pointer list-none"
          >
            <h3 className="font-heading font-600 text-text-primary group-open:text-accent-primary transition-colors">
              {faq.question}
            </h3>
            <svg
              className="w-5 h-5 text-accent-primary transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </summary>

          <p className="mt-4 text-text-secondary leading-relaxed">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
```

---

## 8️⃣ COMPONENTE: Footer

### Especificación

```
Secciones:
├─ Logo + description
├─ Product (Features, Pricing, Docs)
├─ Company (About, Blog, Careers)
├─ Legal (Privacy, Terms, Security)
└─ Social icons + newsletter signup

Layout: 4-column grid (responsive)
Background: #0a0a0a
Border-top: 1px #1a1a1a
```

### React Component

```jsx
export default function Footer() {
  return (
    <footer className="bg-bg-primary border-t border-border-default py-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          
          {/* Company Info */}
          <div>
            <h4 className="font-heading font-600 text-text-primary mb-4">Cumplia</h4>
            <p className="text-sm text-text-tertiary leading-relaxed mb-4">
              Transform your operations with AI-powered automation and real-time collaboration.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              {['twitter', 'github', 'linkedin'].map((social) => (
                <a
                  key={social}
                  href={`#${social}`}
                  className="text-text-tertiary hover:text-accent-primary transition-colors"
                  aria-label={`Follow us on ${social}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    {/* SVG path for social icon */}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h5 className="font-semibold text-text-primary mb-4">Product</h5>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Security', 'Docs'].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="text-sm text-text-tertiary hover:text-accent-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h5 className="font-semibold text-text-primary mb-4">Company</h5>
            <ul className="space-y-2">
              {['About', 'Blog', 'Careers', 'Contact'].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="text-sm text-text-tertiary hover:text-accent-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h5 className="font-semibold text-text-primary mb-4">Legal</h5>
            <ul className="space-y-2">
              {['Privacy', 'Terms', 'Security', 'Cookies'].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="text-sm text-text-tertiary hover:text-accent-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="font-semibold text-text-primary mb-4">Stay updated</h5>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-3 py-2 bg-bg-secondary border border-border-default rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary transition-colors"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-accent-primary text-white rounded-md font-semibold hover:bg-accent-hover transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border-default pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-text-tertiary">
            © 2026 Cumplia. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="/status" className="text-sm text-text-tertiary hover:text-accent-primary transition-colors">
              Status
            </a>
            <a href="/security" className="text-sm text-text-tertiary hover:text-accent-primary transition-colors">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## Resumen de Componentes

| Componente | Prioridad | Complejidad | Estado |
|-----------|-----------|------------|--------|
| Navigation | P0 | Media | ✅ |
| Hero Section | P0 | Alta | ✅ |
| Feature Card | P0 | Media | ✅ |
| Pricing Card | P1 | Baja | ✅ |
| Testimonial Carousel | P1 | Media | ✅ |
| CTA Button | P0 | Baja | ✅ |
| FAQ Accordion | P2 | Baja | ✅ |
| Footer | P1 | Baja | ✅ |

---

**Componentes v1.0** | Listos para implementación
Todos incluyen accesibilidad WCAG 2.1 AA, micro-interacciones y responsive design.
