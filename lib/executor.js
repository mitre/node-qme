"use strict" ;
class Executor {
  constructor(cqms){
    this.cqms = cqms;
  }

  generate_measures(measure_ids,options){
    var measures = [];
    measure_ids = Array.isArray(measure_ids) ? measure_ids : [measure_ids] 
    measure_ids.forEach(id => {
      measures.push(this.cqms[id].generate(options));
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

module.exports.Executor = Executor