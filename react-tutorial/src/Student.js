import React from 'react';
import { Layout } from 'antd/lib/layout';
import './app.scss';

const App = () => {
  return (
    <Layout>
      <header className="site-header-responsive">
        <div className="container">
          <div className="site-logo">
            <h1>Student Profile</h1>
          </div>
          <ul className="nav-menu">
            <li>
              <a href="#">Profile</a>
            </li>
            <li>
              <a href="#">Skills</a>
            </li>
            <li>
              <a href="#">Academic Records</a>
            </li>
            <li>
              <a href="#">Resume</a>
            </li>
          </ul>
        </div>
      </header>

      <main className="site-content">
        <ProfilePage />
        <ResourcesPage />
        <SkillsPage />
        <AcademicRecordsPage />
        <ResumePage />
        <NavigationPage />
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>&copy; 2024 Student Profile</p>
          <ul className="social-links">
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-facebook"></i>
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-twitter"></i>
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </Layout>
  );
};

// ProfilePage.js

import React from 'react';
import { Layout } from 'antd/lib/layout';
import './profile-page.scss';

const ProfilePage = () => {
  return (
    <Layout>
      <header className="site-header-responsive">
        <div className="container">
          <div className="site-logo">
            <h1>Student Profile</h1>
          </div>
          <ul className="nav-menu">
            <li>
              <a href="#">Profile</a>
            </li>
            <li>
              <a href="#">Skills</a>
            </li>
            <li>
              <a href="#">Academic Records</a>
            </li>
            <li>
              <a href="#">Resume</a>
            </li>
          </ul>
        </div>
      </header>

      <main className="site-content">
        <div className="profile-page-content">
          <h2>Student Profile</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit
            amet nulla auctor, vestibulum magna sed, convallis ex.
          </p>
        </div>

        {/* Skills Section */}
        <div className="skills-section">
          <h3>Skills</h3>
          <ul className="skill-list">
            <li>
              <span className="skill-tag">Python</span>
            </li>
            <li>
              <span className="skill-tag">JavaScript</span>
            </li>
            <li>
              <span className="skill-tag">HTML/CSS</span>
            </li>
          </ul>
        </div>

        {/* Academic Records */}
        <div className="academic-records">
          <h3>Academic Performance</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit
            amet nulla auctor, vestibulum magna sed, convallis ex.
          </p>
        </div>

        {/* Resume */}
        <div className="resume-section">
          <h3>Resume</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit
            amet nulla auctor, vestibulum magna sed, convallis ex.
          </p>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>&copy; 2024 Student Profile</p>
          <ul className="social-links">
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-facebook"></i>
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-twitter"></i>
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </Layout>
  );
};


// ResourcesPage.js

import React from 'react';
import { Layout } from 'antd/lib/layout';
import './resources-page.scss';

const ResourcesPage = () => {
  return (
    <Layout>
      <header className="site-header-responsive">
        <div className="container">
          <div className="site-logo">
            <h1>Student Profile</h1>
          </div>
          <ul className="nav-menu">
            <li>
              <a href="#">Profile</a>
            </li>
            <li>
              <a href="#">Skills</a>
            </li>
            <li>
              <a href="#">Academic Records</a>
            </li>
            <li>
              <a href="#">Resume</a>
            </li>
          </ul>
        </div>
      </header>

      <main className="site-content">
        <h2>Resources</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit
          amet nulla auctor, vestibulum magna sed, convallis ex.
        </p>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>&copy; 2024 Student Profile</p>
          <ul className="social-links">
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-facebook"></i>
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-twitter"></i>
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </Layout>
  );
};



import React from 'react';
import { Layout } from 'antd/lib/layout';
import './skills-page.scss';

const SkillsPage = () => {
  return (
    <Layout>
      <header className="site-header-responsive">
        <div className="container">
          <div className="site-logo">
            <h1>Student Profile</h1>
          </div>
          <ul className="nav-menu">
            <li>
              <a href="#">Profile</a>
            </li>
            <li>
              <a href="#">Skills</a>
            </li>
            <li>
              <a href="#">Academic Records</a>
            </li>
            <li>
              <a href="#">Resume</a>
            </li>
          </ul>
        </div>
      </header>

      <main className="site-content">
        <h2>Skills</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit
          amet nulla auctor, vestibulum magna sed, convallis ex.
        </p>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>&copy; 2024 Student Profile</p>
          <ul className="social-links">
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-facebook"></i>
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-twitter"></i>
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </Layout>
  );
};


// AcademicRecordsPage.js

import React from 'react';
import { Layout } from 'antd/lib/layout';
import './academic-records-page.scss';

const AcademicRecordsPage = () => {
  return (
    <Layout>
      <header className="site-header-responsive">
        <div className="container">
          <div className="site-logo">
            <h1>Student Profile</h1>
          </div>
          <ul className="nav-menu">
            <li>
              <a href="#">Profile</a>
            </li>
            <li>
              <a href="#">Skills</a>
            </li>
            <li>
              <a href="#">Academic Records</a>
            </li>
            <li>
              <a href="#">Resume</a>
            </li>
          </ul>
        </div>
      </header>

      <main className="site-content">
        <h2>Academic Performance</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit
          amet nulla auctor, vestibulum magna sed, convallis ex.
        </p>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>&copy; 2024 Student Profile</p>
          <ul className="social-links">
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-facebook"></i>
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-twitter"></i>
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </Layout>
  );
};


