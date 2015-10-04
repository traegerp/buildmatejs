
/*
	Component JS Build Tool

---------------------------
|    Build Registration   |		
---------------------------

	1. Register a build version with <app>-<ver>-package.json stored in ./packages directory
		a. build version is found in package header
			{"build" : <app>, "version" : 0.01, "lastBuild" : "MM/DD/YYYY", package: []}

		b. The component array looks like this inside of package:
			[
				{"component" : <name>, "versionToUse" : 0.01, "requireTestBeforeBuild" : true}
			]

---------------------------
| Component Registration  |		
---------------------------

	1. Components are registered in registry.json within ./components directory
		a. Each component has following obj: 
			{"name" : "name", "file" : <name>.js, "version" : 0.01, "path" : '/'}

---------------------------
| Deployment Registration |		
---------------------------

	1. Register deployment with deployement.json 
		a. Only one deployment may exist:
			{"build" : <app>, "version" : 0.01}

---------------------------
| Automated Build Process |		
---------------------------

	0. Run $ node build.js

	1. Build tool creates <app> sub directory into dist folder with package name and version name:
		a. add folder called <app><version>
			1. if it already exists, use it
			2. if it doesnt exist, create it

	2. Build tool creates <app><version>.dist.js file and places into ./dist/<app><version>/ directory
		a. For each <app>-<ver>-package.json file
			1. for each package in current package
				a. get all component locations 
					1. for each component location
						a. run unit test
						b. if unit test passes, include in output .js file  
		b. create .js file 

---------------------------
| Deployment Process      |		
---------------------------

	0. Run $ node deploy.js
	1. Moves package to production in ./deployed directory
	2. Strips all file references to version to eliminate any need to change html/js/css src references

*/


//===================================
//			Build Tool
//===================================

const fs 	= require('fs');
const path 	= require('path');

console.log('\n');
console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
console.log('\n ComponentJS Build Tool \n')
console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
console.log('\n');

var pattern 		= /package.json/;
var currentDirPath 	= __dirname + '/packages/';
var files 			= fs.readdirSync(currentDirPath);

for (var i in files) {
    var filePath = path.join(currentDirPath, files[i]);
    var stat = fs.statSync(filePath);
    if (stat.isFile()) {
		if(files[i].match(pattern) !== null){  
			if(files[i] !== 'template.json'){
	    		processFile(files[i], filePath);
			}  	
    	}
    }
}

function processFile(file, filePath){
	var pattern = /package.json/;
	if(file && file.match(pattern) !== null){

		var mkdirSync = function(path) {
			try {
				fs.mkdirSync(path);
			} catch(e) {
				if ( e.code != 'EEXIST' ) throw e;
			}
		};

		var path 		= './packages/';
		var data 		= fs.readFileSync(path + file);
		var app 		= JSON.parse(data);
		console.log('APP PACKAGE: ' + app.build + app.version);
		console.log('BUILD APP: ' + app.build + ' VERSION: ' + app.version + ' ' + file);
		console.log('\n');

		var APP_PATH = path + 'app-' + app.build + app.version;
		mkdirSync(APP_PATH);

		function Components(options){
			if(options.file){
				this.path 	= './components';
				this.file 	= options.file;
				this.result = [];
				return this;
			}
		};

		Components.prototype.loadRegistry = function(){
			this.registry = JSON.parse(fs.readFileSync(this.path + '/' + this.file));
		};

		Components.prototype.runTest = function(path){
			var UnitTest = require('./components/' + path + 'unit.js');
			var test 	 = new UnitTest();
			return test.result();
		};

		Components.prototype.setStatus = function(status){
			this.status = status;
		};

		Components.prototype.getStatus = function(){
			return this.status;
		};	

		Components.prototype.clearValues = function(){
			this.result = [];
		};

		Components.prototype.find = function(component, version, requireTestBeforeBuild){
			if(this.registry){
				if(Object.prototype.toString.call(component) !== '[object Undefined]' && Object.prototype.toString.call(version) !== '[object Undefined]'){
					var array 	= this.registry;
					for(var i = 0; i < array.length; i++){
						if(array[i].file === component && array[i].version === version){
							if(requireTestBeforeBuild){
								var passedUnitTest = this.runTest(array[i].path);
							}
							else{	
								var passedUnitTest = true;
							}

							if(passedUnitTest){
								try{
									var js = fs.readFileSync(this.path + array[i].path + '/' + array[i].file);
								}
								catch(error){
									console.log('*ERROR: could not load component ' + array[i].component);
									console.error(error);
								}
								this.result.push('\n \n //SCRIPT:: ' + array[i].file + ' \n \n');
								this.result.push(js);
								console.log('            + ' + array[i].file + ' loaded');
								this.setStatus(true);							
							}
							else{
								this.setStatus(false);
								var reason = ': unit test failed';
								console.log('        x ' + array[i].component + ' not loaded' + reason);							
							}
							var wasNotFound = false;							
							break;
						}
						else{
							var wasNotFound = true; 
						}
					}
					if(wasNotFound){
						this.setStatus(false);
						var reason = ': not found';
						console.log('        x ' + array[i].component + ' not loaded' + reason);
					}					
				}
				else{
					throw new Error('component and version not correct type');
				}
			}
			else{
				throw new Error('Registry not loaded, call Components.get() method first');
			}
		};

		Components.prototype.compile = function(){
			return this.result.join('');
		};

		try{
			var obj 		= JSON.parse(data);
			var array 		= obj.package;
			var packages	= [];
			var components  = new Components({
				file : 'registry.json'
			});

			components.loadRegistry();
			console.log('component registry loaded...');
			array.forEach(function(obj, index){
				console.log('\n *Starting Package for ' + obj.name + '-v' + obj.version);
				console.log('\n     Loading Components:');
				if(Object.prototype.toString.call(obj) === '[object Object]'){
					for(var i = 0; i < obj.components.length; i++){
						components.find(obj.components[i].component, obj.components[i].versionToUse, obj.components[i].requireTestBeforeBuild);
					}
					var _obj  	= {};
					_obj.name 	= obj.name + '-v' + obj.version + '.dist.js';
					_obj.path 	= APP_PATH + '/' + obj.name + '-v' + obj.version;
					_obj.js 	= components.compile();
					_obj.status = components.getStatus();
					packages.push(_obj);
					components.clearValues();
				}
				else{
					console.error('*ERROR: ' + index + ' not object, is ' + typeof obj);
				}
			});

			console.log('\n *Compiled Packages: ');

			packages.forEach(function(package){
				if(package.status){
					mkdirSync(package.path);
					try{
						fs.writeFileSync(package.path + '/' + package.name, package.js);
					}
					catch(error){
						console.error(error);
					}
					console.log('    - ' + package.name + ' :: saved to ' + package.path);
				}
			});

			console.log('\n \n *Failed Packages: ');

			packages.forEach(function(package){
				if(!package.status){
					console.log('    - ' + package.name + ' :: failed');
				}
			});

			components.clearValues();

			console.log('\n');
		}
		catch(error){
			console.log('*ERROR: Could not parse JSON!');
			console.error(error);
		}
		console.log('----------------------------------------------------------------- \n');

		app.lastBuild = new Date();
		fs.writeFileSync(filePath, JSON.stringify(app, null, '\t'));
	}
	else{
		console.log('bad file, needs to be a package.json');
	}
}