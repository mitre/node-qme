"use strict";
module.exports = class ProportionHandler {

  constructor(populations){
    this.populations = populations;
    this.start();
  }

  start(){
    this.populationCounts = {}
    this.populations.forEach(pop =>{
      this.populationCounts[pop] = 0;
    })
    
    this.count = 0;
  }



  handleRecord(record){
    this.populations.forEach(pop =>{
      var value = record[pop]
      value = value ? value : 0
      this.populationCounts[pop] += value
    });
    this.count++;
  }

  finished(){

  }

  results(){
    return this.populationCounts;
  }
}
