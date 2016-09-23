"use strict";
let MeasureSource = require("../measure_source.js");
let Future = require('fibers/future');

module.exports = class MongoMeasureSource extends MeasureSource {
  constructor(db) {
    super();
    this.database = db;
    this.measure_defintions = {}
    this.load();
    this.loadUtils();
  }

  load() {
    this.database.collection("measures").find({}, (err, res) => {
      if (err) {
        throw err;
      }
      if (res) {
        res.forEach((mes) => {
          var sub_id = mes.sub_id;
          var hqmf_id = sub_id ? `${mes.hqmf_id}_${sub_id}` : mes.hqmf_id;
          var cms_id = sub_id ? `${mes.cms_id}_${sub_id}` : mes.cms_id;
          this.measure_defintions[hqmf_id] = mes;
          this.measure_defintions[cms_id] = mes;

        })
      }

    });
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
      if (code) {
        // remove function wrapper
        var r = /^(function\s*\(\)\s*\{)/.exec(code)
        code = code.slice(r[0].length - 1)
        code = code.slice(0, code.length)
        eval.call(global, code);
      }
    });
  }


  getMeasureDef(measure_id, sub_id) {

    // might be a CMS###v#sub_id format so lets try that to
    var id = this.getMeasureAndSubId(measure_id, sub_id)

    var search_id = id.sub_id ? `${id.id}_${id.sub_id}` : id.id
    return this.measure_defintions[search_id];
  }


}
