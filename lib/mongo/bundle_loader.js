"use strict";
let mongo = require("mongodb")
module.exports = class BundleLoader {

  constructor(database, bundle){
    this.database = database;
    this.bundle = bundle;
  }

  loadMetaData(){
    var col = this.database.collection("bundles");
    var metaData = this.bundle.getMetaData();
    col.update({version: metaData.version}, metaData, {upsert: true})
  }

  loadMeasures(){
    var col = this.database.collection("measures");
    this.bundle.measure_ids().forEach((id)=> {
        var mes = this.bundle.getMeasureDef(id);
        mes["_id"] = id;
        col.insert(mes);
    });
  }

  loadUtils(){
    var col = this.database.collection("system.js");
    this.bundle.library_names().forEach((name)=> {
        var inner_code = this.bundle.getLibrary(name);
        var func = `function(){ ${inner_code}}`;
        col.update(  {"_id" :name}, {"_id" :name,  "value" : new mongo.Code(func)},{upsert: true})
    });
  }


  loadValuesets(){
    var col = this.database.collection("health_data_standards_svs_value_sets");
    this.bundle.getValuesets().forEach((vs)=> {
        col.update({oid: vs.oid}, vs, {upsert: true});
    });
  }

  loadBundle(){
    this.loadUtils();
    this.loadMetaData();
    this.loadMeasures();

  }
}
