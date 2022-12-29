[Expectancy Strategy Performance](https://nickforneris.github.io/expectancy-strategy/)

fetch("https://app.optionalpha.com/api/request", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  },
  "referrer": "https://app.optionalpha.com/bots/bot/BOTdJANovrzd4116718191611369765/positions?closed=true",
  "referrerPolicy": "same-origin",
  "body": "[{\"t\":\"rpc\",\"tid\":\"1672337133916-10002\",\"api\":\"pos.forBot\",\"args\":[{\"iid\":\"BOTdJANovrzd4116718191611369765\"}]},{\"t\":\"rpc\",\"tid\":\"1672337133916-10003\",\"api\":\"pos.closed\",\"args\":[{\"where\":{\"iid\":\"BOTdJANovrzd4116718191611369765\"},\"start\":0,\"limit\":5000,\"order\":[\"closeDate\",\"desc\"]}]},{\"t\":\"rpc\",\"tid\":\"1672337133916-10002\",\"api\":\"pos.forBot\",\"args\":[{\"iid\":\"BOTdJANovrzd4116718191703991406\"}]},{\"t\":\"rpc\",\"tid\":\"1672337133916-10003\",\"api\":\"pos.closed\",\"args\":[{\"where\":{\"iid\":\"BOTdJANovrzd4116718191703991406\"},\"start\":0,\"limit\":5000,\"order\":[\"closeDate\",\"desc\"]}]},{\"t\":\"rpc\",\"tid\":\"1672337133916-10002\",\"api\":\"pos.forBot\",\"args\":[{\"iid\":\"BOTdJANovrzd42167151953183069929\"}]},{\"t\":\"rpc\",\"tid\":\"1672337133916-10003\",\"api\":\"pos.closed\",\"args\":[{\"where\":{\"iid\":\"BOTdJANovrzd42167151953183069929\"},\"start\":0,\"limit\":5000,\"order\":[\"closeDate\",\"desc\"]}]},{\"t\":\"rpc\",\"tid\":\"1672337133916-10002\",\"api\":\"pos.forBot\",\"args\":[{\"iid\":\"BOTdJANovrzd42167151952209125928\"}]},{\"t\":\"rpc\",\"tid\":\"1672337133916-10003\",\"api\":\"pos.closed\",\"args\":[{\"where\":{\"iid\":\"BOTdJANovrzd42167151952209125928\"},\"start\":0,\"limit\":5000,\"order\":[\"closeDate\",\"desc\"]}]}]",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
}).then((response) => response.json())
  .then((data) => console.log(...data[4].data,...data[5].data,...data[6].data,...data[7].data));
