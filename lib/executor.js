"use strict" ;
module.exports =  class Executor {
  constructor(measure_source){
    this.measure_source = measure_source;
  }

  generate_measures(measure_ids,options){
    var measures = [];
    measure_ids = Array.isArray(measure_ids) ? measure_ids : [measure_ids]
    measure_ids.forEach(id => {
      var mes = this.measure_source.getMeasure(id)
      measures.push(mes.generate(options));
    });
    return measures;
  }


  execute(patientSource, measure_ids, handler, options){
    patientSource.reset();
    handler.start();
    var measures = this.generate_measures(measure_ids, options);
    var patient = null;
    while( patient = patientSource.next()){
      measures.forEach(mes => {
        var result = mes.calculate(patient, options.effective_date, options.correlation_id);
        handler.handleResult(result);
      })
    }
    handler.finished();
  }
}
