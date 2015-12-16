"use strict";
class Loader {

  constructor(bundle){
    this.bundle = bundle;
    this.measures = {};
  }

  load(){
    this.loadUtils();
    this.loadMeasures();
    return this.measures;
  }

  loadUtils(){
    // need to load the util methods into global or else the measure wont see them 
    eval.call(global, this.bundle.getLibrary('hqmf_utils'));
    eval.call(global, this.bundle.getLibrary('map_reduce_utils'));
  }

  loadMeasures(){
    this.bundle.measure_ids().forEach(measure_id => {
      // need to scope the context that these are evaluated in to prevent 
      // clobbering other measures , used in eval below 
      let context = {} 
      var template = _.template(`"use strict"; class ${measure_id}  { generate(options){ var hqmfjs = {}; <%= logic %> return hqmfjs; } }`)  
      var measure = this.bundle.measures[measure_id];
      let logic_template = _.template(measure.map_fn);
      let binding  = {logic: logic_template({
                      effective_date: "options.effective_date;",
                      enable_logging: "options.enable_logging;",
                      enable_rationale: "options.enable_rationale;",
                      short_circuit: "options.short_circuit;"}),
                      name: measure_id
                      };
      var cl = eval.call(context, template(binding))
      this.measures[measure_id] = new cl();
    });

  }

}

module.exports.Loader = Loader