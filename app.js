require('dotenv').config();
const http = require("http");
const fs = require("fs");
const requests = require("requests");

const indexFile = fs.readFileSync("index.html", "utf-8");

const replaceVal = (tempVal, orgVal) => {
  if (!orgVal.main || !orgVal.sys || !orgVal.weather || orgVal.weather.length === 0) {
    console.error("Invalid data structure:", orgVal);
    return tempVal; // Return the original template if data is invalid
  }

  let temperature = tempVal.replace("{%tempval%}", orgVal.main.temp);
  temperature = temperature.replace("{%tempmin%}", orgVal.main.temp_min);
  temperature = temperature.replace("{%tempmax%}", orgVal.main.temp_max);
  temperature = temperature.replace("{%location%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);
  return temperature;
};

const server = http.createServer((req, res) => {
  if (req.url == "/") {
    requests(
`https://api.openweathermap.org/data/2.5/weather?q=Gwalior&appid=25186c1448bb1cf5df6cbe02e1c76b13`)
      .on("data", (chunk) => {
        try {
          const objdata = JSON.parse(chunk);
          console.log("API Response:", objdata); // Log the response for debugging

          const arrData = [objdata];
          const realTimeData = arrData
          .map((val) => replaceVal(indexFile, val)).join("");
          res.write(realTimeData);
        // console.log(realTimeData)
        } catch (error) {
          console.error("Error parsing JSON:", error);
          res.end("Error parsing data");
        }
      })
      .on("end", (err) => {
        if (err) {
          console.log("Connection closed due to errors", err);
          res.end("Error fetching data");
        } else {
          res.end();
        }
      });
  } else {
    res.end("File not found");
  }
});

server.listen(8000, "127.0.0.1");
