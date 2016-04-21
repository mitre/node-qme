"use strict";

let CVHandler = require("./cv-handler").CVHandler
let ProportionHandler = require("proportion-handler").ProportionHandler
/* Handler class that will accept patient level results and pass them off to an appropriate handler for aggregate calculation.  This will be either a
ProportionHandler or a CVHandler depending on whether or not the measure is continuous_variable or not
*/
module.exports = class MeasureCalculationHandler{

  constructor(measure, metaData){
    this.metaData = metaData || {};
    this.measure=measure;
    this.handler =   measure.continuous_variable ? new CVHandler(measure.aggregator) :
                                    new ProportionHandler(Object.keys(measure.population_ids));
  }

  start(){
    this.handler.start();
  }
  /* simple bypass to the aggregation handler created for the given measure
  */
  handleResult(result){
    this.handler.handleRecord(result);
  }

  /* Calculation is finished. Perfrom post processing and return an object taht represents the aggregation values for populations and observations as applicable*/
  finished(){
    this.handler.finished();
    this.results = {};
    this.results['cms_id'] = this.measure.cms_id;
    this.results['nqf_id'] = this.measure.nqf_id;
    this.results['hqmf_id'] = this.measure.hqmf_id;
    this.results['sub_id'] = this.measure.sub_id;
    this.results['population_ids'] = this.measure.population_ids;
    Object.keys(this.handler.populationCounts).forEach(prop =>{
      this.results[prop] = this.handler.populationCounts[prop];
    });
    Object.keys(this.metaData).forEach(prop =>{
      this.results[prop] = this.metaData[prop];
    });
    return this.results;
  }

}
