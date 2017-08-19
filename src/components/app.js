import React, { Component } from 'react';
import { json } from 'd3-request';

import HeatMap from './heat_map';

const DATA_URL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
    }
  }
  componentDidMount() {
    var _this = this;
    this.serverRequest = json(DATA_URL, d => {
      _this.setState({
        data: d
      });
    })
  }
   render() {
     return (
      <div className='App'>
        <div className="row">
          <div className="col-md-12">
            <div className="header">
              <h1>Monthly Global Land-Surface Temperature</h1>
              <h2>1753 - 2015</h2>
              <div className="notes">Temperatures are in Celsius and reported as anomalies relative to the Jan 1951-Dec 1980 average. Estimated Jan 1951-Dec 1980 absolute temperature ℃: 8.66 +/- 0.07</div>
            </div>
            { Object.keys(this.state.data).length !== 0 ? <HeatMap baseTemp={this.state.data.baseTemperature} data={this.state.data.monthlyVariance} size={[920,500]} /> : null }
          </div>
        </div>
      </div>
     )
   }
};
