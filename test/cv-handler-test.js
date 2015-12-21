"use strict";

let assert = require('assert');
let CVHandler = require("../lib/cv-handler.js")
describe('CVHandler', () => {
  before(() => {

  });

  after(() => {
  });

  it("should be able to collect correct population values and median", (done) =>{
    var records = [{"IPP" : 1, "MSRPOPL" : 1 , "values": [2]},
                   {"IPP" : 1, "MSRPOPL" : 0 , "values": []},
                   {"IPP" : 0, "MSRPOPL" : 0 , "values": []},
                   {"IPP" : 1, "MSRPOPL" : 1 , "values": [4]},
                   {"IPP" : 2, "MSRPOPL" : 2 , "values": [3,5]},
                   {"IPP" : 3, "MSRPOPL" : 2 , "values": [8,11]},
                   ]
    var p = new CVHandler("MEDIAN");
    p.start();
    records.forEach(rec =>{
      p.handleRecord(rec);
    });
    p.finished();

    var values = p.results();
    assert.equal(8, values.IPP, "IPP should be 8");
    assert.equal(6, values.MSRPOPL, "MSRPOPL should be 6");
    assert.equal(4.5, values.OBSERV, "OBSERV should be 4.5");
    assert.equal(6, p.count, "Count should be 6");
    done();
  });

  it("should be able to collect correct population values and average", (done) =>{
    var records = [{"IPP" : 1, "MSRPOPL" : 1 , "values": [2]},
                   {"IPP" : 1, "MSRPOPL" : 0 , "values": []},
                   {"IPP" : 0, "MSRPOPL" : 0 , "values": []},
                   {"IPP" : 1, "MSRPOPL" : 1 , "values": [4]},
                   {"IPP" : 2, "MSRPOPL" : 2 , "values": [3,5]},
                   {"IPP" : 3, "MSRPOPL" : 2 , "values": [8,11]},
                   ]
    var p = new CVHandler("AVERAGE");
    p.start();
    records.forEach(rec =>{
      p.handleRecord(rec);
    });
    p.finished();

    var values = p.results();

    assert.equal(8, values.IPP, "IPP should be 8");
    assert.equal(6, values.MSRPOPL, "MSRPOPL should be 6");
    assert.equal(5.5, values.OBSERV, "OBSERV should be 5.5");
    assert.equal(6, p.count, "Count should be 6");
    done();
  });


 });