import axios from 'axios';

import React from 'react';
import './App.css';
import Header from './Header.js';
import Menu from './Menu.js';
import Body from './Body.js';
import Footer from './Footer.js';

class App extends React.Component {

    constructor() {
        super();
        this.state = {
            summary: '',
            temperature: 0.0,
            precip: 0.0,
            cities: ['Montpellier', 'Paris', 'Wellington']
        }
        this.changeCity = this.changeCity.bind(this);
    }

    componentDidMount() {
        this.changeCity('Montpellier')
    }

    changeCity(city) {
        console.log(city);
        axios.get('/weather?city='+city).then(response => {
            this.setState({
                summary: response.data.summary,
                temperature: response.data.temperature,
                precip: response.data.precip
            })
        });
    }

    render() {

        /*
        var weather = '';

        if (this.state.summary !== '') {
            weather = <div>
                <p>Le temps: {this.state.summary}</p>
                <p>La température: {this.state.temperature}</p>
            </div>
        }
        */

        return (
            <div className="App">
                <Header />
                <Menu cities={this.state.cities} changeCity={this.changeCity} />
                <Body summary={this.state.summary} temperature={this.state.temperature} precip={this.state.precip} />
                <Footer />
            </div>
        );
    }
}

export default App;
