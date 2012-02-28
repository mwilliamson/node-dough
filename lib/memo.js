exports.async = function(func) {
    var hasValue = false;
    var evaluating = false;
    var memoizedValue;
    var waitingCallbacks = [];
    
    var memoizedFunction = function(callback) {
        if (hasValue) {
            callback(null, memoizedValue);
        } else if (evaluating) {
            waitingCallbacks.push(callback);
        } else {
            evaluating = true;
            func(function(err, value) {
                if (!err) {
                    hasValue = true;
                    memoizedValue = value;
                }
                evaluating = false;
                callback(err, value);
                var oldWaitingCallbacks = waitingCallbacks;
                waitingCallbacks = [];
                oldWaitingCallbacks.forEach(memoizedFunction);
            });
        }
    };
    return memoizedFunction;
};
