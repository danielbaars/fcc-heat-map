import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/app';

require('../style/style.sass')

ReactDOM.render(
  <div>
    <App />
  </div>
  , document.querySelector('.container'));
