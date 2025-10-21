# CampusConnect

A modern, responsive campus management system built with React and Tailwind CSS. CampusConnect provides separate dashboards for Students, Mentors, and Placement Officers with features including placement management, email integration, and event tracking.

## Features

### 👨‍🎓 Student Dashboard
- **Overview**: View stats, assignments, news feed, and upcoming events
- **Profile Management**: Update personal information, upload resume and certificates
- **Gmail Integration**: AI-categorized emails (Academic, Career, Events, Social)
- **Placements & Internships**: Browse opportunities and request mentor approval
- **Events & Workshops**: Register for college events

### 👨‍🏫 Mentor Dashboard
- **Student Management**: View and manage assigned students
- **Approval System**: Review and approve placement applications and event registrations
- **Student Information**: Access detailed student profiles and performance
- **Communications**: Manage interactions with students

### 💼 Placement Officer Dashboard
- **Company Management**: Track recruiting companies
- **Placement Drives**: Manage recruitment drives and schedules
- **Student Database**: Access all student information
- **Applications**: Review and manage student applications
- **Analytics & Reports**: Generate placement statistics
- **Announcements**: Send notifications to students

## Tech Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Create React App

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pravin-4620/CampusConnect.git
   cd CampusConnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Responsive Design

CampusConnect is fully responsive and works seamlessly across:
- 📱 Mobile devices (phones < 640px)
- 📱 Tablets (640px - 1024px)
- 💻 Desktops (1024px+)

### Mobile Features
- Hamburger menu with slide-out navigation
- Touch-friendly buttons (44px minimum)
- Optimized Gmail interface
- Stacked layouts for easy scrolling

## Project Structure

```
CampusConnect/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable components
│   │   └── ProfessionalLogin.js
│   ├── App.js          # Main application
│   ├── StudentDashboard.js
│   ├── MentorDashboard.js
│   ├── PlacementDashboard.js
│   ├── index.css       # Global styles
│   └── index.js        # Entry point
├── package.json
└── tailwind.config.js  # Tailwind configuration
```

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner in interactive watch mode

## Browser Support

- ✅ Chrome (90+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ✅ Edge (90+)
- ✅ Mobile browsers (iOS 14+, Android 10+)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

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
