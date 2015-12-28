"use strict";
var fs = require('fs');
var AdmZip = require('adm-zip')
module.exports = class Bundle {

  constructor(bundle_path) {
    this.bundle_path = bundle_path;
    this.measures = {};
    this.meta_data = {};
    this.library_files = {};
    this.load();

  }

  measure_ids(){
    return Object.keys(this.measures);
  }

  library_names(){
    return Object.keys(this.library_files).sort();
  }

  getLibrary(name){
    return this.library_files[name];
  }

  load(){
    let zip = new AdmZip(this.bundle_path);
    let zipEntries = zip.getEntries();

    zipEntries.forEach(zipEntry => {
      let measure_match = /^\/?measures\/.*\/(.*)\.json/.exec(zipEntry.entryName)
      let library_match = /^\/?library_functions\/(.*)\.js/.exec(zipEntry.entryName)
      let bundle_match = /^\/?bundle.json/.exec(zipEntry.entryName)

      if (measure_match && measure_match.length == 2) {
        let measure = JSON.parse(zip.readAsText(zipEntry.entryName));
        this.measures[measure_match[1]] = measure ;
      }else if(library_match && library_match.length == 2){
        this.library_files[library_match[1]] = zip.readAsText(zipEntry.entryName);
      }else if(bundle_match){
        this.meta_data = JSON.parse(zip.readAsText(zipEntry.entryName));
      }

    });
  }
}
