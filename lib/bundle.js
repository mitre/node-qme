"use strict";
var fs = require('fs');
var AdmZip = require('adm-zip')
var MeasureSource = require("./measure_source.js")
module.exports = class Bundle extends MeasureSource {

  constructor(bundle_path) {
    super();
    this.bundle_path = bundle_path;
    this.measure_defs = {};
    this.generated_measures = {};
    this.meta_data = {};
    this.library_files = {};
    this.valueSets = [];
    this.loadDefinitions();
    this.loadUtils();
  }

  getMeasureDef(measure_id, sub_id){


    var id = this.getMeasureAndSubId(measure_id, sub_id)
    var res = /CMS\d*v\d*([a-z]*)?/.exec(id.id);
    var search_id =  res ? "cms_id" : "hqmf_id";
    //console.log("measure_id " +measure_id + " sub_id " +  sub_id);
    //console.log(search_id);
    for(var k in this.measure_defs){
      var def = this.measure_defs[k];
    //  console.log(`search id ${search_id}  ${def[search_id]} ${measure_id}  ${def[search_id] == measure_id}`);
    //  console.log("sub id " + def["sub_id"] == sub_id);
      if(def[search_id] == id.id && def["sub_id"] == id.sub_id){
        return def
      }
    }
  }

  measure_ids() {
    return Object.keys(this.measure_defs);
  }

  library_names() {
    return Object.keys(this.library_files).sort();
  }

  getMetaData(){
    return this.meta_data;
  }

  getLibrary(name) {
    return this.library_files[name];
  }

  getLibraries(){
    return [];
  }
  getValuesets(){
    return this.valueSets;
  }

  loadDefinitions() {
    let zip = new AdmZip(this.bundle_path);
    let zipEntries = zip.getEntries();

    zipEntries.forEach(zipEntry => {
      let measure_match = /^\/?measures\/.*\/(.*)\.json/.exec(zipEntry.entryName)
      let library_match = /^\/?library_functions\/(.*)\.js/.exec(zipEntry.entryName)
      let bundle_match = /^\/?bundle.json/.exec(zipEntry.entryName)
      let valueset_match = /^\/?value_sets\/.*\/(.*)\.json/.exec(zipEntry.entryName)
      if (measure_match && measure_match.length == 2) {
        let measure = JSON.parse(zip.readAsText(zipEntry.entryName));
        this.measure_defs[measure_match[1]] = measure;
      } else if (library_match && library_match.length == 2) {
        this.library_files[library_match[1]] = zip.readAsText(zipEntry.entryName);
      } else if (bundle_match) {
        this.meta_data = JSON.parse(zip.readAsText(zipEntry.entryName));
      }else if (valueset_match){
        this.valueSets.push(JSON.parse(zip.readAsText(zipEntry.entryName)));
      }

    });
  }

  loadUtils() {
    // need to load the util methods into global or else the measure wont see them
    eval.call(global, this.getLibrary('hqmf_utils'));
    eval.call(global, this.getLibrary('map_reduce_utils'));
  }


}
