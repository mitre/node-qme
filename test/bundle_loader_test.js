"use strict";

let assert = require('assert');
let Bundle = require('../lib/bundle.js')
let MongoBundleLoader = require("../lib/mongo/bundle_loader.js")
let bundle_path = "test/fixtures/bundle.zip"

let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let fs = require('fs');
let async = require('async');

let database = null;

describe('BundleLoader', () => {
  before((done) => {
    MongoClient.connect('mongodb://127.0.0.1:27017/fhir-test', function(err, db) {
      database = db;
      async.parallel([
      (callback) => {db.collection('measures').drop( () => {callback(null);});},
      (callback) => {db.collection('health_data_standards_svs_value_sets').drop( () => {callback(null);});},
    ], (err) => {done(err);});
    })

  });

  after(() => {

  });

  it('loads a bundle into mongodb ', (done) => {
    var bundle = new Bundle(bundle_path);
    var loader = new MongoBundleLoader(database,bundle);
    loader.loadBundle();
    done();
  });


});
