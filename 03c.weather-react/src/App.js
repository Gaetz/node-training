import React from 'react';
import './App.css';
import Header from './Header.js';
import Menu from './Menu.js';
import Body from './Body.js';
import Footer from './Footer.js';

function App() {
    return (
        <div className="App">
            <Header/>
            <Menu/>
            <Body/>
            <Footer/>
        </div>
    );
}

export default App;
