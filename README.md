[![build status](https://secure.travis-ci.org/mwilliamson/node-dough.png)](http://travis-ci.org/mwilliamson/node-dough)
# node-dough -- Simple dependency injection for node.js

node-dough is a simple dependency injection library for node.js. It maps string keys to providers, which are simply asynchronous functions. For instance:

    var dough = require("dough");

    var injector = dough.newInjector();
    injector.bind("username").toProvider(function(callback) {
        callback(null, "Bob");
    });
    injector.get("username", function(err, username) {
        // username === "Bob"
    });

The dependencies of a provider can be specified by passing them as additional arguments to `toProvider`:

    injector.bind("user").toProvider(function(callback) {
        callback(null, {name: "Bob"});
    });
    injector.bind("username").toProvider(function(user, callback) {
        callback(null, user.name);
    }, "user");
    injector.get("username", function(err, username) {
        // username === "Bob"
    });

Although they all ultimately delegate to using `toProvider`, bindings can be specified with other methods:

    // Binding to constants
    injector.bind("username").toConstant("Bob");
    injector.get("username", function(err, username) {
        // username === "Bob"
    });

    // Binding to synchronous functions
    injector.bind("username").toSyncProvider(function() {
        return "Bob";
    });
    injector.get("username", function(err, username) {
        // username === "Bob"
    });

