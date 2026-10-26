import { useEffect, useState } from 'react';
import Globe from './components/Globe.jsx';
import ContactForm from './components/ContactForm.jsx';
import { useParallax, useReveal } from './hooks.js';

const features = [
  { icon: '⚡', title: 'Edge Performance', text: 'Content served from points of presence close to your users for very low latency.' },
  { icon: '🛡️', title: 'Zero Trust Security', text: 'Identity-first access, continuous verification and encrypted traffic end to end.' },
  { icon: '🌐', title: 'Global Mesh', text: 'Every node talks to every node. Self-healing routes keep you online.' },
  { icon: '📊', title: 'Live Insights', text: 'Real-time telemetry and dashboards so you always know what is happening.' },
];

const services = [
  { title: 'Cloud Workplace', text: 'Secure desktops and apps delivered to any device, anywhere.', tag: '01' },
  { title: 'Network Design', text: 'Hybrid connectivity, segmentation and web filtering done right.', tag: '02' },
  { title: 'Device Management', text: 'Modern endpoint management for every platform in your fleet.', tag: '03' },
];

const stats = [
  { value: '120+', label: 'Countries' },
  { value: '99.99%', label: 'Uptime' },
  { value: '4.2M', label: 'Connected devices' },
  { value: '<30ms', label: 'Median latency' },
];

export default function App() {
  const scrollY = useParallax();
  useReveal();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, []);

  return (
    <>
      {/* ---------- NAV ---------- */}
      <header className={`nav ${scrollY > 40 ? 'nav--solid' : ''}`}>
        <a href="#home" className="logo"><span className="logo-dot" />Nexus</a>
        <button className="burger" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        <nav className={menuOpen ? 'open' : ''}>
          <a href="#features">Features</a>
          <a href="#services">Services</a>
          <a href="#stats">Network</a>
          <a href="#contact" className="btn btn--small">Contact</a>
        </nav>
      </header>

      {/* ---------- HERO ---------- */}
      <section id="home" className="hero">
        <div className="stars" style={{ transform: `translateY(${scrollY * 0.5}px)` }} />
        <div className="stars stars--2" style={{ transform: `translateY(${scrollY * 0.25}px)` }} />
        <div className="hero__inner">
          <div className="hero__text" style={{ transform: `translateY(${scrollY * 0.35}px)`, opacity: Math.max(0, 1 - scrollY / 600) }}>
            <span className="eyebrow">Global connectivity platform</span>
            <h1>Connect <span className="grad">everything</span>,<br />everywhere.</h1>
            <p>A demo site with a live, interconnected network globe, parallax sections and a working demo contact form.</p>
            <div className="hero__cta">
              <a href="#contact" className="btn">Get in touch</a>
              <a href="#features" className="btn btn--ghost">Explore</a>
            </div>
          </div>
          <div className="hero__globe" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
            <Globe />
          </div>
        </div>
        <a href="#features" className="scroll-hint" aria-label="Scroll down"><span /></a>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section id="features" className="section">
        <div className="container">
          <h2 className="reveal">Built for a connected world</h2>
          <p className="lead reveal">Four pillars that keep your organisation fast, secure and in sync.</p>
          <div className="grid grid--4">
            {features.map((f, i) => (
              <article key={f.title} className="card reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="card__icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PARALLAX BANNER 1 ---------- */}
      <section className="parallax parallax--a">
        <div className="parallax__bg" style={{ transform: `translateY(${(scrollY - 900) * 0.3}px)` }} />
        <div className="parallax__content reveal">
          <h2>Every node. Every second.</h2>
          <p>Millions of signals crossing the planet, choosing the fastest path in real time.</p>
        </div>
      </section>

      {/* ---------- SERVICES ---------- */}
      <section id="services" className="section">
        <div className="container split">
          <div className="split__left reveal">
            <span className="eyebrow">What we do</span>
            <h2>Services that scale with you</h2>
            <p className="lead">From design to day-two operations, we help you land modern platforms with confidence.</p>
          </div>
          <div className="split__right">
            {services.map((s, i) => (
              <div key={s.title} className="service reveal" style={{ transitionDelay: `${i * 120}ms` }}>
                <span className="service__tag">{s.tag}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- STATS (parallax) ---------- */}
      <section id="stats" className="parallax parallax--b">
        <div className="parallax__bg" style={{ transform: `translateY(${(scrollY - 1900) * 0.25}px)` }} />
        <div className="container">
          <div className="grid grid--4 stats">
            {stats.map((s, i) => (
              <div key={s.label} className="stat reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CONTACT ---------- */}
      <section id="contact" className="section">
        <div className="container split">
          <div className="split__left reveal">
            <span className="eyebrow">Contact</span>
            <h2>Let’s build something connected</h2>
            <p className="lead">This is a demo form. Submissions are validated and simulated in the browser; no data is sent.</p>
            <ul className="contact-list">
              <li>📍 Amsterdam, Netherlands</li>
              <li>✉️ hello@nexus.example</li>
              <li>☎️ +31 20 000 0000</li>
            </ul>
          </div>
          <div className="split__right reveal">
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Nexus Demo. Hosted on Azure Static Web Apps.</span>
        <a href="#home">Back to top ↑</a>
      </footer>
    </>
  );
}
