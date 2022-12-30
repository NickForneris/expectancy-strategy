import { React, useState, useEffect } from 'react';
import {
  Navbar,
  Container,
  Table,
  Col,
  Row,
  Button,
  Collapse
} from 'react-bootstrap';
import './App.css';
import moment from 'moment';
import Chart from "react-apexcharts";


function App() {

  const [botData, setBotData] = useState()
  const [posData, setPosData] = useState()
  const [closedData, setClosedData] = useState()
  const [isOpenBot, setIsOpenBot] = useState(false);
  const [isOpenCurPos, setIsOpenCurPos] = useState(false);
  const [isOpenClosed, setIsOpenClosed] = useState(false);
  const toggleIsOpenBot = () => setIsOpenBot(!isOpenBot);
  const toggleIsOpenCurPos = () => setIsOpenCurPos(!isOpenCurPos);
  const toggleIsOpenClosed = () => setIsOpenClosed(!isOpenClosed);

  const bots = process.env.PUBLIC_URL + '/botdata/bots.json'
  const positions = process.env.PUBLIC_URL + '/botdata/positions.json'
  const closed = process.env.PUBLIC_URL + '/botdata/closed.json'

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
  }, [bots, closed, positions])

  let dollarUS = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  let categories = []
  let seriesData = []

  const buildChart = () => {
    let catValues = Object.entries((closedData || []).reduce((dv, {closeDate: d, pnl: v}) => ({...dv, [moment(d).format('MMM DD YYYY')]: (dv[moment(d).format('MMM DD YYYY')] || 0) + v}), {})).map(([closeDate, pnl]) => ({closeDate, pnl}))
    categories = Array.from(catValues.map(({closeDate}) => closeDate)).sort((a,b) => Date.parse(a) - Date.parse(b))
    seriesData = Array.from(catValues.map(({pnl}) => pnl)).reduce((acc, currentValue, currentIndex) => {
      if (currentIndex === 0) {
        return [currentValue];
      }
      return [...acc, currentValue + acc[currentIndex - 1]];
    }, []);
    
    const chartData = {
      options: {
        chart: {
          id: 'area',
          type: 'area',
          foreColor: '#fff',
          zoom: {
            autoScaleYaxis: true
          }
        },
        tooltip: {
          enabled: false,
        },
        xaxis: {
          categories: categories
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100]
        }
      },
      series: [
        {
          name: "P/L",
          data: seriesData,
          color: '#16F529'
        }
      ]
    }
    return (
      <div className="pl-chart mb-3">
      Closed Position PL
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

  const dataBotBody = () => (botData || []).map((bot, i) => {
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
    let positions = Object.values(botData || []).reduce((t, { pcount }) => t + pcount, 0)
    let allocation = Object.values(botData || []).reduce((t, { seed }) => t + seed, 0)
    let risk = Object.values(botData || []).reduce((t, { draw }) => t + draw, 0)
    let pl = Object.values(botData || []).reduce((t, { pnl }) => t + pnl, 0)
    let plPerc = Math.round((100 * pl / allocation))
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

  const dataPosBody = () => (posData || []).map((pos, i) => {
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
    let currentPositionCount = (posData || []).length
    let risk = Object.values(posData || []).reduce((t, { draw }) => t + draw, 0)
    let pl = Object.values(posData || []).reduce((t, { pnl }) => t + pnl, 0)
    let plPerc = Math.round((100 * pl / risk))
    return (
      <tr>
        <td className='align-middle' colSpan='3'>TOTALS: {currentPositionCount} Current Positions</td>
        <td className='align-middle text-center'>{dollarUS.format(risk)}</td>
        <td className={`align-middle text-center ${pl < 0 ? "red" : "green"}`}>{dollarUS.format(pl)}</td>
        <td className={`align-middle text-center ${plPerc < 0 ? "red" : "green"}`}>{plPerc}%</td>
      </tr>
    )
  }

  const dataClosedBody = () => (closedData || []).map((pos, i) => {
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
        <td className='align-middle text-center'>{dollarUS.format(pos.cost * -1)}</td>
        <td className={`align-middle text-center ${pos.pnl < 0 ? "red" : "green"}`}>{dollarUS.format(pos.pnl)}</td>
      </tr>
    )
  })

  const dataClosedFoot = () => {
    let closedPositionCount = (closedData || []).length
    let risk = Object.values(closedData || []).reduce((t, { draw }) => t + draw, 0)
    let target = (Object.values(closedData || []).reduce((t, { cost }) => t + cost, 0)) * -1
    let pnl = dollarUS.format(Math.round((Object.values(closedData || []).reduce((t, { pnl }) => t + pnl, 0))))
    return (
      <tr>
        <td className='align-middle' colSpan='3'>TOTALS: {closedPositionCount} Closed Positions</td>
        <td className='align-middle text-center'>{dollarUS.format(risk)}</td>
        <td className='align-middle text-center'>{dollarUS.format(target)}</td>
        <td className={`align-middle text-center ${pnl < 0 ? "red" : "green"}`}>{pnl}</td>
      </tr>
    )
  }

  return (
    <>
      <Navbar bg="dark" sticky="top">
        <Container fluid>
          <Navbar.Brand className="text-light p-0"><span><img src={process.env.PUBLIC_URL + "/OptionsAnalyzerS.png"} alt="logo - target with arrow" className="mt-1 mb-2"/>&nbsp;<Button className="b-color mt-2 mb-2 pt-1 pb-1" href="https://optionalpha.com/">Data Sourced from Option Alpha</Button></span><br></br>Ελπις (Elpis): Expectancy Strategy</Navbar.Brand>
        </Container>
      </Navbar>

      <Container fluid>
        <Row>
          <Container className="pt-0">
            <Row className="bg-dark d-flex aligns-items-center justify-content-center">
              <Col>
              {buildChart()}
              <Button variant="outline-secondary" size="small" className="mb-2 clearfix text-right" onClick={toggleIsOpenBot}>Click to View Details</Button>
                <Table responsive size="sm" className="text-light border border-secondary">
                  <thead>
                    <tr>
                      <th>BOT</th>
                      <th className="text-center">POSITIONS</th>
                      <th className="text-center">ALLOCATION</th>
                      <th className="text-center">CAP AT RISK</th>
                      <th className="text-center">P/L</th>
                    </tr>
                  </thead>
                  <Collapse in={isOpenBot}>
                  <tbody>
                    {dataBotBody()}
                  </tbody>
                  </Collapse>
                  <tfoot>
                    {dataBotFoot()}
                  </tfoot>
                </Table>
              </Col>
            </Row>
          </Container>

          <Container className="mt-3">
            <Row className="bg-dark d-flex aligns-items-center justify-content-center">
              <Col>
              <Button variant="outline-secondary" size="small" className="mb-2 clearfix text-right" onClick={toggleIsOpenCurPos}>Click to View Details</Button>
                <Table responsive size="sm" className="text-light border border-secondary">
                  <thead>
                    <tr>
                      <th>CURRENT POSITIONS</th>
                      <th className="text-center header">DAYS</th>
                      <th className="text-center header">QTY</th>
                      <th className="text-center header">CAP AT RISK</th>
                      <th className="text-center header">P/L</th>
                      <th className="text-center header">RETURN ON RISK</th>
                    </tr>
                  </thead>
                  <Collapse in={isOpenCurPos}>
                  <tbody>
                    {dataPosBody()}
                  </tbody>
                  </Collapse>
                  <tfoot>
                    {dataPosFoot()}
                  </tfoot>
                </Table>
              </Col>
            </Row>
          </Container>

          <Container className="mt-3">
            <Row className="bg-dark d-flex aligns-items-center justify-content-center">
              <Col>
              <Button variant="outline-secondary" size="small" className="mb-2 clearfix text-right" onClick={toggleIsOpenClosed}>Click to View Details</Button>
                <Table responsive size="sm" className="text-light border border-secondary">
                  <thead>
                    <tr>
                      <th>CLOSED POSITIONS</th>
                      <th className="text-center header">OPEN DATE</th>
                      <th className="text-center header">CLOSED DATE</th>
                      <th className="text-center header">CAP RISKED</th>
                      <th className="text-center header">TARGET P/L</th>
                      <th className="text-center header">P/L</th>
                    </tr>
                  </thead>
                  <Collapse in={isOpenClosed}>
                  <tbody>
                    {dataClosedBody()}
                  </tbody>
                  </Collapse>
                  <tfoot>
                    {dataClosedFoot()}
                  </tfoot>
                </Table>
              </Col>
            </Row>
          </Container>

        </Row>
      </Container>
    </>
  )
}

export default App;
