# CampusConnect# CampusConnect



A modern, full-stack campus management system with separate frontend and backend services.A modern, responsive campus management system built with React and Tailwind CSS. CampusConnect provides separate dashboards for Students, Mentors, and Placement Officers with features including placement management, email integration, and event tracking.



## Project Structure## Features



```### 👨‍🎓 Student Dashboard

CampusConnect/- **Overview**: View stats, assignments, news feed, and upcoming events

├── frontend/          # React frontend application- **Profile Management**: Update personal information, upload resume and certificates

│   ├── src/          # React components and source code- **Gmail Integration**: AI-categorized emails (Academic, Career, Events, Social)

│   ├── public/       # Static assets- **Placements & Internships**: Browse opportunities and request mentor approval

│   ├── build/        # Production build files- **Events & Workshops**: Register for college events

│   └── README.md     # Frontend-specific documentation

└── README.md         # This file### 👨‍🏫 Mentor Dashboard

```- **Student Management**: View and manage assigned students

- **Approval System**: Review and approve placement applications and event registrations

## Overview- **Student Information**: Access detailed student profiles and performance

- **Communications**: Manage interactions with students

CampusConnect is a comprehensive campus management platform that provides:

### 💼 Placement Officer Dashboard

- **Student Dashboard**: Personal profile, placements, events, and Gmail integration- **Company Management**: Track recruiting companies

- **Mentor Dashboard**: Student management and approval system- **Placement Drives**: Manage recruitment drives and schedules

- **Placement Officer Dashboard**: Company management, drives, and applications- **Student Database**: Access all student information

- **Professional Login**: Secure authentication system- **Applications**: Review and manage student applications

- **Analytics & Reports**: Generate placement statistics

## Technology Stack- **Announcements**: Send notifications to students



### Frontend## Tech Stack

- **React 18** - Modern UI library

- **Tailwind CSS** - Utility-first CSS framework- **Frontend**: React 18

- **Lucide React** - Beautiful icon library- **Styling**: Tailwind CSS

- **Responsive Design** - Mobile-first approach- **Icons**: Lucide React

- **Build Tool**: Create React App

### Future Backend (To be added)

- Backend services will be added in a separate directory## Installation

- API integration for data management

- Authentication and authorization services1. **Clone the repository**

   ```bash

## Getting Started   git clone https://github.com/pravin-4620/CampusConnect.git

   cd CampusConnect

### Frontend Setup   ```



1. Navigate to the frontend directory:2. **Install dependencies**

   ```bash   ```bash

   cd frontend   npm install

   ```   ```



2. Install dependencies:3. **Start the development server**

   ```bash   ```bash

   npm install   npm start

   ```   ```



3. Start the development server:4. **Open in browser**

   ```bash   ```

   npm start   http://localhost:3000

   ```   ```



4. Open [http://localhost:3000](http://localhost:3000) in your browser## Build for Production



## Development```bash

npm run build

### Frontend Development```

All frontend-related commands should be run from the `frontend/` directory:

This creates an optimized production build in the `build` folder.

```bash

cd frontend## Responsive Design



# Start development serverCampusConnect is fully responsive and works seamlessly across:

npm start- 📱 Mobile devices (phones < 640px)

- 📱 Tablets (640px - 1024px)

# Build for production- 💻 Desktops (1024px+)

npm run build

### Mobile Features

# Run tests- Hamburger menu with slide-out navigation

npm test- Touch-friendly buttons (44px minimum)

```- Optimized Gmail interface

- Stacked layouts for easy scrolling

## Features

## Project Structure

### 📱 Fully Responsive

- Mobile-friendly interface (< 640px)```

- Tablet optimized (640px - 1024px)CampusConnect/

- Desktop enhanced (> 1024px)├── public/              # Static files

├── src/

### 🎨 Modern UI/UX│   ├── components/      # Reusable components

- Clean, professional design│   │   └── ProfessionalLogin.js

- Smooth animations and transitions│   ├── App.js          # Main application

- Intuitive navigation│   ├── StudentDashboard.js

- Dark theme support ready│   ├── MentorDashboard.js

│   ├── PlacementDashboard.js

### 🔐 Security Ready│   ├── index.css       # Global styles

- Authentication system in place│   └── index.js        # Entry point

- Role-based access control structure├── package.json

- Secure data handling patterns└── tailwind.config.js  # Tailwind configuration

```

## Project Status

## Available Scripts

- ✅ Frontend: Complete and responsive

- ⏳ Backend: To be integrated### `npm start`

- ⏳ API Integration: PendingRuns the app in development mode at [http://localhost:3000](http://localhost:3000)

- ⏳ Database: To be configured

### `npm run build`

## ContributingBuilds the app for production to the `build` folder



1. Fork the repository### `npm test`

2. Create your feature branch (`git checkout -b feature/AmazingFeature`)Launches the test runner in interactive watch mode

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

4. Push to the branch (`git push origin feature/AmazingFeature`)## Browser Support

5. Open a Pull Request

- ✅ Chrome (90+)

## Repository- ✅ Firefox (88+)

- ✅ Safari (14+)

**GitHub**: [pravin-4620/CampusConnect](https://github.com/pravin-4620/CampusConnect)- ✅ Edge (90+)

- ✅ Mobile browsers (iOS 14+, Android 10+)

## License

## Contributing

This project is open source and available under the MIT License.

1. Fork the repository

## Contact2. Create your feature branch (`git checkout -b feature/AmazingFeature`)

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

**Pravin** - [@pravin-4620](https://github.com/pravin-4620)4. Push to the branch (`git push origin feature/AmazingFeature`)

5. Open a Pull Request

---

## License

**Made with ❤️ for campus management**

This project is open source and available under the MIT License.

## Contact

**Pravin**
- GitHub: [@pravin-4620](https://github.com/pravin-4620)
- Repository: [CampusConnect](https://github.com/pravin-4620/CampusConnect)

## Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ for campus management**


### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
