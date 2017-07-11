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
    this.state = {games: history.games}
  }

  loadHistory() {
    let history = JSON.parse(localStorage.getItem('history')) || []
    this.setState({games: history.games})
  }

  getPercentage(games, distRange = {s: 0, e: 6}) {

    //getting data on only
    const TOTAL_PUTTS = 36
    const numGames = games.length

    //games is [num games played ->
    // game object ->
    //  {date: -> Int,
    //   putts: ->
    //    [num rows/distances in game ->
    //      [num putts per row (bool)]]}]

    const puttsMade = games.reduce((total, game) => {
      return total + [].concat.apply([], game.putts.slice(distRange.s, distRange.e)).reduce((round_total, putt) => {
        return round_total + (putt ? 1 : 0)
      }, 0)
    }, 0)
    
    const percentage = puttsMade / (TOTAL_PUTTS * (distRange.e - distRange.s) / 6) / numGames * 100
    return percentage
  }

  componentWillMount() {
    this.loadHistory()
  }

  componentDidMount() {
    const pieDataRough = this.compressByDistance(this.state.games).map(putts => putts.reduce((total, putt) => putt ? total + 1 : total, 0))
    const pieData = pieDataRough.map((count, i) => {
      return {description: 10 + i * 5 + "'", amount: count}
    })

    this.canvas(pieData)
  }

  drawCircSection(context, arcStart, arcEnd, color, {x, y, r}) {
    context.fillStyle = color
    context.beginPath()
    context.moveTo(x,y)
    context.arc(x, y, r, arcStart, arcEnd)
    context.moveTo(x,y)
    context.fill()
  }

  getColors(size) {
    const COLOR_LIB = ['darkblue', 'blue', 'royalblue', 'skyblue', 'green', 'limegreen', 'gold', 'darkorange', 'orangered', 'violet', 'magenta', 'purple', '#4d004d', 'black']
    const COLOR_6 = [0, 3, 4, 6, 7, 8]
    const COLOR_LESS_10 = [0, 3, 4, 5, 6, 7, 8, 9, 10]
    if (size < 7) {
      return COLOR_6.map(i => COLOR_LIB[i])
    } else if (size < 10) {
      return COLOR_LESS_10.map(i => COLOR_LIB[i])
    } else {
      return COLOR_LIB
    }
  }

  makeSections(putts) {

    const puttTotal = putts.reduce((total, puttCount) => {
      return total + puttCount
    })

    const sections = putts.map(count => count / puttTotal)
    return sections
  }

  drawPieChart(context, cWidth, cHeight, sections = []) {
    //set color key based on number of chart sections
    const colors = this.getColors(sections.length)

    const chartInfo = {
      x: cWidth - cHeight + cHeight/2,
      y: cHeight/2,
      r: cHeight/2,
      color: 'black'
    }

    let sectionStart = Math.PI

    sections.forEach((portion, i) => {
      const sectionEnd = sectionStart + 2 * Math.PI * portion
      this.drawCircSection(context, sectionStart, sectionEnd, colors[i], chartInfo)
      sectionStart = sectionEnd
    })
  }

  drawLegend(context, cWidth, cHeight, distances = [], sections = []) {
    //set color key based on number of chart sections
    const colors = this.getColors(sections.length)


    const startX = (cWidth - cHeight) / 10
    const startY = startX
    const endX = startX + (cWidth - cHeight) * 8 / 10
    const endY = cHeight

    const spacing = (endY - startY) / (distances.length + 1)

    distances.forEach((distance, i) => {

      //legend squares
      context.fillStyle = colors[i]
      const x = startX + spacing / 2
      const y = startY + spacing * (2 * i + 1) / 2
      context.fillRect(x, y, spacing / 2, spacing / 2)

      //legend text
      context.fillStyle = 'black'
      context.font = spacing / 2 + 'px Verdana';
      context.fillText(distance + ' ' + (sections[i] * 100).toFixed(1) + '%', x + spacing * 2/3, y + spacing * 2/5)
    })

  }

  canvas(pieData) {
    //there should be one canvas per dataset
    const canvas = this.refs.pieChart,
        context = canvas.getContext('2d'),
        width = canvas.width,
        height = canvas.height

    // const pieData = [{description: "10'", amount: 6},
    //                  {description: "15'", amount: 6}, 
    //                  {description: "20'", amount: 5}, 
    //                  {description: "25'", amount: 4}, 
    //                  {description: "30'", amount: 1}, 
    //                  {description: "35'", amount: 3}]

    this.drawPieChart(context, width, height, this.makeSections(pieData.map(set => set.amount)))
    this.drawLegend(context, width, height, pieData.map(set => set.description), this.makeSections(pieData.map(set => set.amount)))
  }

  filterDates(games, start = 0, end = 1) {
    //start and end round to nearest number
    if (start >= end) {
      const index = Math.round(games.length * start)
      return [games[index]]
    } else {
      let len = games.length
        Math.ceil(len * start)
    }
  }

  compressByDistance(games) {
    //rounds of all games compressed into array of arrays containing all putts from the cooresponding distance
    return games.reduce((allPutts, game) => {
      game.putts.forEach((row, i) => {
        allPutts[i].push(...row)
      })
      return allPutts
    }, [[],[],[],[],[],[]])
  }


  compressByPuttNum(games) {
    //putts of all rounds compressed into array of arrays containing all putts from the cooresponding 
    return games.reduce((allPutts, game) => {
      game.putts.forEach((row, i) => {
        allPutts[i].push(...row)
      })
      return allPutts
    }, [[],[],[],[],[],[]])
  }

  countMadePutts(putts) {
    return putts.reduce((total, putt) => putt ? total + 1 : total ,0)
  }

  render() {
    return (
        <div>

          <div>Overall: {this.getPercentage(this.state.games).toFixed(2)}%</div>
          <div>10-20ft: {this.getPercentage(this.state.games, {s: 0, e: 3}).toFixed(2)}%</div>
          <div>25-35ft: {this.getPercentage(this.state.games, {s: 3, e: 6}).toFixed(2)}%</div>
          <canvas ref="pieChart" width={350} height={200}></canvas>
        </div>

    )
  }
}

render(<App />, document.querySelector('#root'))