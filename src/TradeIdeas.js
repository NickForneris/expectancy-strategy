import React, { useState, useEffect } from "react";
import {
    Navbar,
    Container,
    Table,
    Col,
    Row,
    Button,
    ButtonGroup
  } from 'react-bootstrap';
  import './App.css';

const TradeIdeas = () => {
    const [data, setData] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc");
    const [sortColumn, setSortColumn] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(process.env.PUBLIC_URL + '/tradeideas/tradeideas.json')
            .then(res => res.json())
            .then(data => {
                setData(JSON.parse(data));
                setLoading(false);
                console.log(data)
            });
    }, []);


    const handleSort = column => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortOrder("asc");
            setSortColumn(column);
        }
    };


    const sortData = data.sort((a, b) => {
        if (sortOrder === "asc") {
            return a[sortColumn] > b[sortColumn] ? 1 : -1;
        } else {
            return a[sortColumn] < b[sortColumn] ? 1 : -1;
        }
    });

    return (
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort("symbol")}>Symbol</th>
                            <th onClick={() => handleSort("text")}>Strikes</th>
                            <th onClick={() => handleSort("days")}>DTE</th>
                            <th onClick={() => handleSort("mprofit")}>Max Profit</th>
                            <th onClick={() => handleSort("mloss")}>Max Loss</th>
                            <th onClick={() => handleSort("mpodds")}>Chance Max Profit</th>
                            <th onClick={() => handleSort("mlodds")}>Chance Max Loss</th>
                            <th onClick={() => handleSort("")}>Expectancy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.symbol}</td>
                                <td>{item.text}</td>
                                <td>{item.days}</td>
                                <td>{item.mprofit}</td>
                                <th>{item.mloss}</th>
                                <td>{item.mpodds}</td>
                                <td>{item.mlodds}</td>
                                <td>{(item.mprofit*item.mpodds)-(item.mloss*item.mlodds)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default TradeIdeas;
