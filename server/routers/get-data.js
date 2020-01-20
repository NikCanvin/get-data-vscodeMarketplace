const express = require('express');
var request = require('request');
const timestamp = require('time-stamp');

module.exports = function (app) {
  const router = express.Router();

  router.get('/', function (req, res, next) {

    request({

       uri: "https://marketplace.eclipse.org/content/codewind#group-metrics-tab",

    }, function(error,response,body){

        var bodyArray = body.split(/\r?\n/);
        var foundMetrics="no";
        var gotData;
        var dataCreatedTimestamp = timestamp.utc('YYYY/MM/DD:HH:mm:ss');
        //gotData = "Eclipse Marketplace metrics: "+timestamp.utc('YYYY/MM/DD:HH:mm:ss');
        var jsonOutput = { campaign: "Codewind", getDataType: "EclispePluginMarketplaceMetrics" };
        jsonOutput.dataCreatedTimestamp = timestamp.utc('YYYY/MM/DD:HH:mm:ss');
        jsonOutput.metrics={};
        monthNumber=0;
        for (i = 0; i < bodyArray.length; i++) { // find start of metrics data table in the html
            if ( bodyArray[i].includes("<thead><tr><th>Date</th><th>Ranking</th><th>Installs</th><th>Clickthroughs</th> </tr></thead>")) {
                foundMetrics="yes";
                //console.log("line"+i+" "+bodyArray[i]);
            }
            if ( foundMetrics=="yes" ) {
                if ( bodyArray[i].includes("</table>") ) {
                    foundMetrics="no";
                } else {
                    if ( bodyArray[i].includes("thead") || bodyArray[i].includes("tbody")) { //ignore table header and body rows
                    } else {
                        // split string on <td>
                        gotData += bodyArray[i]+",";
                        var splitBody = bodyArray[i].split("<td>");
                        var month = splitBody[1].substring(0,splitBody[1].length-5);
                        var rankingData = splitBody[2].substring(0,splitBody[2].length-5);
                        var rankingDataPart = rankingData.split("/");
                        var rankingCurrentValue = rankingDataPart[0];
                        var rankingOfTotalPlugins = rankingDataPart[1];
                        //var rankingDataObject = { rankingCurrentValue: rankingCurrentValue, rankingOfTotalPlugins: rankingOfTotalPlugins };
                        var installsData = splitBody[3].substring(0,splitBody[3].length-5);
                        var installsDataPart = installsData.split(" ");
                        var installsCurrentValue = installsDataPart[0];
                        var percentageOfAllInstalls = installsDataPart[1].substring(1,installsDataPart[1].length-2);
                        //var installsDataObject = { installsCurrentValue: installsCurrentValue, percentageOfAllInstalls: percentageOfAllInstalls}
                        var clickThroughs = splitBody[4].substring(0,splitBody[4].length-11);
                        var monthValue = monthNumber.toString();
                        var monthlyMetrics = { month: month, rankingCurrentValue: rankingCurrentValue, rankingOfTotalPlugins: rankingOfTotalPlugins, installsCurrentValue: installsCurrentValue, percentageOfAllInstalls: percentageOfAllInstalls, clickThroughs: clickThroughs };
                        console.log(monthlyMetrics);
                        jsonOutput.metrics[monthNumber] = monthlyMetrics;
                        //jsonOutput.month = month;
                        var monthNumber = monthNumber+1;
                    }
                }
            }
        }
        res.json(jsonOutput);
        //res.status(200).send(gotData);
        }
    );

    });

  app.use('/get-data', router);
}