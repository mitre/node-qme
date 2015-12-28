"use strict";
let fs = require("fs");
let _ = require("underscore");

module.exports =  class Generator {
  
  constructor(bundle, output_dir){
    this.bundle = bundle;
    this.assert_valid_bundle();
  }

  assert_valid_bundle(){
    if(this.bundle.meta_data.hqmf_library_version < "3.0.0"){
        throw "";
    }
  }

  generate_package(output_directory){
    this.output_directory = output_directory;
    this.generate_directories();
    this.generate_package_json();
    this.generate_measures();
    this.generate_hqmf_library_module();
    this.generate_index_file();
  }

  generate_measures(){
    this.bundle.measure_ids().forEach(measure_id => {
      this.generate_measure_logic(measure_id, this.bundle.measures[measure_id].map_fn);
    });

  }

  generate_measure_logic(measure_id, map_fn){
    let logic_template = _.template(map_fn);
    let binding  = {logic: logic_template({
                    effective_date: "options.effective_date;",
                    enable_logging: "options.enable_logging;",
                    enable_rationale: "options.enable_rationale;",
                    short_circuit: "options.short_circuit;"}),
                    name: measure_id
                    };
    let template = this.get_template("measure_logic");
    let logic = template(binding);
    this.write_to_file(`lib/${measure_id}.js`,logic);
  }

  generate_package_json(){
    let binding = {name:this.bundle.meta_data.title,
                   version:this.bundle.meta_data.version}
    this.write_to_file("package.json", this.get_template("package")(binding));
  }

  generate_index_file(){
    let index = "require('./lib/load_utils.js')\n";
    this.bundle.measure_ids().forEach(measure_id => {
      index += `module.exports.${measure_id} = require('./lib/${measure_id}.js').${measure_id};\n`;
    });
    this.write_to_file("index.js",index);
  }

  generate_hqmf_library_module(){
    this.write_to_file("lib/load_utils.js", this.get_template("load_utils")());
    this.write_to_file("lib/hqmf_utils.js", this.bundle.getLibrary("hqmf_utils"));
    this.write_to_file("lib/map_reduce_utils.js", this.bundle.getLibrary("map_reduce_utils"));
  }

  generate_directories(){
    let dirs = ["lib"];
    if(!fs.existsSync(this.output_directory)){
        fs.mkdirSync(this.output_directory);
    }

    dirs.forEach(dir => {
      if(!fs.existsSync(`${this.output_directory}/${dir}`)){
        fs.mkdirSync(`${this.output_directory}/${dir}`);
       } 
    });

  }

  write_to_file(file, data){
    fs.writeFileSync(`${this.output_directory}/${file}`, data);
  }

  get_template(name){
    this.templates = this.templates || {};
    if(this.templates[name]){
      return this.templates[name];
    }
    let template = fs.readFileSync(`${__dirname}/../templates/${name}.template`,"utf-8");
    let compiled = _.template(template);
    this.templates[name] = compiled;
    return compiled;
  }

}

