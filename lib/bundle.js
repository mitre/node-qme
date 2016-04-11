"use strict";
var fs = require('fs');
var AdmZip = require('adm-zip')
module.exports = class Bundle {

  constructor(bundle_path) {
    this.bundle_path = bundle_path;
    this.measure_defs = {};
    this.generated_measures = {};
    this.meta_data = {};
    this.library_files = {};
    this.loadDefinitions();

  }

  getMeasureDef(measure_id){
    return this.measure_defs[measure_id];
  }

  measure_ids() {
    return Object.keys(this.measure_defs);
  }

  library_names() {
    return Object.keys(this.library_files).sort();
  }

  getLibrary(name) {
    return this.library_files[name];
  }

  loadDefinitions() {
    let zip = new AdmZip(this.bundle_path);
    let zipEntries = zip.getEntries();

    zipEntries.forEach(zipEntry => {
      let measure_match = /^\/?measures\/.*\/(.*)\.json/.exec(zipEntry.entryName)
      let library_match = /^\/?library_functions\/(.*)\.js/.exec(zipEntry.entryName)
      let bundle_match = /^\/?bundle.json/.exec(zipEntry.entryName)

      if (measure_match && measure_match.length == 2) {
        let measure = JSON.parse(zip.readAsText(zipEntry.entryName));
        this.measure_defs[measure_match[1]] = measure;
      } else if (library_match && library_match.length == 2) {
        this.library_files[library_match[1]] = zip.readAsText(zipEntry.entryName);
      } else if (bundle_match) {
        this.meta_data = JSON.parse(zip.readAsText(zipEntry.entryName));
      }

    });
  }

  loadUtils() {
    // need to load the util methods into global or else the measure wont see them
    eval.call(global, this.getLibrary('hqmf_utils'));
    eval.call(global, this.getLibrary('map_reduce_utils'));
  }

  getMeasure(measure_id) {
    //short curcuit if we can
    if (this.generated_measures[measure_id]) {
      return this.generated_measures[measure_id];
    } else if (!this.measure_defs[measure_id]) {
      return;
    }
    // need to scope the context that these are evaluated in to prevent
    // clobbering other measures , used in eval below
    let context = {}
    var measure = this.measure_defs[measure_id];

    var template = _.template(`"use strict";
                                  class ${measure_id} {
                                    constructor(){
                                      this.hqmf_id = "<%= hqmf_id %>";
                                      this.sub_id=<%= (sub_id) ? "'" + sub_id +"'": 'null' %>;
                                      this.cms_id=<%= (cms_id) ? "'" + cms_id +"'": 'null' %>;
                                      this.continuous_variable = <%= continuous_variable ? 'true' : 'false' %>;
                                      this.aggregator = <%= aggregator ? "'" + aggregator + "'" : 'null' %>;
                                      this.population_ids = <%= JSON.stringify(population_ids) %>;
                                      this.measure = <%= JSON.stringify(measure) %>
                                    }
                                    generate(options){
                                      var hqmfjs = {};
                                      <%= logic %>
                                      return hqmfjs;
                                    }
                                  }`)

    let logic_template = _.template(measure.map_fn);
    let binding = {
      logic: logic_template({
        effective_date: "options.effective_date;",
        enable_logging: "options.enable_logging;",
        enable_rationale: "options.enable_rationale;",
        short_circuit: "options.short_circuit;"
      }),
      name: measure_id,
      hqmf_id: measure.hqmf_id,
      sub_id: measure.sub_id,
      continuous_variable: measure.continuous_variable,
      aggregator: measure.aggregator,
      population_ids: measure.population_ids,
      cms_id: measure.cms_id,
      measure: measure
    };
    var cl = eval.call(context, template(binding))
    this.generated_measures[measure_id] = new cl();
    return this.generated_measures[measure_id];
  }
}
