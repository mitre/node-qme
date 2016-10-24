"use strict";
let fs = require("fs")
let assert = require('assert');
let BundleLoader = require('../lib/mongo/bundle_loader.js')
let MeasureSource = require('../lib/mongo/measure_source.js')
let Fiber = require('fibers');
let bundle_path = "test/fixtures/bundle.zip";
let Bundle = require('../lib/bundle.js');
let MongoBundleLoader = require("../lib/mongo/bundle_loader.js");

let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;

let async = require('async');
let measureSource = null;
let database = null;

global.print = function(data){};

describe('Mongo Source', () => {
  before((done) => {
    MongoClient.connect('mongodb://127.0.0.1:27017/fhir-test', function(err, db) {
      database = db;
      var bundle = new Bundle(bundle_path);
      var loader = new MongoBundleLoader(database,bundle);
      loader.loadBundle();
      measureSource = new MeasureSource(database);
      done(err);
    });
  });

  after(() => {
  });

  it('can load utility functions form  database ', (done) => {
    new Fiber(() => {
      measureSource.loadUtils();
        assert(root, "should have root defined at global level");
        assert(root.map, "root should have map function");
        assert(_, "should define _ ");
        assert(_.wrap, "_ should be underscore library");
        done();
      }).run();
  });

  it('can load and execute measure from mongo', (done) => {
    new Fiber(() => {
      var patient = new hQuery.Patient({});
      var mes = measureSource.getMeasure("CMS137v4", "a");
      var g = mes.generate({effective_date: 0 , enable_logging: false, enable_rationale: false, short_circuit: false});
      var result = g.calculate(patient, 0, null);
      assert(result, "calcualte method should return a result");
      assert(result.hasOwnProperty("IPP"), "result should have an IPP");
      assert(result.hasOwnProperty("effective_date") , "result should have effective_date");
      done();
    }).run();
  });
});
