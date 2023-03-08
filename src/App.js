import React, { useState, useEffect } from 'react';
import {
  Navbar,
  Container,
  Table,
  Col,
  Row,
  Button,
  ButtonGroup,
  Dropdown
} from 'react-bootstrap';
import './App.css';
import moment from 'moment';
import Chart from 'react-apexcharts';

function App() {

  const [botData, setBotData] = useState()
  const [posData, setPosData] = useState()
  const [closedData, setClosedData] = useState()

  const [showBot, setShowBot] = useState(true)
  const [showCurPos, setShowCurPos] = useState(false)
  const [showClosed, setShowClosed] = useState(false)

  const [selectedStrat, setSelectedStrat] = useState('Ελπις (Elpis)');
  const stratNames = ['Ελπις (Elpis)', 'Κασσάνδρα (Cassandra)'];

  const toggleShowBot = () => {
    setShowBot(!showBot)
    setShowCurPos(false)
    setShowClosed(false)
  }
  const toggleShowCurPos = () => {
    setShowCurPos(!showCurPos)
    setShowBot(false)
    setShowClosed(false)
  }
  const toggleShowClosed = () => {
    setShowClosed(!showClosed)
    setShowCurPos(false)
    setShowBot(false)
  };

  const bots = process.env.PUBLIC_URL + '/botdata/'+ selectedStrat + ' Total.json'
  const positions = process.env.PUBLIC_URL + '/botdata/'+ selectedStrat + ' Open.json'
  const closed = process.env.PUBLIC_URL + '/botdata/'+ selectedStrat + ' Closed.json'

  useEffect(() => {
    fetch(bots)
      .then((response) => response.json())
      .then((data) =>
        setBotData(data)
      ).then(
        fetch(positions)
          .then((response) => response.json())
          .then((data) =>
            setPosData(data)
          )
      ).then(
        fetch(closed)
          .then((response) => response.json())
          .then((data) =>
            setClosedData(data)
          )
      )
  }, [bots, closed, positions, selectedStrat])

  const dollarUS = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  let categories = []
  let seriesDataPL = []
  let seriesDataTarget = []
  let ept = selectedStrat === "Κασσάνδρα (Cassandra)" ? 50 : 25

  const buildChart = () => {

    const closedValuesPL = Object.entries((closedData || []).reduce((dv, { closeDate: d, pnl: v }) => ({ ...dv, [moment(d).format('MMM DD YYYY')]: (dv[moment(d).format('MMM DD YYYY')] || 0) + v }), {})).map(([closeDate, pnl]) => ({ closeDate, pnl })).sort((a, b) => { const dateA = new Date(a.closeDate); const dateB = new Date(b.closeDate); return dateA - dateB })
    const closedValuesTarget = Object.entries((closedData || []).reduce((dv, { closeDate: d, quantity: v }) => ({ ...dv, [moment(d).format('MMM DD YYYY')]: (dv[moment(d).format('MMM DD YYYY')] || 0) + (v / v) }), {})).map(([closeDate, quantity]) => ({ closeDate, quantity })).sort((a, b) => { const dateA = new Date(a.closeDate); const dateB = new Date(b.closeDate); return dateA - dateB })
    categories = Array.from(closedValuesPL.map(({ closeDate }) => closeDate)).sort((a, b) => { const dateA = new Date(a.closeDate); const dateB = new Date(b.closeDate); return dateA - dateB })

    seriesDataPL = Array.from(closedValuesPL.map(({ pnl }) => pnl)).reduce((acc, currentValue, currentIndex) => {
      if (currentIndex === 0) {
        return [currentValue];
      }
      return [...acc, currentValue + acc[currentIndex - 1]];
    }, [])

    seriesDataTarget = Array.from(closedValuesTarget.map(({ quantity }) => quantity * ept)).reduce((acc, currentValue, currentIndex) => {
      if (currentIndex === 0) {
        return [currentValue];
      }
      return [...acc, currentValue + acc[currentIndex - 1]];
    }, [])

    const chartData = {
      options: {
        annotations: {
          xaxis: [
            {
              x: "Jan 24 2023",
              strokeDashArray: 1,
              borderColor: "#FF10F0",
              label: {
                orientation: 'horizontal',
                borderColor: "#FF10F0",
                style: {
                  color: "#fff",
                  background: "#FF10F0"
                },
                text: ["FIXED ROR ERROR", "START NEW POSITION STRATEGY"]
              }
            }
          ]
        },
        chart: {
          id: 'area',
          type: 'area',
          foreColor: '#fff',
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
            autoScaleYaxis: true
          }
        },
        tooltip: {
          enabled: true
        },
        xaxis:
        {
          categories: categories,
          tooltip: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.5,
          stops: [0, 50, 100]
        }
      },
      series: [
        {
          name: "Projected P/L",
          data: seriesDataTarget,
          color: '#1589FF',
        },
        {
          name: "Actual P/L",
          data: seriesDataPL,
          color: '#16F529'
        }
      ],
    }
    return (
      <div className="pl-chart mb-3 text-white">
        {selectedStrat}
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="area"
          width="100%"
          height="175%"
        />
      </div>
    )
  }

  const dataBotBody = () => (botData || []).sort((a, b) =>
    b.pnl - a.pnl).map((bot, i) => {
      return (
        <tr key={i}>
          <td className='align-middle gold'>{bot.name}</td>
          <td className='align-middle text-center'>{bot.pcount}</td>
          <td className='align-middle text-center'>{dollarUS.format(bot.seed)}</td>
          <td className='align-middle text-center'>{dollarUS.format(bot.draw)}</td>
          <td className={`align-middle text-center ${bot.pnl < 0 ? "red" : "green"}`}>{dollarUS.format(bot.pnl)}<br></br>{Math.round(bot.roi * 100)}%</td>
        </tr>
      )
    })

  const dataBotFoot = () => {
    const positions = Object.values(botData || []).reduce((t, { pcount }) => t + pcount, 0)
    const allocation = Object.values(botData || []).reduce((t, { seed }) => t + seed, 0)
    const risk = Object.values(botData || []).reduce((t, { draw }) => t + draw, 0)
    const pl = Object.values(botData || []).reduce((t, { pnl }) => t + pnl, 0)
    const plPerc = Math.round((100 * pl / allocation))
    return (
      <tr>
        <td className='align-middle'>TOTALS</td>
        <td className='align-middle text-center'>{positions}</td>
        <td className='align-middle text-center'>{dollarUS.format(allocation)}</td>
        <td className='align-middle text-center'>{dollarUS.format(risk)}</td>
        <td className={`align-middle text-center ${pl < 0 ? "red" : "green"}`}>{dollarUS.format(pl)}
          <br></br>{plPerc}%
        </td>
      </tr>
    )
  }

  const dataPosBody = () => (posData || [])
  .filter(pos => !isNaN(pos.days) && pos.days !== '')
  .sort((a, b) => a.days - b.days)
  .map((pos, i) => {
    return (
      <tr key={i}>
        <td className="gold">
          <div className="text-white">{pos.symbol} | {pos.strategy}</div>
          <div>{pos.text}</div>
          <div className="grey">{moment(pos.expiration).format('MMM D')} </div>
        </td>
        <td className='align-middle text-center'>{pos.days}</td>
        <td className='align-middle text-center'>{pos.quantity}</td>
        <td className='align-middle text-center'>{dollarUS.format(pos.draw)}</td>
        <td className={`align-middle text-center ${pos.pnl < 0 ? "red" : "green"}`}>{dollarUS.format(pos.pnl)}</td>
        <td className={`align-middle text-center ${pos.ror < 0 ? "red" : "green"}`}>{Math.round(pos.ror * 100)}%</td>
      </tr>
    )
  })


  const dataPosFoot = () => {
    const currentPositionCount = (posData || []).length
    const risk = Object.values(posData || []).reduce((t, { draw }) => t + (isNaN(draw) ? 0 : draw), 0)
    const pl = Object.values(posData || []).reduce((t, { pnl }) => t + (isNaN(pnl) ? 0 : pnl), 0)
    const plPerc = isNaN(pl) || isNaN(risk) ? 0 : isNaN(Math.round(100 * pl / risk)) ? 0 : Math.round(100 * pl / risk)
    return (
      <tr>
        <td className='align-middle' colSpan='3'>TOTALS: {currentPositionCount} Current Positions</td>
        <td className='align-middle text-center'>{dollarUS.format(risk)}</td>
        <td className={`align-middle text-center ${pl < 0 ? "red" : "green"}`}>{dollarUS.format(pl)}</td>
        <td className={`align-middle text-center ${plPerc < 0 ? "red" : "green"}`}>{plPerc}%</td>
      </tr>
    )
  }
  
  const dataClosedBody = () => (closedData || []).filter((pos) => pos.status !== "cancelled").sort((a, b) =>
    moment(b.closeDate).valueOf() - moment(a.closeDate)).map((pos, i) => {
      return (
        <tr key={i}>
          <td className="gold">
            <div className="text-white">{pos.symbol} | {pos.type}</div>
            <div>{pos.text}</div>
            <div className="grey">Quantity: {pos.quantity}</div>
          </td>
          <td className='align-middle text-center'>{moment(pos.openDate).format('MMM D HH:mm')}</td>
          <td className='align-middle text-center'>{moment(pos.closeDate).format('MMM D HH:mm')}</td>
          <td className='align-middle text-center'>{dollarUS.format(pos.draw)}</td>
          <td className={`align-middle text-center ${pos.pnl < 0 ? "red" : "green"}`}>{dollarUS.format(pos.pnl)}</td>
        </tr>
      )
    })

  const dataClosedFoot = () => {
    const closedPositionCount = (closedData || []).filter((pos) => pos.status !== "cancelled").length
    const risk = Object.values(closedData || []).reduce((t, { draw }) => t + draw, 0)
    const pnl = dollarUS.format(Math.round((Object.values(closedData || []).reduce((t, { pnl }) => t + pnl, 0))))
    return (
      <tr>
        <td className='align-middle' colSpan='3'>TOTALS: {closedPositionCount} Closed Positions</td>
        <td className='align-middle text-center'>{dollarUS.format(risk)}</td>
        <td className={`align-middle text-center ${pnl < 0 ? "red" : "green"}`}>{pnl}</td>
      </tr>
    )
  }

  const metrics = () => {
    const winLossCount = (closedData || []).filter((pos) => pos.status !== "cancelled").reduce((acc, { pnl }) => {
      if (pnl > 0) {
        acc.wins++;
      } else if (pnl < 0) {
        acc.losses++;
      }
      return acc;
    }, { wins: 0, losses: 0 });
    const winPercent = Math.round(winLossCount.wins / (closedData || []).length * 100) / 100
    const lossPercent = Math.round(winLossCount.losses / (closedData || []).length * 100) / 100
    const avgWin = (closedData || []).filter(({ pnl }) => pnl > 0).reduce((t, { pnl }) => t + pnl, 0) / (closedData || []).filter(({ pnl }) => pnl > 0).length
    const avgLoss = (closedData || []).filter(({ pnl }) => pnl < 0).reduce((t, { pnl }) => t + pnl, 0) * -1 / (closedData || []).filter(({ pnl }) => pnl < 0).length
    const expectancy = (winPercent * avgWin) - (lossPercent * avgLoss)
    const risk = Object.values(closedData || []).reduce((t, { draw }) => t + draw, 0)
    const pnl = Math.round((Object.values(closedData || []).reduce((t, { pnl }) => t + pnl, 0)))
    const calmarRatio = (pnl / Math.max(...(closedData || []).map(({ draw }) => draw))).toFixed(2)
    const ror = pnl / risk
    return (
      <tbody>
        <tr>
          <td className='align-middle'>Win Percentage</td>
          <td className='align-middle'>{Math.round(winPercent * 100)}%</td>
        </tr>
        <tr>
          <td className='align-middle'>Loss Percentage</td>
          <td className='align-middle'>{Math.round(lossPercent * 100)}%</td>
        </tr>
        <tr>
          <td className='align-middle'>Calmar Ratio</td>
          <td className='align-middle'>{calmarRatio}</td>
        </tr>
        <tr>
          <td className='align-middle'>Return on Risk</td>
          <td className='align-middle'>{Math.round(ror * 100)}%</td>
        </tr>
        <tr>
          <td className='align-middle'>Expectancy Per Trade</td>
          <td className='align-middle'>{dollarUS.format(expectancy)}</td>
        </tr>
      </tbody>
    )
}


  return (
    <>
<Navbar bg="dark" sticky="top">
  <Container fluid>
    <Navbar.Brand className="text-light p-0" style={{ display: "flex", alignItems: "center" }}>
      <img src={process.env.PUBLIC_URL + "/OptionsAnalyzerS.png"} alt="logo - target with arrow" className="mt-1 mb-2" style={{ width: "2.25em" }} />
      <Button className="b-color m-2 p-2 text-center mr-auto" href="https://optionalpha.com/">Data Sourced from Option Alpha</Button>
      <Dropdown>
        <Dropdown.Toggle variant="primary" id="bot-select" className="b-color m-2 p-2 text-center">
          {selectedStrat}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {stratNames.map((strat) => (
            <Dropdown.Item
              key={strat}
              onClick={() => setSelectedStrat(strat)}
            >
              {strat}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </Navbar.Brand>
  </Container>
</Navbar>

      <Container fluid>
        <Row className="overflow-hidden">

          {buildChart()}

          <Col sm={2}>
            <Table size="sm" className="text-light border border-secondary mt-3">
              <thead>
                <tr>
                  <th className="text-center" colSpan='2'>METRICS</th>
                </tr>
              </thead>
              {metrics()}
            </Table>
          </Col>

          <Col>
            <Row className="mx-auto mt-3">
              <ButtonGroup>
                <Button variant="outline-secondary" size="small" className="mb-2" onClick={toggleShowBot}>Bot Details</Button>
                <Button variant="outline-secondary" size="small" className="mb-2" onClick={toggleShowCurPos}>Current Positions</Button>
                <Button variant="outline-secondary" size="small" className="mb-2" onClick={toggleShowClosed}>Closed Positions</Button>
              </ButtonGroup>
            </Row>

            <Row className="mx-auto mt-3 mb-2 p-1">
              {showBot ? (
                <Table responsive size="sm" className="sticky text-light border border-secondary">
                  <thead>
                    <tr>
                      <th className="text-left header align-middle">BOT</th>
                      <th className="text-center align-middle">POSITIONS</th>
                      <th className="text-center align-middle">ALLOCATION</th>
                      <th className="text-center align-middle">CAP AT RISK</th>
                      <th className="text-center align-middle">P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataBotBody()}
                  </tbody>
                  <tfoot>
                    {dataBotFoot()}
                  </tfoot>
                </Table>
              ) : null}

              {showCurPos ? (
                <Table responsive size="sm" className="sticky text-light border border-secondary">
                  <thead>
                    <tr>
                      <th className="text-left align-middle">CURRENT POSITIONS</th>
                      <th className="text-center align-middle">DAYS</th>
                      <th className="text-center align-middle">QTY</th>
                      <th className="text-center align-middle">CAP AT RISK</th>
                      <th className="text-center align-middle">P/L</th>
                      <th className="text-center align-middle">RETURN ON RISK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataPosBody()}
                  </tbody>
                  <tfoot>
                    {dataPosFoot()}
                  </tfoot>
                </Table>
              ) : null}

              {showClosed ? (
                <Table responsive size="sm" className="sticky text-light border border-secondary">
                  <thead>
                    <tr>
                      <th className="text-left align-middle">CLOSED POSITIONS</th>
                      <th className="text-center align-middle">OPEN DATE</th>
                      <th className="text-center align-middle">CLOSED DATE</th>
                      <th className="text-center align-middle">CAP RISKED</th>
                      <th className="text-center align-middle">P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataClosedBody()}
                  </tbody>
                  <tfoot>
                    {dataClosedFoot()}
                  </tfoot>
                </Table>
              ) : null}

            </Row>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default App;
