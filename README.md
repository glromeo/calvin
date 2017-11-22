# ![Calvin Logo](https://rawgit.com/glromeo/calvin/master/images/calvin.jpg) Calvin 

## Description

Calvin is a little framework built on top of modern web standards for building dashboards, reports and visualizations.
It aims at helping build dynamic web pages where the data that drives the rendering is well defined and the beginning
and the rendering flows naturally as if the contents where written on paper.

This library has been designed to support material-reports. A project for rendering quality PDF reports out of 
dynamic HTML contents. 

Although I like to keep the library as flexible and generic as possible the correctness and predictability of the 
rendering are paramount.

Extra care is put on optimizing the code for speed and low memory usage because the rendering process must be scalable 
and responsive.  

## Table of Contents

working on it...

## Installation

If you want to include the library in your project and serve it locally you can just use npm to install it:
```
npm install calvin
```
The library uses SystemJS to import ES6 modules.

## Usage

### Components & Directives

White paper has been developed with the intent of giving a familiar environment to those already experienced with using AnglarJS.

Components are very close to Custom Elements (v1.0) specification, with a little syntactic sugar on top to simplify coding with them.
You can think of directives as custom attributes or simply as AngluarJS attribute directives.

```html
<div>
    <template for-each="item of items">
    
    </template>
</div>
```
example of directive for-each applied to template

Scope is much different from what it was in AngularJS. It's still there and it will stay because its nested nature is ideal 
to organize reports data and because I strongly believe removing features to enforce coding best practices is not te way to 
write better applications.



### Server

The script ``server.js`` is used to start an *express* server that serves the content of the ``public`` directory.
In it there's a showcase of the framework functionality as well as the QUnit test runner that executes in the browser.

The server is based on [express](https://expressjs.com/) and transpiles the ``src`` files on the fly using some middleware
 functions that ultimately rely on *babel* and *node-sass*.

Both sass and babel options are specified in ``server.js`` during at the instantiation of the Server class. 

> The ``.babelrc`` file in the project home is used by the *mocha* babel compiler. Mocha unit tests run in *Node* so 
they are transpiled into *CJS* modules while the server transpiles the contents of src into *SystemJS* modules.  

### Unit testing in the browser
Since most of the functionality of the framework requires a full fledged DOM the best way to run the unit tests is within Chrome.

Using [IntelliJ IDEA or WebStorm](https://www.jetbrains.com/help/idea/debugging-javascript-in-chrome.html) debugging is extremely comfy.
The script ``qunit.js`` can be associated with a debugged page like this:

![ServerDebugDialog](https://rawgit.com/glromeo/calvin/master/images/server-debug.png)

This way one can just put breakpoints in the source code inside of the IDE to debug.

#### Credit and Thanks

[Paper Plane Icon](https://www.iconfinder.com/icons/381589/paper_plane_icon#size=128) 
by [Tahsin Tahil](https://www.iconfinder.com/tahsintahil)
is licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)