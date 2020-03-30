import React from 'react';
import './Menu.css';
import MenuItem from "./MenuItem";

class Menu extends React.Component {

    constructor(props) {
        super(props);
        this.createMenuItem = this.createMenuItem.bind(this);
    }

    createMenuItem(label, func) {
        return <span><MenuItem label={label} function={func} /> </span>;
    }

    render() {
        const menu = this.props.cities.map(c => this.createMenuItem(c, this.props.changeCity))

        return (
            <div className='Menu'>
                {menu}
            </div>
        );
    }
}

export default Menu;