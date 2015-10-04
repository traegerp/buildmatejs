#BuildmateJS

Use JavaScript components and compile them into a single script after running unit tests. 

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

Add your JavaScript components to the ./node_modules/components/ folder by giving each testable component its own folder within this directory structure. 

Register your components to the registry.json file in ./components. 

<pre>
	<code>
[
	{"component" : "<component name>", "file" : "<.js file>", "version" : 0.00, "path" : "/<folder>"},
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

Add your packages
