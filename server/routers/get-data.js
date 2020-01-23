const express = require('express');
var request = require('request');
const timestamp = require('time-stamp');
var htmlparser2 = require("htmlparser2");
var metrics = {};

module.exports = function (app) {
  const router = express.Router();

  // const parser = new htmlparser2.Parser(
  //   {
  //       onopentag(name, attribs) {
  //           if (name === "script" && attribs.type === "application/json") {
  //           }
  //       },
  //       ontext(text) {
  //           if (text.includes("statistics")) {
  //               const obj = JSON.parse(text);
  //               metrics.campaign = "Codewind";
  //               metrics.getDataType = "VSCodePluginMarketplaceMetrics"
  //               metrics.dataCreatedTimestamp = timestamp.utc('YYYY/MM/DD:HH:mm:ss');
  //               metrics.metrics = obj.statistics;
  //               // loop through obj.statistics and push
  //               for (i = 0; i < obj.statistics.length; i++) {
  
  //                 //console.log(obj.statistics[i]);
  //                 var statValue = obj.statistics[i].value
  //                 //var statValueString = statValue.toString();
  //                 var statName = obj.statistics[i].statisticName
  //                 //var stat = { statName: statName, statValue: statValue }
  //                 console.log(statName+" "+statValue);
  //                 //metrics.metrics[i] = statValue;
  //                 if ( i == 0 ) {
  //                   //metrics.install = statValue;
  //                 } else if ( i == 1 ) {
  //                   //metrics.averagerating = statValue;
  //                 }
  //               }
                
  //           }
  //       },
  //       onclosetag(tagname) {
  //           if (tagname === "script") {
  //           }
  //       }
  //   },
  //   { decodeEntities: true }
  // );

  router.get('/', function (req, res, next) {

    request({

      uri: "https://marketplace.visualstudio.com/items?itemName=IBM.codewind",
  
    }, function(error,response,body){
    
        //parser.write(
        //    body, metrics
        //);
        //parser.end();

        var bodyArray = body.split(/\r?\n/);
        var foundMetrics="no";
        var gotData;
        var dataCreatedTimestamp = timestamp.utc('YYYY/MM/DD:HH:mm:ss');
        var jsonOutput = { campaign: "Codewind", getDataType: "VSCodePluginMarketplaceMetrics" };
        jsonOutput.dataCreatedTimestamp = timestamp.utc('YYYY/MM/DD:HH:mm:ss');
        jsonOutput.metrics={};
        dataInstance=0;
        for (i = 0; i < bodyArray.length; i++) { // find start of metrics data table in the html
            if ( bodyArray[i].includes("statisticName")) {
                //console.log(bodyArray[i]);
                var splitBody = bodyArray[i].split("statistics");
                var splitBody = splitBody[1].split(":");
                for (j = 0; j < splitBody.length; j++) {
                  if ( splitBody[j].includes("}")) {
                    var splitValue = splitBody[j].split("}")
                    valueAsInteger = parseFloat(splitValue[0]);
                    if ( splitValue[0] != "\"\"" && splitValue[0] != 0 ) {
                      //var keyValuePair = { [splitKey[1]]: +splitValue[0] }
                      console.log(splitKey[1]+": "+splitValue[0]);
                      if ( splitKey[1] == "install" ) {
                        jsonOutput.metrics.install = valueAsInteger;
                      } else if ( splitKey[1] == "averagerating" ) {
                        jsonOutput.metrics.averagerating = valueAsInteger;
                      } else if ( splitKey[1] == "ratingcount" ) {
                        jsonOutput.metrics.ratingcount = valueAsInteger;
                      } else if ( splitKey[1] == "trendingmonthly" ) {
                        jsonOutput.metrics.trendingmonthly = valueAsInteger;
                      } else if ( splitKey[1] == "trendingweekly" ) {
                        jsonOutput.metrics.trendingweekly = valueAsInteger;
                      } else if ( splitKey[1] == "updateCount" ) {
                        jsonOutput.metrics.updateCount = valueAsInteger;
                      } else if ( splitKey[1] == "weightedRating" ) {
                        jsonOutput.metrics.weightedRating = valueAsInteger;
                    }
                      //jsonOutput.metrics.dataInstance = keyValuePair
                    }
                  } else {
                    var splitBodyStr = splitBody[j].replace(/\"/g,"--");
                    splitKey = splitBodyStr.split("--");
                  }
                }
            }
            // if ( foundMetrics=="yes" ) {
            //     if ( bodyArray[i].includes("</table>") ) {
            //         foundMetrics="no";
            //     } else {
            //         if ( bodyArray[i].includes("thead") || bodyArray[i].includes("tbody")) { //ignore table header and body rows
            //         } else {
            //             // split string on <td>
            //             gotData += bodyArray[i]+",";
            //             
            //             var month = splitBody[1].substring(0,splitBody[1].length-5);
            //             var rankingData = splitBody[2].substring(0,splitBody[2].length-5);
            //             var rankingDataPart = rankingData.split("/");
            //             var rankingCurrentValue = rankingDataPart[0];
            //             var rankingOfTotalPlugins = rankingDataPart[1];
            //             var installsData = splitBody[3].substring(0,splitBody[3].length-5);
            //             var installsDataPart = installsData.split(" ");
            //             var installsCurrentValue = installsDataPart[0];
            //             var percentageOfAllInstalls = installsDataPart[1].substring(1,installsDataPart[1].length-2);
            //             var clickThroughs = splitBody[4].substring(0,splitBody[4].length-11);
            //             var monthValue = monthNumber.toString();
            //             var monthlyMetrics = { month: month, rankingCurrentValue: rankingCurrentValue, rankingOfTotalPlugins: rankingOfTotalPlugins, installsCurrentValue: installsCurrentValue, percentageOfAllInstalls: percentageOfAllInstalls, clickThroughs: clickThroughs };
            //             jsonOutput.metrics[monthNumber] = monthlyMetrics;
            //             //jsonOutput.month = month;
            //             var monthNumber = monthNumber+1;
            //         }
            //     }
            // }
        }


        //console.log(jsonOutput);
        res.json(jsonOutput);
    });

  });

  app.use('/get-data', router);
}