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
              const obj = JSON.parse(text);
              metrics.campaign = "Codewind";
              metrics.getDataType = "VSCodePluginMarketplaceMetrics"
              metrics.dataCreatedTimestamp = timestamp.utc('YYYY/MM/DD:HH:mm:ss');
              //metrics.metrics = obj.statistics;
              // loop through obj.statistics and push
              for (i = 0; i < obj.statistics.length; i++) {

                //console.log(obj.statistics[i]);
                var statValue = obj.statistics[i].value
                //var statValueString = statValue.toString();
                var statName = obj.statistics[i].statisticName
                //var stat = { statName: statName, statValue: statValue }
                console.log(statName+" "+statValue);
                //metrics.metrics[i] = statValue;
                if ( i == 0 ) {
                  metrics.install = statValue;
                } else if ( i == 1 ) {
                  metrics.averagerating = statValue;
                }
              }
              
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
        //var niksJson = { nik: "yep", Andy: "nope" }
        //res.status(200).json(niksJson);
        res.status(200).json(metrics);
    });

  });

  app.use('/get-data', router);
}