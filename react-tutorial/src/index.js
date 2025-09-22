import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import MyForm from './components/MyForm';
import StudentDash from './StudentDash';
import Placement from './Placement';
import Mentor from './Mentor';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MyForm />
    {/* <Placement /> */}
    {/* {<Mentor /> } */}
    {/* <StudentDash /> */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
