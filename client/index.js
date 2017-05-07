import React, {Component} from 'react'
import {render} from 'react-dom'


class App extends Component {
  render() {
    return (
      <div className="text-center">
        <Timer />
      </div>
    )
  }
}


class Timer extends Component {
  constructor() {
    super()
    
  }

  render() {
    
    return (
      <div>
        hi
      </div>
    )
  }
}

render(<App />, document.querySelector('#root'))