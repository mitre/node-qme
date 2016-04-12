"use strict";
let MeasureSource = require("../measure_source.js");
let Future = require('fibers/future');

module.exports = class MongoMeasureSource extends MeasureSource {
  constructor(db) {
    super();
    this.database = db;
  }

  loadUtils() {
    // lookup the utils from the db and load them in the global context;
    // will this work?
    var self = this;
    let future = new Future();
    var col = self.database.collection("system.js");
    col.find({}, future.resolver());

    var res = future.wait();
    res.forEach((func) => {
        var code = func.value.code;
        if(code){
        // remove function wrapper
        var r = /^(function\(.*\)\w*\{)/.exec(code)
        code = code.slice(r[0].length-1)
        code = code.slice(0,code.length)
        eval.call(global,code);

        }
      }
    );
    }


  getMeasureDef(measure_id, sub_id) {
    var col = this.database.collection("measures")
    let future = new Future();
    // might be a CMS###v#sub_id format so lets try that to
    var search_id = "hqmf_id";
    var res = /CMS\d*v\d*([a-z]*)?/.exec(measure_id);
    if(res){
      search_id = "cms_id";
      var strip = res[1] ? res[1].length : 0
      measure_id = measure_id.slice(0,measure_id.length - strip)
      if(sub_id == null && sub_id != res[1]){
        sub_id = res[1]
      }
    }
    var search_params = {}
    search_params[search_id] = measure_id;
    search_params["sub_id"] = sub_id
    col.findOne(search_params, {}, future.resolver());
    var def = future.wait();
    return def;
  }


}
