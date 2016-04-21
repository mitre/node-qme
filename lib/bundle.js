"use strict";
var fs = require('fs');
var AdmZip = require('adm-zip')
var MeasureSource = require("./measure_source.js")
/* Class for parsing a bundle of measures in the cypress/popHealth format. This class inherits from */
module.exports = class Bundle extends MeasureSource {

  /*
    Creates a new bundle object from the bundle zip file.  This will load the measures defintions , vlauesets .... as well as load the
    library files into the global context 
    @params {string} path to the bundle zip file
  */
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

  /*
    Retrieve a measure defintion based on the measure_id and sub_id.
    @param {string} measure_id - this can be either the CMS or HQMF ids.  It can also take the form of the CMS id with the sub_id as a postfix
                                 such as CMS123v2a (CMS id is CMS123v2 with the sub_id a) , it could also take the form of HQMF_ID:sub_id
    @params {string} sub_id - a measures sub_id .  if the measure_id also contains the sub_id then this field will not be used
    @return {object}
  */
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

  /*
    @returns {array[string]} array of cms measure_ids , the ids contain the sub_id of the measure
  */
  measure_ids() {
    return Object.keys(this.measure_defs);
  }

  /*
    @returns {array[string]} array of the names of the javascript libraries included in the bundle
  */
  library_names() {
    return Object.keys(this.library_files).sort();
  }

  /*
    @returns [object] the contents of the bundle.json file found in the bundle
  */
  getMetaData(){
    return this.meta_data;
  }

  /*
  @returns [string] the javascript for the given library names
  */
  getLibrary(name) {
    return this.library_files[name];
  }

  getLibraries(){
    return [];
  }

  /*
    @returns [object] the valuesets contained in the bundle
    */
  getValuesets(){
    return this.valueSets;
  }

  /*
    loads all of the measure defintions, libraries, valuesets and meta data from the bundle
    */

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
  /*
    Loads the java script libraries contained in the bundle into the global context
    */
  loadUtils() {
    // need to load the util methods into global or else the measure wont see them
    eval.call(global, this.getLibrary('hqmf_utils'));
    eval.call(global, this.getLibrary('map_reduce_utils'));
  }


}
