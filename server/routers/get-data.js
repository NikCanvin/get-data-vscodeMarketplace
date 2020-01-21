const express = require('express');
var request = require('request');
const timestamp = require('time-stamp');
const htmlparser2 = require("htmlparser2");
var metrics = {};

const parser = new htmlparser2.Parser(
  {
      onopentag(name, attribs) {
          if (name === "script" && attribs.type === "application/json") {
          }
      },
      ontext(text) {
          if (text.includes("statistics")) {
              //console.log("-->", text);
              const obj = JSON.parse(text);
              // console.log("Vscode Marketplace metrics:")
              // console.log(timestamp.utc('YYYY/MM/DD:HH:mm:ss'));
              // console.log(obj.statistics);
              metrics.campaign = "Codewind";
              metrics.getDataType = "VSCodePluginMarketplaceMetrics"
              metrics.dataCreatedTimestamp = timestamp.utc('YYYY/MM/DD:HH:mm:ss');
              metrics.metrics = obj.statistics;
          }
      },
      onclosetag(tagname) {
          if (tagname === "script") {
          }
      }
  },
  { decodeEntities: true }
);

module.exports = function (app) {
  const router = express.Router();

  router.get('/', function (req, res, next) {

    request({

      uri: "https://marketplace.visualstudio.com/items?itemName=IBM.codewind",
  
    }, function(error,response,body){
    
        //console.log("hi");
        parser.write(
            body, metrics
        );
        parser.end();
    
        res.status(200).json(metrics);
    
    });

  });

  app.use('/get-data', router);
}