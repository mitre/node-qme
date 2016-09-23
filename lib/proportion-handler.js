"use strict";
/* Patient level results handler that will tally results for populations based on the patient level results.  Populations are determined based on the populations
that are passed into the handler to collect.

*/
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


  /* add to the results for each of the populations based on the  values contained in the patient results object
  */
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
