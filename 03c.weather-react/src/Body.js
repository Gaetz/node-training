import React from 'react';

class Body extends React.Component {

    render() {
        var precipPercent = this.props.precip * 100;

        return (
            <div>
                <p><b>Météo : </b>{this.props.summary}</p>
                <p><b>Température : </b>{this.props.temperature}</p>
                <p><b>Chances de précipitations : </b>{precipPercent}%</p>
            </div>
        );
    }
}

export default Body;