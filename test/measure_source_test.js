"use strict";
let fs = require("fs")
let assert = require('assert');
let MeasureSource = require('../lib/measure_source.js')
let source = null;

global.print = function(data){};

describe('MeasureSource', () => {
  before((done) => {
    source  = new MeasureSource();
    done();

  });

  after(() => {
  });


  it('can parse HQMF_ID:SUB_ID format', (done) => {
    var id = source.getMeasureAndSubId("4HQMF:a")
    assert.equal(id.id, "4HQMF")
    assert.equal(id.sub_id, "a")
    done();
  });

  it('can parse measure_id with non null sub_id format', (done) => {
    var id = source.getMeasureAndSubId("4HQMF",'a')
    assert.equal(id.id, "4HQMF")
    assert.equal(id.sub_id, 'a')
    done();
  });

  it('can parse CMS###v#SUB_ID format', (done) => {
    var id = source.getMeasureAndSubId("CMS137v4f")
    assert.equal(id.id, "CMS137v4")
    assert.equal(id.sub_id, 'f')
    done();
  });

  it('can parse CMS###v# format', (done) => {
    var id = source.getMeasureAndSubId("CMS137v4")
    assert.equal(id.id, "CMS137v4")
    assert.equal(id.sub_id, null)
    done();
  });

  it('can handle measure_id with null sub_id ', (done) => {
    var id = source.getMeasureAndSubId("4HQMF")
    assert.equal(id.id, "4HQMF")
    assert.equal(id.sub_id, null)
    done();
  });
});
