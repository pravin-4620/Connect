import './App.css';
import ProfessionalLogin from './components/ProfessionalLogin';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <ProfessionalLogin />
      </div>
    </ThemeProvider>
  );
}

export default App;
