import React, {Component} from 'react'
import {render} from 'react-dom'


class App extends Component {
  constructor() {
    super()
    this.state = {mode: 'Go To Statistics'}
  }

  render() {
    let modes = {history: 'Go To Game', game: 'Go To Statistics'}
    return (
      <div className='text-center'>

        <button style={{marginTop: '5px'}}

          onClick={() => {

            this.setState({mode: (this.state.mode === modes.game ? modes.history : modes.game)})

          }}> {this.state.mode} </button>

        <ScoreSheet active={this.state.mode === modes.game}/>

        {this.state.mode === modes.history ? <Statistics/> : null}

      </div>
    )
  }
}


class ScoreSheet extends Component {
  constructor(props) {
    super(props)

    const bonus = num => num < 30 ? 5 : 10

    const boxes = [10,15,20,25,30,35].map(num => {

      return [1,2,3,4,5,6].map(i => {

        return {points: num, bonus: (i === 1 || i === 6 ? bonus(num) : 0), marked: false}

      })

    })
    this.state = {boxes}
  }

  checkBox(boxes, i, j) {
    //array int int -> array

    boxes[i][j].marked = !boxes[i][j].marked
    return boxes
  }

  score(boxes) {
    //array -> array
    //points from every checked box + bonus if whole row is checked

    return boxes.reduce((total, row) => {

      return total + row.reduce((tot, box) => {

        return tot + (box.marked ? box.points + box.bonus : 0)

      }, 0) + (!row.some(box => !box.marked) ? row[0].points : 0)

    }, 0)
  }

  reset(boxes) {
    //array -> array

    return confirm('Reset game?') ? 

    boxes.map(row => {

        return row.map(box => {

          box.marked = false

          return box

        })

      }) : boxes
  }

  saveHistory(boxes) {
    //array -> nothing

    const history = localStorage.getItem('history')
    const currentGame = {date: Date.now(), putts: this.toHistoryFormat(boxes)}

    if (history != null) {
      localStorage.setItem('history',JSON.stringify({games:[...JSON.parse(history).games, currentGame]}))
    } else {
      localStorage.setItem('history',JSON.stringify({games:[currentGame]}))
    }
  }

  toHistoryFormat(boxes) {
    //array -> array

    return boxes.map(row => row.map(box => box.marked))
  }

  render() {
    return (
      this.props.active ? (<div>

        <div style={{fontSize: 20}}>1025 Putting Practice Game</div>

        <div style={{margin: 8}}> {this.state.boxes.map((row, i) => <div key={i}>{row.map((box, j) => {

            //for every 'box' return a checkbox, at end of row add in the row's score tier

            return <input name='attempt' type='checkbox'

                    checked={box.marked} key={i * 6 + j}

                    onChange={() => {

                      return this.setState({boxes: this.checkBox(this.state.boxes, i, j)})}

                    }

                    style={{width: 15, height: 15, margin: 6}}/>

          })}

          <span style={{fontSize: 18}}>{row[0].points + "'"}</span></div>

        )} </div>

        {/*reset button next to score*/}

        <div style={{fontSize: 18, margin: 5}}>

          Score: {this.score(this.state.boxes)}

        </div>

        <div style={{fontSize: 18}}>

          <button onClick={() => this.setState({boxes:this.reset(this.state.boxes)})}>Reset</button>

          {' | '}

          <button onClick={() => {

            if (confirm('This will be saved to your history, are you sure?')) {
              this.saveHistory(this.state.boxes)
              this.setState({boxes:this.reset(this.state.boxes)})
            }

          }}>Save Game</button>

        </div>

      </div>) : null
    )
  }
}

class Statistics extends Component {
  constructor() {
    super()
    let history = JSON.parse(localStorage.getItem('history'))
    this.state = {games: history}
  }

  loadHistory() {
    let history = JSON.parse(localStorage.getItem('history')) || []
    this.setState({games: history.games})
  }

  getPercentage(history) {
    const TOTAL_PUTTS = 36
    const numGames = history.length
    return history.reduce((total, game) => {
      return total + [].concat.apply([], game.putts).reduce((round_total, putt) => {
        return round_total + (putt ? 1 : 0)
      }, 0)
    }, 0) / TOTAL_PUTTS / numGames * 100
  }

  componentWillMount() {
    this.loadHistory()
  }

  render() {
    return (
        <div>

          Putting Percentage: {this.getPercentage(this.state.games).toFixed(2)}%

        </div>

    )
  }
}

render(<App />, document.querySelector('#root'))