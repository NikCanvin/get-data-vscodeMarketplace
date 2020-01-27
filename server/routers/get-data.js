const express = require('express');
var request = require('request');
const timestamp = require('time-stamp');
var htmlparser2 = require("htmlparser2");
var metrics = {};
var responseData = "";

module.exports = function (app) {
  const router = express.Router();

  router.get('/', function (req, res, next) {

    request({

      uri: "https://marketplace.visualstudio.com/items?itemName=IBM.codewind",
  
    }, function(error,response,body){
    

        var bodyArray = body.split(/\r?\n/);
        //var dataCreatedTimestamp = timestamp.utc('YYYY/MM/DD:HH:mm:ss');
        var jsonOutput = { campaign: "Codewind", getDataType: "VSCodePluginMarketplaceMetrics", dataSource: "https://marketplace.visualstudio.com/items?itemName=IBM.codewind" };

        jsonOutput.dataCreatedTimestamp = timestamp.utc('YYYY/MM/DD:HH:mm:ss');
        jsonOutput.metrics={};
        dataInstance=0;
        for (i = 0; i < bodyArray.length; i++) { // find start of metrics data table in the html
          if ( bodyArray[i].includes("statisticName")) {
                console.log(bodyArray[i]);
                responseData = bodyArray[i];
                //responseData = "hi";
                var splitBody = bodyArray[i].split("statistics");
                splitBody = splitBody[1].split(":");
                for (j = 0; j < splitBody.length; j++) {
                  if ( splitBody[j].includes("}")) {
                    var splitValue = splitBody[j].split("}")
                    valueAsInteger = parseFloat(splitValue[0]);
                    if ( splitValue[0] != "\"\"" && splitValue[0] != 0 ) {
                      //var keyValuePair = { [splitKey[1]]: +splitValue[0] }
                      console.log(splitKey[1]+": "+splitValue[0]);
                      if ( splitKey[1] == "install" ) {
                        jsonOutput.metrics.installs = valueAsInteger;
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
            } else if ( bodyArray[i].includes("installs</span>")) {
              var splitBody = bodyArray[i].split("not including updates.");
              splitBody = splitBody[1].split(" ");
              //for (j = 0; j < splitBody.length; j++) {
                splitBody[1] = splitBody[1].replace(/,/g, "");
                var installAsInteger = parseInt(splitBody[1]);
                jsonOutput.metrics.installs = installAsInteger;
              //}
              //splitBody = splitBody[7].split(" ");
              //for (j = 0; j < splitBody.length; j++) {
                var averageratingAsFloat = parseFloat(splitBody[8]);
                jsonOutput.metrics.averagerating = averageratingAsFloat;

            }

        }


        var id = timestamp.utc('YYYY/MM/DD:HH:mm:ss');
        id = id.replace(/:/g, "");
        id = id.replace(/\//g, "");
        request({
          uri: "http://datastore-default.apps.riffled.os.fyre.ibm.com/advocacy/VSCodePluginMarketplaceMetrics"+id,
          method: "PUT",
          headers: {
              'Content-type': 'application/json'
          },
          body: jsonOutput,
          json: true
        }, (error, response, body) => {
          console.log(error)
        })


        res.json(jsonOutput);
    });

  });

  app.use('/get-data', router);
}