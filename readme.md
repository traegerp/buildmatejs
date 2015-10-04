#BuildmateJS

Use JavaScript components and compile them into a single script after running unit tests. 

#Overview

1. Create components with unit tests
2. Register your components
3. Build packages that use your components
4. Run your unit tests automatically during build process
5. Deploy your packages into a single javascript file

#Dependencies

- NodeJS

#Getting Started

Using NPM:

<pre>
	<code>
		>$ npm install buildmatejs --save
	</code>
</pre>

Or install via Git with zip

#Basic Usage

###Components

Components are the files that BuildmateJS can choose from to use and compile into distribution scripts. 

Add your JavaScript components to the ./node_modules/components/ folder by giving each testable component its own folder within this directory structure. 

Register your components to the registry.json file in ./components. 

<pre>
	<code>
[
	{"component" : "<component name>", "file" : "<.js file>", "version" : 0.01, "path" : "/<folder>"},
]
	</code>
</pre>

Components must include a unit test file that exports its contents:

<pre>
	<code>
		module.exports = Test;
	</code>
</pre>

This file must be called unit.js

###Packages

Packages are the way BuildmateJS creates your distribution script. By creating packages you are telling BuildmateJS what to scripts to compile down into a single file.

Add your packages to ./packages and create a json file in the following format: <app>-<version>-package.json
For each package you create it must contain the following information:

<pre>
	<code>
{
	"build": "test",
	"version": 0.01,
	"lastBuild": "",
	"package": [
		{
			"name": "testComponentName",
			"version": 0.01,
			"components": [
				{
					"component": "file.js",
					"versionToUse": 0.01,
					"requireTestBeforeBuild": true
				}
			]
		}
	]
}
	</code>
</pre>

You can add as many components to a package as you like:

<pre>
	<code>
{
	"build": "test",
	"version": 0.01,
	"lastBuild": "",
	"package": [
		{
			"name": "testComponentName1",
			"version": 0.01,
			"components": [
				{
					"component": "file.js",
					"versionToUse": 0.01,
					"requireTestBeforeBuild": true
				}
			]
		},
		{
			"name": "testComponentName2",
			"version": 0.01,
			"components": [
				{
					"component": "file2.js",
					"versionToUse": 0.01,
					"requireTestBeforeBuild": true
				}
			]
		}
	]
}
	</code>
</pre>

You can specify the version of the script you want your package to build from. This way you can have multiple version of components registered at once.

###Building Packages

From terminal access buildmatejs directory:

<pre>
	<code>
		>$ cd ./node_modules/buildmatejs/
	</code>
</pre>

Then run the Build.js script using node:

<pre>
	<code>
		>$ node build.js
	</code>
</pre>

This creates a package folder in your ./packages directory that can be deployed.

###Deploying Packages

In order to deploy your packge you need to set up your dist.json file. Change dist.json to include the built package created through the build process:

<pre>
	<code>
{
	"description": "Add deployment id by supplying build and version values, then add package path to deploy",
	"build": "<app>",
	"version": 0.0.0,
	"packagePath": "./packages/<folder>",
	"deployPath": "./production",
	"lastDeploy": ""
}		
	</code>
</pre>

In the packagePath add the path of the newly created build. You do not need to change the deployPath as it points to the production folder - only change this if you want to change the path.

After creating the deployment in dist.json, run the deploy.js file:

<pre>
	<code>
		>$ cd ./node_modules/buildmatejs/
	</code>
</pre>

Then:

<pre>
	<code>
		>$ node build.js
	</code>
</pre>

