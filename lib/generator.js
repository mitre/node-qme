"use strict";
let fs = require("fs");
let _ = require("underscore");

/* Class that will generate an NPM package that contains Measure classes for each of the measures included in the bundle.
*/
module.exports =  class Generator {

  /* @param {Bundle} bundle -- the bundle that contains the measures and libraries
     @param {String} output_dir -- the directory that the package will be generated into
     */
  constructor(bundle, output_dir){
    this.bundle = bundle;
    this.assert_valid_bundle();
  }

  /* need to make sure that this is a bundle format that can be handled
  */
  assert_valid_bundle(){
    if(this.bundle.meta_data.hqmf_library_version < "3.0.0"){
        throw "";
    }
  }

  /* Generate the package to the output_directory
  */
  generate_package(output_directory){
    this.output_directory = output_directory;
    this.generate_directories();
    this.generate_package_json();
    this.generate_measures();
    this.generate_hqmf_library_module();
    this.generate_index_file();
  }

  /*
  Generate the measure classes. this is based on the templates in the templats directory
  */
  generate_measures(){
    this.bundle.measure_ids().forEach(measure_id => {
      this.generate_measure_logic(measure_id, this.bundle.getMeasureDef(measure_id).map_fn);
    });

  }

  /* Generate the logic for the given measure and map_fn
  */
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

  /* Generate a package.json file for the npm package
  */
  generate_package_json(){
    let binding = {name:this.bundle.meta_data.title,
                   version:this.bundle.meta_data.version}
    this.write_to_file("package.json", this.get_template("package")(binding));
  }
  /* Generate an index.js file for the npm package
  */
  generate_index_file(){
    let index = "require('./lib/load_utils.js')\n";
    this.bundle.measure_ids().forEach(measure_id => {
      index += `module.exports.${measure_id} = require('./lib/${measure_id}.js').${measure_id};\n`;
    });
    this.write_to_file("index.js",index);
  }

  /* Add a file that will load all of the javascript utility files required for calculation
  */
  generate_hqmf_library_module(){
    this.write_to_file("lib/load_utils.js", this.get_template("load_utils")());
    this.write_to_file("lib/hqmf_utils.js", this.bundle.getLibrary("hqmf_utils"));
    this.write_to_file("lib/map_reduce_utils.js", this.bundle.getLibrary("map_reduce_utils"));
  }

  /* setup directories for the package to be generated
  */
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

  /* Simply write the data out to the given file synchrnously
  */
  write_to_file(file, data){
    fs.writeFileSync(`${this.output_directory}/${file}`, data);
  }

  /* Get the template from the file system and compile it
  */
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
