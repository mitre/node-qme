"use strict";

/*
  Class that will perform median aggregations for CV measure observations
  */
class MedianAggregator {
  constructor(){
    this.values = [];
  }
  /*
    adds to the overall aggregatio. Each of the values is added to an array of values that
    can determin the aggregate value when finished
    */
  aggregateValues(values){
    values.forEach(v => {
      this.values.push(v);
    })

  }

  value(){
    this.values.sort((a,b) => {return a - b});
    if(this.values.length == 0) return 0;
      var even = this.values.length % 2;
      var half = Math.floor( this.values.length / 2) ;
    if(even == 0 ){
      return (this.values[half] + this.values[half-1]) / 2
    } else {
      return this.values[half];
    }
  }
}

/*
  Class that will perform average aggregation for cv measure observations
  */
class AverageAggregator {
  constructor(){
    this.average = 0;
    this.sum= 0;
    this.count=0;
  }
  /*
    adds to the overall aggregation.  Each of the values is added to a rolling sum total
    along with incrementing a count variable;
    */
  aggregateValues(values){
    this.count += values.length
    values.forEach(v => {
      this.sum += v;
    })
  }

  value(){
    return this.sum/this.count;
  }
}

let ProportionHandler = require('./proportion-handler.js');

/*
 Handler class that perfroms CV measure population calculations.

*/
module.exports = class CVHandler extends ProportionHandler {


  constructor(method){
    super(["IPP","MSRPOPL","MSRPOPLEX"]);
    this.method = method;

  }
  /*
  Creates either a median or average aggregation calculator for the measures observation value
  */
  createAggregator(){
    if(this.method == "MEDIAN"){
      this.aggregator = new MedianAggregator();
    }else{
      this.aggregator = new AverageAggregator();
    }
  }

  start(){
    super.start();
    this.createAggregator();
  }

  handleRecord(record){
    super.handleRecord(record);
    this.aggregator.aggregateValues(record.values);
  }

  finished(){
    super.finished();
    this.populationCounts["OBSERV"] = this.aggregator.value();
  }

}
