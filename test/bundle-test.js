"use strict";

let assert = require('assert');
let Bundle = require('../lib/bundle.js')
let bundle_path = "test/fixtures/bundle.zip"

describe('Bundle', () => {
  before((done) => {
    done();
  });

  after(() => {

  });

  it('loads a bundle', (done) => {
    var b = new Bundle(bundle_path);
    assert.deepEqual(['hqmf_utils','map_reduce_utils'],b.library_names());
    assert.notEqual(null,b.meta_data);
    assert.deepEqual(['CMS137v4a','CMS137v4b','CMS137v4c','CMS137v4d','CMS137v4e','CMS137v4f','CMS147v4',
                      'CMS156v4a','CMS156v4b','CMS158v3','CMS161v3','CMS166v4',
                      'CMS182v5a','CMS182v5b','CMSv0'],b.measure_ids());
    done();
  });


});