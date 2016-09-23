"use strict";
let fs = require("fs")
let assert = require('assert');
let Bundle = require('../lib/bundle.js')
let bundle = null;
let bundle_path = "test/fixtures/bundle.zip"


global.print = function(data){};

describe('Loader', () => {
  before((done) => {
    bundle = new Bundle(bundle_path);
    done();

  });

  after(() => {
  });


  it('can load a measure bundle', (done) => {

    bundle.measure_ids().forEach(measure_id => {
      assert(bundle.getMeasure(measure_id), `${measure_id} measure should have been generated `);
      assert(bundle.getMeasure(measure_id).generate, `${measure_id} measure should have generate function`);
    });

    assert(root, "should have root defined at global level")
    assert(root.map, "root should have map function")
    assert(_, "should define _ ")
    assert(_.wrap, "_ should be underscore library")
    done();

  });


  it('contains executable measures ', (done) => {


    var patient = new hQuery.Patient({});
    bundle.measure_ids().forEach(measure_id => {
      var g = bundle.getMeasure(measure_id).generate({effective_date: 0 , enable_logging: false, enable_rationale: false, short_circuit: false});
      var result = g.calculate(patient, 0, null);
      assert(result, "calcualte method should return a result");
      assert(result.hasOwnProperty("IPP"), "result should have an IPP");
      assert(result.hasOwnProperty("effective_date") , "result should have effective_date");
     })

    done();

  });

});
