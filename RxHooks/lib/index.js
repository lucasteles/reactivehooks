"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var fetch_1 = require("rxjs/fetch");
function useSubscribe(observable, next, error, complete) {
    react_1.useEffect(function () {
        var subscription = observable.subscribe(next, error, complete && (function () { return complete(true); }));
        return function () { return subscription.unsubscribe(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [observable]);
}
exports.useSubscribe = useSubscribe;
function useObservable(observable, initialValue) {
    var _a = react_1.useState(initialValue), value = _a[0], setValue = _a[1];
    useSubscribe(observable, setValue);
    return value;
}
exports.useObservable = useObservable;
function useObservableWithError(observable, initialValue) {
    var _a = react_1.useState(initialValue), value = _a[0], setValue = _a[1];
    var _b = react_1.useState(undefined), error = _b[0], setError = _b[1];
    var _c = react_1.useState(false), completed = _c[0], setComplete = _c[1];
    useSubscribe(observable, setValue, setError, setComplete);
    return [value, error, completed];
}
exports.useObservableWithError = useObservableWithError;
var rxInput = function (type) {
    var changeSubject = new rxjs_1.Subject();
    var handleChange = function (e) { return changeSubject.next(__assign({}, e)); };
    var focusSubject = new rxjs_1.Subject();
    var handleFocus = function (e) { return focusSubject.next(__assign({}, e)); };
    var blurSubject = new rxjs_1.Subject();
    var handleBlur = function (e) { return blurSubject.next(__assign({}, e)); };
    var inputFactory = function (props) {
        return react_1.default.createElement("input", __assign({ onChange: handleChange, onFocus: handleFocus, onBlur: handleBlur, type: type }, props));
    };
    var change$ = changeSubject.asObservable();
    var customProps = {
        onChange$: change$,
        onValueChanges$: change$.pipe(operators_1.map(function (x) { return x.target.value; })),
        onFocus$: focusSubject.asObservable(),
        onBlur$: blurSubject.asObservable(),
    };
    return Object.assign(inputFactory, customProps);
};
exports.rxInput = rxInput;
var rxButton = function () {
    var subject = new rxjs_1.Subject();
    var handleClick = function (e) { return subject.next(e); };
    var buttonfactory = function (props) {
        return react_1.default.createElement("button", __assign({ onClick: handleClick }, props), props.children);
    };
    var buttonProps = {
        onClick$: subject.asObservable()
    };
    return Object.assign(buttonfactory, buttonProps);
};
exports.rxButton = rxButton;
var useRxInputValue = function (rxInput, initialValue) {
    var _a = react_1.useState(initialValue), value = _a[0], setValue = _a[1];
    useSubscribe(rxInput.onValueChanges$, function (x) { return setValue(x); });
    return [value, function (newValue) { return setValue(newValue); }];
};
exports.useRxInputValue = useRxInputValue;
var createLoaderControl = function () {
    var subject = new rxjs_1.BehaviorSubject(false);
    return {
        start: function () {
            return function (x) {
                return x.pipe(operators_1.finalize(function () { return subject.next(false); }), operators_1.tap(function () { return subject.next(true); }));
            };
        },
        stop: function () {
            return function (x) {
                return operators_1.tap(function () { return subject.next(false); })(x);
            };
        },
        status$: subject.asObservable(),
    };
};
exports.createLoaderControl = createLoaderControl;
var fetchJson = function (url, init) {
    return fetch_1.fromFetch(url, init)
        .pipe(operators_1.switchMap(function (x) { return x.json().then(function (x) { return x; }); }));
};
exports.fetchJson = fetchJson;
