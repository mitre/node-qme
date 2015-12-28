"use strict";
let fs = require("fs")
let assert = require('assert');
let Bundle = require('../lib/bundle.js')
let bundle = null;
let bundle_path = "test/fixtures/bundle.zip"
let Loader = require('../lib/loader.js')
let Executor = require('../lib/executor.js')

global.print = function(data){};

class PatientSource {
  constructor(patients){
    this.patients = patients;
    this.index = 0;
    this.reset_called = false;
  }
  reset(){
    this.index = 0;
    this.reset_called = true;
  }
  next(){
    var p = null;
    if(this.patients.length-1 <= this.index){
      var p = this.patients[this.index];
      this.index++;
    }
    return p;
  }
}


class Handler{
  constructor(){
    this.results = [];
    this.start_called = false;
    this.finished_called = false;
  }

  start(){
    this.results=[];
    this.start_called = true;
  }

  handleResult(result){
    this.results.push(result);
  }

  finished(){
    this.finished_called = true;
  }

}

describe('Executor', () => {
  before((done) => {
    bundle = new Bundle(bundle_path);
    done();

  });

  after(() => {
  });

  it('can execute measures on a patient source ', (done) => {
   
    var loader = new Loader(bundle);
    var cqms = loader.load();
    var executor = new Executor(cqms);
    
    var psource = new PatientSource([new hQuery.Patient({})]);
    var handler = new Handler();
    var options = {effective_date: 0 , enable_logging: false, enable_rationale: false, short_circuit: false};
    executor.execute(psource,bundle.measure_ids(), handler, options);
    assert(handler.start_called, "handler start should have been called");
    assert(handler.finished_called, "handler finished should have been called");
    assert.equal(handler.results.length,bundle.measure_ids().length, "handler should have the same number of results as measures");
    done();

  });

});