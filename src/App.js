import { React, useState, useEffect } from 'react';
import {
  Navbar,
  Container,
  Table,
  Col,
  Row,
  Button
} from 'react-bootstrap';
import './App.css';
import moment from 'moment';


function App() {

  const [botData, setBotData] = useState()
  const [posData, setPosData] = useState()

  const bots = process.env.PUBLIC_URL + '/botdata/bots.json'
  const positions = process.env.PUBLIC_URL + '/botdata/positions.json'

  let dollarUS = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

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
      )
  }, [bots, positions])

  const dataBotBody = () => (botData || []).map((bot, i) => {
    return (
      <tr key={i}>
        <td className='align-middle green'>{bot.name}</td>
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
        <td className="green">
            <div className="text-white">{pos.symbol} | {pos.strategy}</div>
            <div>{pos.text}</div>
            <div className="grey">{moment(pos.expiration).format('MMM D')} </div>
        </td>
        <td className='align-middle text-center'>{pos.days}</td>
        <td className='align-middle text-center'>{pos.quantity}</td>
        <td className='align-middle text-center'>{pos.draw}</td>
        <td className={`align-middle text-center ${pos.pnl < 0 ? "red" : "green"}`}>{dollarUS.format(pos.pnl)}</td>
        <td className={`align-middle text-center ${pos.ror < 0 ? "red" : "green"}`}>{dollarUS.format(pos.ror)}</td>
      </tr>
    )
  })

  const dataPosFoot = () => {
    let risk = Object.values(posData || []).reduce((t, { draw }) => t + draw, 0)
    let pl = Object.values(posData || []).reduce((t, { pnl }) => t + pnl, 0)
    let plPerc = Math.round((100 * pl / risk))
    return (
      <tr>
        <td className='align-middle' colSpan='3'>TOTALS</td>
        <td className='align-middle text-center'>{dollarUS.format(risk)}</td>
        <td className={`align-middle text-center ${pl < 0 ? "red" : "green"}`}>{dollarUS.format(pl)}</td>
        <td className={`align-middle text-center ${plPerc < 0 ? "red" : "green"}`}>{plPerc}%</td>
      </tr>
    )
  }

  return (
    <>
      <Navbar bg="dark" sticky="top">
      <Container fluid>
          <Navbar.Brand className="text-light p-0"><Button className="b-color mt-2 mb-2 pt-1 pb-1" href="https://optionalpha.com/">Data Sourced from Option Alpha</Button><br></br>Ελπις (Elpis): Expectancy Strategy Performance</Navbar.Brand>
          </Container>
      </Navbar>

      <Container fluid>
        <Row>
          <Container className="pt-0">
            <Row className="bg-dark d-flex aligns-items-center justify-content-center">
              <Col>
                <Table responsive size="sm" className="text-light border">
                  <thead>
                    <tr>
                      <th>BOT</th>
                      <th className="text-center">POSITIONS</th>
                      <th className="text-center">ALLOCATION</th>
                      <th className="text-center">CAP AT RISK</th>
                      <th className="text-center">P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataBotBody()}
                  </tbody>
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
                <Table responsive size="sm" className="text-light border">
                  <thead>
                    <tr>
                      <th>POSITIONS</th>
                      <th className="text-center header">DAYS</th>
                      <th className="text-center header">QTY</th>
                      <th className="text-center header">CAP AT RISK</th>
                      <th className="text-center header">P/L</th>
                      <th className="text-center header">RETURN ON RISK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataPosBody()}
                  </tbody>
                  <tfoot>
                    {dataPosFoot()}
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
