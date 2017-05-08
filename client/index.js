import React, {Component} from 'react'
import {render} from 'react-dom'


class App extends Component {
  render() {
    return (
      <div className="text-center">
        <ScoreSheet />
      </div>
    )
  }
}


class ScoreSheet extends Component {
  constructor() {
    super()
    const bonus = num => num < 30 ? 5 : 10
    const boxes = [10,15,20,25,30,35].map(num => [1,2,3,4,5,6].map(i => {
      return {points: num, bonus: (i === 1 || i === 6 ? bonus(num) : 0), marked: false}
    }))
    this.state = {boxes}
  }
  checkBox(boxes, i, j) {
    boxes[i][j].marked = !boxes[i][j].marked
    return boxes
  }
  score(boxes) {
    //points from every checked box + bonus if whole row is checked
    return boxes.reduce((total, row) => {
      return total + row.reduce((tot, box) => {
        return tot + (box.marked ? box.points + box.bonus : 0)
      }, 0) + (!row.some(box => !box.marked) ? row[0].points : 0)
    }, 0)
  }

  render() {
    return (
      <div>

        {this.state.boxes.map((row, i) => <div key={i}>{row.map((box, j) => {
            //for every 'box' return a checkbox, at end of row add in the row's score tier
            return <input name="attempt" type="checkbox" checked={box.marked} key={i * 6 + j}
            onChange={() => this.setState({boxes: this.checkBox(this.state.boxes, i, j)})}
            style={{width: 15, height: 15, margin: 5}}/>
          })}

          <span style={{fontSize: 18}}>{row[0].points}</span></div>
        )}

        <div>{this.score(this.state.boxes)}</div>
      </div>
    )
  }
}

render(<App />, document.querySelector('#root'))