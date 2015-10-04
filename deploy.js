/*

---------------------------
| Deployment Process      |		
---------------------------

	0. Run $ node deploy.js
	1. Moves package to production in ./deployed directory
	2. Strips all file references to version to eliminate any need to change html/js/css src references

*/

//===================================
//			Deploy Tool
//===================================

const fs 	= require('fs');
const util  = require('util');
const path 	= require('path');
const exec  = require('child_process').exec;

console.log('\n');
console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
console.log('\n ComponentJS Deploy Tool \n')
console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
console.log('\n');

var obj = fs.readFileSync('./dist.json');
obj = JSON.parse(obj);
obj.lastDeploy = new Date();

fs.writeFileSync('./dist.json', JSON.stringify(obj, null, '\t'));
console.log('Deployment for ' + obj.build);

var bashCommand = 'cp -r ' + obj.packagePath + ' ' + obj.deployPath;

var childProcess = exec(bashCommand, function (error, stdout, stderr) { 
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);

	if(!error){
		console.log('Deploying...');

		var files = fs.readdirSync(obj.deployPath);		
		for(var i = 0; i < files.length; i++){
			fs.rename(obj.deployPath + '/' + files[i], obj.deployPath + '/app');
			var appPath = obj.deployPath + '/app/';
			setTimeout(function(){
				if(fs.existsSync(appPath)){
					var packages 	= fs.readdirSync(appPath);
					for(var x = 0; x < packages.length; x++){
						var js = fs.readdirSync(appPath + '/' + packages[x]);
						var newJS = js[0].split('-v')[0].replace('js', '');
						var fileName = packages[x].split('-v')[0];
						console.log(appPath + '/' + fileName + '/' + js[0]);
						console.log(appPath + '/' + fileName + '/' + newJS + '.js')
						fs.rename(appPath + packages[x], appPath + fileName);
						fs.rename(appPath + '/' + fileName + '/' + js[0], appPath + '/' + fileName + '/' + newJS + '.js');
						console.log('Deployed at ' + new Date());
						console.log('Deployment Complete!');
					}			
				}
				else{
					console.error('app path doesnt exist')
				}
			}, 2000);
		}
	}
	else{
		console.error(error);
	}
});