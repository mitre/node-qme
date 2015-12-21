"use strict";

let assert = require('assert');
let ProportionHandler = require("../lib/proportion-handler.js")
describe('ProportionHandler', () => {
  before(() => {

  });

  after(() => {
  });

  it("should be able to collect correct population values", (done) =>{
    var records = [{"IPP" : 1, "DENOM" : 1 , "NUMER": 1},
                   {"IPP" : 1, "DENOM" : 0 , "NUMER": 0},
                   {"IPP" : 0, "DENOM" : 0 , "NUMER": 0},
                   {"IPP" : 1, "DENOM" : 1 , "NUMER": 0},
                   {"IPP" : 2, "DENOM" : 2 , "NUMER": 1},
                   {"IPP" : 3, "DENOM" : 2 , "NUMER": 1},
                   ]
    var p = new ProportionHandler(["IPP","DENOM","NUMER"]);
    p.start();
    records.forEach(rec =>{
      p.handleRecord(rec);
    });
    p.finished();

    var values = p.results();
    assert.equal(8, values.IPP, "IPP should be 8");
    assert.equal(6, values.DENOM, "DENOM should be 6");
    assert.equal(3, values.NUMER, "NUMER should be 3");
    assert.equal(6, p.count, "Count should be 6");
    done();
  })
 });