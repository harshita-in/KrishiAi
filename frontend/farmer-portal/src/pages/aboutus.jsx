import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './home.css';
import './aboutus.css';

const navItems = [
  { label: 'Home (होम)', to: '/home', exact: true },
  { label: 'Marketplace (बाजार / फसल बेचें)', to: '/portal' },
  { label: 'Kisan Chopal (किसान चौपाल)', to: '/chopal' },
  { label: 'Services (सेवाएं व योजनाएं)', to: '/services' },
  { label: 'AI Crop Doctor (फसल डॉक्टर)', to: '/chat' },
  { label: 'About us (हमारे बारे में)', to: '/about-us' },
  { label: 'Profile (प्रोफाइल)', to: '/profile' },
];

const team = [
  {
    name: 'Ajeem',
    role: 'Frontend Developer',
    image: '/Ajeem.jpg',
    email: 'ajeemgujjar276@gmail.com',
    roll: '2301430120016',
    phone: '7505589800',
  },
  {
    name: 'Gyaan Prakash Pal',
    role: 'Backend Developer',
    image: '/Gyaan Prakash Pal.jpeg',
    email: 'gyanipal9519@gmail.com',
    roll: '2301430120063',
    phone: '9519614993',
  },
  {
    name: 'Harshita Shrivastava',
    role: 'DevOps',
    image: '/Harshita Shrivastava.jpeg',
    email: 'shrivastavaharshita88@gmail.com',
    roll: '2301430120069',
    phone: '9424072624',
  },
  {
    name: 'Harshita Gupta',
    role: 'Database Management',
    image: '/Harshita Gupta.png',
    email: 'harshita9580gupta',
    roll: '2301430120068',
    phone: '9580216690',
    note: 'phoenixharshita04',
  },
];

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="about-shell">
      <div className="about-glow about-glow-one" />
      <div className="about-glow about-glow-two" />

      <header className="ud-nav">
        <div className="brand-lockup">
          <span className="brand-kicker">KrishiAI (कृषि एआई)</span>
          <span className="brand-title">About Us (हमारे बारे में)</span>
        </div>

        <nav className="nav-links" aria-label="Farmer navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => (isActive ? 'nav-pill nav-pill-active' : 'nav-pill')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="nav-logout" type="button" onClick={() => navigate('/home')}>
          Back to Home (होम पर लौटें)
        </button>
      </header>

      <main className="about-main">
        <section className="about-intro">
          <span className="about-eyebrow">The people behind KrishiAI (कृषि एआई की टीम)</span>
          <h1>Built with purpose. Designed for better harvests. (समर्पण के साथ निर्मित, बेहतर पैदावार के लिए संकल्पित)</h1>
          <p>
            Meet the team bringing dependable technology, thoughtful design, and practical farming
            intelligence together in one helpful platform. (कृषि एआई की तकनीकी टीम, जो उन्नत विज्ञान और भारतीय किसानों को एक साथ ला रही है।)
          </p>
        </section>

        <section className="team-section" aria-labelledby="team-heading">
          <div className="section-heading team-heading">
            <span>Our Team (हमारी टीम)</span>
            <h2 id="team-heading">The minds growing KrishiAI (कृषि एआई के निर्माता)</h2>
          </div>

          <div className="team-list">
            {team.map((member) => (
              <article className="team-card" key={member.name}>
                <div className="team-photo-wrap">
                  <img className="team-photo" src={member.image} alt={`${member.name} profile`} />
                </div>

                <div className="team-details">
                  <div className="team-heading-row">
                    <div>
                      <h3>{member.name}</h3>
                      <p className="team-role">{member.role}</p>
                    </div>
                    <span className="team-index" aria-hidden="true">/ {String(team.indexOf(member) + 1).padStart(2, '0')}</span>
                  </div>

                  <dl className="team-meta">
                    <div><dt>Email (ईमेल)</dt><dd>{member.email}</dd></div>
                    <div><dt>University Roll No. (रोल नंबर)</dt><dd>{member.roll}</dd></div>
                    <div><dt>Contact No. (मोबाइल)</dt><dd>{member.phone}</dd></div>
                    {member.note && <div><dt>GitHub ID (गिटहब आईडी)</dt><dd>{member.note}</dd></div>}
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
