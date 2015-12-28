"use strict";
let fs = require("fs")
let assert = require('assert');
let Bundle = require('../lib/bundle.js')
let bundle = null;
let bundle_path = "test/fixtures/bundle.zip"
let Generator = require('../lib/generator.js')
let output_directory = "./tmp/generator"
global.print = function(data){console.log(data)}

var child = require('child_process');

var rmdir = function(directories, callback) {
    if(typeof directories === 'string') {
        directories = [directories];
    }
    var args = directories;
    args.unshift('-rf');
    child.execFile('rm', args, {env:process.env}, function(err, stdout, stderr) {
            callback.apply(this, arguments);
    });
};

describe('Generator', () => {
  before((done) => {
    bundle = new Bundle(bundle_path);
    rmdir(output_directory,done)

  });

  after(() => {
  });


  it('can generate full measure package', (done) => {
    assert(!fs.existsSync("tmp/generator"), "build directory should not currently exist");
    var g = new Generator(bundle);
    g.generate_package(output_directory);
    assert(fs.existsSync("tmp/generator/package.json"), "package.json should have been generated ");
    assert(fs.existsSync("tmp/generator/lib"), "build directory should create build directory");
    assert(fs.existsSync("tmp/generator/index.js"), "index.js should have been generated ");
    assert(fs.existsSync("tmp/generator/lib/load_utils.js"), "load_utils.js should have been generated ");
    assert(fs.existsSync("tmp/generator/lib/hqmf_utils.js"), "hqmf_utils.js should have been generated ");
    assert(fs.existsSync("tmp/generator/lib/map_reduce_utils.js"), "map_reduce_utils.js should have been generated ");
    
    bundle.measure_ids().forEach(measure_id => {

      assert(fs.existsSync(`tmp/generator/lib/${measure_id}.js`), `${measure_id}.js should have been generated `);
    });
    done();

  });

 it('contains executable measures ', (done) => {
   
    var g = new Generator(bundle);
    g.generate_package(output_directory);
    var cqms = require("../"+output_directory+"/index.js")
    var patient = new hQuery.Patient({});

    bundle.measure_ids().forEach(measure_id => { 
      var g = cqms[measure_id]({effective_date: 0 , enable_logging: false, enable_rationale: false, short_circuit: false});
      var result = g.calculate(patient, 0, null);
      assert(result, "calcualte method should return a result") 
      assert(result.hasOwnProperty("IPP"), "result should have an IPP");
      assert(result.hasOwnProperty("effective_date") , "result should have effective_date");
     })

    
    done();

  });
});