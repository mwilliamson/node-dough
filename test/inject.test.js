var inject = require("../");

exports.canBindConstants = function(test) {
    var injector = inject.newInjector();
    injector.bind("username").toConstant("Bob");
    injector.get("username", function(err, username) {
        test.equal("Bob", username);
        test.done();
    });
};

exports.errorIfThereIsNoBindingForKey = function(test) {
    var injector = inject.newInjector();
    injector.get("username", function(err, username) {
        test.equal("No binding for username", err.message.split("\n")[0]);
        test.done();
    });
};

exports.canBindToFunctions = function(test) {
    var injector = inject.newInjector();
    injector.bind("username").toProvider(function(callback) {
        callback(null, "Bob");
    });
    injector.get("username", function(err, username) {
        test.equal("Bob", username);
        test.done();
    });
};

exports.canBindFunctionWithDependencies = function(test) {
    var injector = inject.newInjector();
    injector.bind("user").toConstant({name: "Bob"});
    injector.bind("username").toProvider(function(user, callback) {
        callback(null, user.name);
    }, "user");
    injector.get("username", function(err, username) {
        test.equal("Bob", username);
        test.done();
    });
};

exports.canCallUnboundFunctionsWithDependencies = function(test) {
    var injector = inject.newInjector();
    injector.bind("user").toConstant({name: "Bob"});
    var username = function(user, callback) {
        callback(null, user.name);
    };
    injector.callFunction(username, "user", function(err, username) {
        test.equal("Bob", username);
        test.done();
    });
};

exports.canBindSyncFunctionWithDependencies = function(test) {
    var injector = inject.newInjector();
    injector.bind("user").toConstant({name: "Bob"});
    injector.bind("username").toSyncProvider(function(user) {
        return user.name;
    }, "user");
    injector.get("username", function(err, username) {
        test.equal("Bob", username);
        test.done();
    });
};

exports.errorIfDependencyNotAvailable = function(test) {
    var injector = inject.newInjector();
    injector.bind("username").toProvider(function(user, callback) {
        callback(null, user.name);
    }, "user");
    injector.get("username", function(err, username) {
        test.equal("No binding for user", err.message.split("\n")[0]);
        test.done();
    });
};

exports.dependencyStackIsDescribedInErrors = function(test) {
    var injector = inject.newInjector();
    injector.bind("username").toProvider(function(user, callback) {
        callback(null, user.name);
    }, "user");
    injector.bind("first-name").toProvider(function(name, callback) {
        callback(null, name.first);
    }, "username");
    injector.get("first-name", function(err, username) {
        test.equal("No binding for user\nDependency stack:\n  1) user\n  2) username\n  3) first-name", err.message);
        test.done();
    });
};

exports.injectorIsBound = function(test) {
    var injector = inject.newInjector();
    injector.get("injector", function(err, injectorResult) {
        test.equal(injector, injectorResult);
        test.done();
    });
};

exports.canDetermineIfKeyIsBound = function(test) {
    var injector = inject.newInjector();
    injector.bind("user").toConstant({});
    test.ok(injector.isBound("user"));
    test.ok(!injector.isBound("userRepository"));
    test.done();
};

exports.canMemoizeProviders = function(test) {
    var numberOfCalls = 0;
    var injector = inject.newInjector();
    injector.bind("username").toSyncProvider(function() {
        numberOfCalls += 1;
        return "Bob";
    }).memoize();
    injector.get("username", function(err, username) {
        test.equal("Bob", username);
        test.equal(1, numberOfCalls);
        injector.get("username", function(err, username) {
            test.equal("Bob", username);
            test.equal(1, numberOfCalls);
            test.done();
        });
    });
};

exports.canMemoizeProvidersWithArugments = function(test) {
    var numberOfCalls = 0;
    var injector = inject.newInjector();
    injector.bind("user").toConstant({name: "Bob"});
    injector.bind("username").toProvider(function(user, callback) {
        callback(null, user.name);
    }, "user").memoize();
    injector.get("username", function(err, username) {
        test.equal("Bob", username);
        test.done();
    });
};

exports.secondRequestForMemoizedDependencyWaitsForFirstRequestToFinish = function(test) {
    var numberOfCalls = 0;
    var injector = inject.newInjector();
    var providerCallback;
    injector.bind("username").toProvider(function(callback) {
        numberOfCalls += 1;
        providerCallback = callback;
    }).memoize();
    
    injector.get("username", function() {});
    
    injector.get("username", function(err, username) {
        test.equal("Bob", username);
        test.equal(1, numberOfCalls);
        test.done();
    });
    
    providerCallback(null, "Bob");
};

exports.callIsNotMemoizedIfItReturnsAnError = function(test) {
    var numberOfCalls = 0;
    var injector = inject.newInjector();
    injector.bind("username").toProvider(function(callback) {
        numberOfCalls += 1;
        if (numberOfCalls === 1) {
            callback(new Error("Oh noes!"));
        } else {
            callback(null, "Bob");
        }
    }).memoize();
    injector.get("username", function(err, username) {
        test.equal("Oh noes!", err.message);
        test.equal(1, numberOfCalls);
        injector.get("username", function(err, username) {
            test.equal("Bob", username);
            test.equal(2, numberOfCalls);
            test.done();
        });
    });
};

exports.canDelegateInjectionToAnotherInjector = function(test) {
    var subInjector = inject.newInjector();
    subInjector.bind("username").toConstant("Bob");
    
    var injector = subInjector.extend();
    
    injector.get("username", function(err, username) {
        test.equal("Bob", username);
        test.done();
    });
};

exports.bindingsDeclaredInOriginalInjectorCanUseBindingsInExtendedInjectorWhenUsingExtendedInjector = function(test) {
    var subInjector = inject.newInjector();
    subInjector.bind("username").toSyncProvider(function(user) {
        return user.name;
    }, "user");
    
    var injector = subInjector.extend();
    injector.bind("user").toConstant({name: "Bob"});
    
    injector.get("username", function(err, username) {
        test.equal("Bob", username);
        test.done();
    });
};

exports.memoizationOccursInInjectorWhereBindingIsDeclared = function(test) {
    var numberOfCalls = 0;
    var subInjector = inject.newInjector();
    subInjector.bind("username").toSyncProvider(function() {
        numberOfCalls += 1;
        return "Bob";
    }).memoize();
    
    var injector = subInjector.extend();
    
    injector.get("username", function(err, username) {
        test.equal("Bob", username);
        test.equal(1, numberOfCalls);
        subInjector.get("username", function(err, username) {
            test.equal("Bob", username);
            test.equal(1, numberOfCalls);
            test.done();
        });
    });
};

exports.bindingsDeclaredInOriginalInjectorCannotUseBindingsInExtendedInjectorWhenUsingOriginalInjector = function(test) {
    var subInjector = inject.newInjector();
    subInjector.bind("username").toSyncProvider(function(user) {
        return user.name;
    }, "user");
    
    var injector = subInjector.extend();
    injector.bind("user").toConstant({name: "Bob"});
    
    subInjector.get("username", function(err, username) {
        test.equal("No binding for user", err.message.split("\n")[0]);
        test.done();
    });
};
