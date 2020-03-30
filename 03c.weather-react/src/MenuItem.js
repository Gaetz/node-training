import React from 'react';
//import './MenuItem.css';

class MenuItem extends React.Component {

    render() {
        const label = this.props.label;
        const func = this.props.function;
        return <a href='#' onClick={() => func(label)}>{label}</a>
    }

}

export default MenuItem;