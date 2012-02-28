var memo = require("../lib/memo");

exports.memoizedFunctionDelegatesToPassedFunction = function(test) {
    var memoized = memo.async(function(callback) {
        callback(null, "Budget Meeting");
    });
    memoized(function(err, value) {
        test.equal("Budget Meeting", value);
        test.done();
    });
};

exports.memoizedFunctionOnlyCallsFunctionOnceIfNoErrors = function(test) {
    var numberOfCalls = 0;
    var memoized = memo.async(function(callback) {
        numberOfCalls += 1;
        callback(null, "Budget Meeting");
    });
    memoized(function(err, value) {
        test.equal("Budget Meeting", value);
        test.equal(1, numberOfCalls);
        memoized(function(err, value) {
            test.equal("Budget Meeting", value);
            test.equal(1, numberOfCalls);
            test.done();
        });
    });
};

exports.memoizedFunctionDoesntMemoizeErrors = function(test) {
    var numberOfCalls = 0;
    var memoized = memo.async(function(callback) {
        numberOfCalls += 1;
        if (numberOfCalls === 1) {
            callback(new Error("Oh noes!"));
        } else {
            callback(null, "Budget Meeting");
        }
    });
    memoized(function(err, value) {
        test.equal("Oh noes!", err.message);
        test.equal(1, numberOfCalls);
        memoized(function(err, value) {
            test.equal("Budget Meeting", value);
            test.equal(2, numberOfCalls);
            test.done();
        });
    });
};

exports.secondRequestForMemoizationWaitsForFirstRequestToMemoizeValue = function(test) {
    var numberOfCalls = 0;
    var continueCallback;
    var memoized = memo.async(function(callback) {
        numberOfCalls += 1;
        continueCallback = callback;
    });
    
    memoized(function(err, value) {
        test.equal("Budget Meeting", value);
        test.equal(1, numberOfCalls);
    });
    
    memoized(function(err, value) {
        test.equal("Budget Meeting", value);
        test.equal(1, numberOfCalls);
        test.done();
    });
    
    continueCallback(null, "Budget Meeting");
};
