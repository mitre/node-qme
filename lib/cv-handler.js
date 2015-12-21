"use strict";

class MedianAggregator {
  constructor(){
    this.values = [];
  }

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

class AverageAggregator {
  constructor(){
    this.average = 0;
    this.sum= 0;
    this.count=0;
  }

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

module.exports = class CVHandler extends ProportionHandler {
  

  constructor(method){
    super(["IPP","MSRPOPL","MSRPOPLEX"]);
    this.method = method;

  }

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