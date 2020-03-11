import React from 'react';
import './Menu.css';

class Menu extends React.Component {
    render() {
        return (
            <div className='Menu'>
                <a>Weather</a> <a>Help</a> <a>About</a>
            </div>
        );
    }
}

export default Menu;