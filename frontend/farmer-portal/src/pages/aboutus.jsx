import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './home.css';
import './aboutus.css';

const navItems = [
  { label: 'Home', to: '/home', exact: true },
  { label: 'Services', to: '/services' },
  { label: 'About us', to: '/about-us' },
  { label: 'Profile', to: '/profile' },
];

const team = [
  {
    name: 'Ajeem',
    role: 'Frontend Developer',
    image: '/Ajeem.jpeg',
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
          <span className="brand-kicker">KrishiAI</span>
          <span className="brand-title">Farmer Portal</span>
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
          Back to Home
        </button>
      </header>

      <main className="about-main">
        <section className="about-intro">
          <span className="about-eyebrow">The people behind KrishiAI</span>
          <h1>Built with purpose. Designed for better harvests.</h1>
          <p>
            Meet the team bringing dependable technology, thoughtful design, and practical farming
            intelligence together in one helpful platform.
          </p>
        </section>

        <section className="team-section" aria-labelledby="team-heading">
          <div className="section-heading team-heading">
            <span>Our team</span>
            <h2 id="team-heading">The minds growing KrishiAI</h2>
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
                    <div><dt>Email</dt><dd>{member.email}</dd></div>
                    <div><dt>University roll no.</dt><dd>{member.roll}</dd></div>
                    <div><dt>Contact no.</dt><dd>{member.phone}</dd></div>
                    {member.note && <div><dt>Github ID</dt><dd>{member.note}</dd></div>}
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
