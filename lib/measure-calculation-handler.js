"use strict";

let CVHandler = require("node-qme").CVHandler
let ProportionHandler = require("node-qme").ProportionHandler
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

  handleResult(result){
    this.handler.handleRecord(result);
  }

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