// ResumePage.js

import React from 'react';
import { Layout } from 'antd/lib/layout';
import './resume-page.scss';

const ResumePage = () => {
  return (
    <Layout>
      <header className="site-header-responsive">
        <div className="container">
          <div className="site-logo">
            <h1>Student Profile</h1>
          </div>
          <ul className="nav-menu">
            <li>
              <a href="#">Profile</a>
            </li>
            <li>
              <a href="#">Skills</a>
            </li>
            <li>
              <a href="#">Academic Records</a>
            </li>
            <li>
              <a href="#">Resume</a>
            </li>
          </ul>
        </div>
      </header>

      <main className="site-content">
        <h2>Resume</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit
          amet nulla auctor, vestibulum magna sed, convallis ex.
        </p>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>&copy; 2024 Student Profile</p>
          <ul className="social-links">
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-facebook"></i>
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-twitter"></i>
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </Layout>
  );
};

// NavigationPage.js

import React from 'react';
import { Layout } from 'antd/lib/layout';

const NavigationPage = () => {
  return (
    <Layout>
      <header className="site-header-responsive">
        <div className="container">
          <div className="site-logo">
            <h1>Student Profile</h1>
          </div>
          <ul className="nav-menu">
            <li>
              <a href="#">Profile</a>
            </li>
            <li>
              <a href="#">Skills</a>
            </li>
            <li>
              <a href="#">Academic Records</a>
            </li>
            <li>
              <a href="#">Resume</a>
            </li>
          </ul>
        </div>
      </header>

      <main className="site-content">
        <h2>Navigation</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit
          amet nulla auctor, vestibulum magna sed, convallis ex.
        </p>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>&copy; 2024 Student Profile</p>
          <ul className="social-links">
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-facebook"></i>
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-twitter"></i>
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </Layout>
  );
};

export default NavigationPage;
// app.scss

body {
  font-family: Arial, sans-serif;
  margin: 0;
}

.site-header-responsive {
  background-color: #f2f2f2;
  padding: 1em;
  text-align: center;
}

.site-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #333;
}

.nav-menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-menu li {
  margin-right: 20px;
}

.nav-menu a {
  color: #337ab7;
  text-decoration: none;
}

.site-content {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
}

.site-footer {
  background-color: #f2f2f2;
  padding: 1em;
  text-align: center;
  color: #333;
}

.social-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.social-links li {
  margin-right: 20px;
}

.social-links a {
  color: #337ab7;
  text-decoration: none;
}
// profile-page.scss

body {
  font-family: Arial, sans-serif;
  margin: 0;
}

.site-header-responsive {
  background-color: #f2f2f2;
  padding: 1em;
  text-align: center;
}

.site-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #333;
}

.profile-page-content {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.skills-section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.skill-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-tag {
  font-size: 18px;
  color: #337ab7;
  text-decoration: none;
}

.academic-records {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.resume-section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}
// resources-page.scss

body {
  font-family: Arial, sans-serif;
  margin: 0;
}

.site-header-responsive {
  background-color: #f2f2f2;
  padding: 1em;
  text-align: center;
}

.site-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #333;
}

.resources-page-content {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.site-footer {
  background-color: #f2f2f2;
  padding: 1em;
  text-align: center;
  color: #333;
}
// skills-page.scss

body {
  font-family: Arial, sans-serif;
  margin: 0;
}

.site-header-responsive {
  background-color: #f2f2f2;
  padding: 1em;
  text-align: center;
}

.site-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #333;
}

.skills-section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.skill-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-tag {
  font-size: 18px;
  color: #337ab7;
  text-decoration: none;
}

.academic-records {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.site-footer {
  background-color: #f2f2f2;
  padding: 1em;
  text-align: center;
  color: #333;
}
// academic-records-page.scss

body {
  font-family: Arial, sans-serif;
  margin: 0;
}

.site-header-responsive {
  background-color: #f2f2f2;
  padding: 1em;
  text-align: center;
}

.site-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #333;
}

.academic-records {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.site-footer {
  background-color: #f2f2f2;
  padding: 1em;
  text-align: center;
  color: #333;
}
// resume-page.scss

body {
  font-family: Arial, sans-serif;
  margin: 0;
}

.site-header-responsive {
  background-color: #f2f2f2;
  padding: 1em;
  text-align: center;
}

.site-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #333;
}

.resume-section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.site-footer {
  background-color: #f2f2f2;
  padding: 1em;
  text-align: center;
  color: #333;
}
// navigation-page.scss

body {
  font-family: Arial, sans-serif;
  margin: 0;
}

.site-header-responsive {
  background-color: #f2f2f2;
  padding: 1em;
  text-align: center;
}

.site-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #333;
}

.navigation-page-content {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.site-footer {
  background-color: #f2f2f2;
  padding: 1em;
  text-align: center;
  color: #333;
}
// index.js

import React from 'react';
import ReactDOM from 'react-dom';

import NavigationPage from './NavigationPage';

ReactDOM.render(
  <React.StrictMode>
    <NavigationPage />
  </React.StrictMode>,
  document.getElementById('root')
);
