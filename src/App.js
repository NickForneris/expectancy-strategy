import { React, useState, useEffect } from 'react';
import {
  Navbar,
  Container,
  Table,
  Col,
  Row
} from 'react-bootstrap';


function App() {

  const [botData, setBotData] = useState()
  const url = process.env.PUBLIC_URL + '/botdata/bots.json'

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) =>
        setBotData(data)
      )
  }, [url])

  const dataBody = () => (botData || []).map((bot, i) => {
    return (
      <tr key={i}>
        <td className='align-middle'>{bot.name}</td>
        <td className='align-middle'>{bot.pcount}</td>
        <td className='align-middle'>${bot.seed}</td>
        <td className='align-middle'>{bot.draw}</td>
        <td className='align-middle'>${bot.openPnl}<br></br>{Math.round(bot.roi * 100)}%</td>
      </tr>
    )
  })

  const dataFoot = () => {
    return (
      <tr>
        <td className='align-middle'>TOTALS</td>
        <td className='align-middle'>{Object.values(botData || []).reduce((t, { pcount }) => t + pcount, 0)}</td>
        <td className='align-middle'>${Object.values(botData || []).reduce((t, { seed }) => t + seed, 0)}</td>
        <td className='align-middle'>${Object.values(botData || []).reduce((t, { draw }) => t + draw, 0)}</td>
        <td className='align-middle'>${Object.values(botData || []).reduce((t, { openPnl }) => t + openPnl, 0)}
        <br></br>{Object.values(botData || []).reduce((t, { roi }) => t + roi, 0) * 100}%
        </td>
      </tr>
    )
  }

  return (
    <>
      <Navbar bg="dark" sticky="top">
        <Container>
          <Navbar.Brand className="text-light">Forneris: Expectancy Strategy Performance</Navbar.Brand>
        </Container>
      </Navbar>
      <Container className="pt-1">
        <Row className="bg-dark d-flex aligns-items-center justify-content-center">
          <Col>
            <Table responsive className="text-light border">
              <thead>
                <tr>
                  <th>BOT</th>
                  <th>POSITIONS</th>
                  <th>ALLOCATION</th>
                  <th>CAP AT RISK</th>
                  <th>P/L</th>
                </tr>
              </thead>
              <tbody>
                {dataBody()}
              </tbody>
              <tfoot>
                {dataFoot()}
              </tfoot>
            </Table>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default App;
