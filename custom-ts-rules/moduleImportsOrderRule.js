"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
exports.__esModule = true;
var Lint = require("tslint");
var tsutils_1 = require("tsutils");
var nodeModulesRegExp = /^(?!([@.]))/g;
var extensionRegExp = /\.[a-z]+$/g;
var dotNotationRegExp = /^(\.+\/)+/g;
var dotNotationWithoutExtensionsRegExp = /^(\.+\/)+[a-zA-Z0-9/-]+$/g;
var dotNotationWithExtensionRegExp = /^(\.+\/)+[a-zA-Z0-9/-]*\.[a-z0-9]/g;
var NODE_MODULES_OPTION = 'node_modules';
var DOT_NOTATION_OPTION = 'dot-notation';
var EXTENSIONS_OPTION = 'extensions';
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new Walker(sourceFile, 'module-imports-order', this.getOptions()));
    };
    Rule.metadata = {
        ruleName: 'module-imports-order',
        description: 'Helps to keep your imports in order.',
        options: {
            type: 'string',
            "enum": [NODE_MODULES_OPTION, DOT_NOTATION_OPTION, EXTENSIONS_OPTION]
        },
        optionsDescription: Lint.Utils.dedent(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n            One of the following options must be provided:\n            * `\"", "\"` defines an order for node_modules\n            * `\"", "\"` defines an order for dot_notation\n            * `\"", "\"` defines an order for files with extensions"], ["\n            One of the following options must be provided:\n            * \\`\"", "\"\\` defines an order for node_modules\n            * \\`\"", "\"\\` defines an order for dot_notation\n            * \\`\"", "\"\\` defines an order for files with extensions"])), NODE_MODULES_OPTION, DOT_NOTATION_OPTION, EXTENSIONS_OPTION),
        optionExamples: [true, [NODE_MODULES_OPTION, DOT_NOTATION_OPTION, EXTENSIONS_OPTION]],
        type: 'formatting',
        typescriptOnly: false,
        hasFix: false,
        requiresTypeInfo: true
    };
    Rule.FAILURE_STRING = 'Wrong import order';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var Walker = /** @class */ (function (_super) {
    __extends(Walker, _super);
    function Walker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.imports = [];
        return _this;
    }
    // Basic walker method
    Walker.prototype.walk = function (sourceFile) {
        for (var _i = 0, _a = sourceFile.statements; _i < _a.length; _i++) {
            var statement = _a[_i];
            if (tsutils_1.isImportDeclaration(statement)) {
                this.imports.push(statement);
            }
        }
        this.checkImportsOrder();
    };
    Walker.prototype.checkImportsOrder = function () {
        var _this = this;
        // Retrieving rule order from tsconfig.json, like ['node_module', '@/modules', 'extensions']
        var importsOrderFromRule = this.options.ruleArguments[0];
        var lastMatchedOrderPosition = 0;
        this.imports.forEach(function (importStatement, importIndex) {
            // Retrieving current import path, like 'react' or '@/component/global-module'
            var importPath = getImportPathText(importStatement);
            var prevImportPath = getImportPathText(_this.imports[importIndex - 1]);
            importsOrderFromRule.forEach(function (order, index) {
                var regExpFromOrder = defineRegExpFromOrder(order);
                var regexp = new RegExp(regExpFromOrder, 'g');
                // Checking if importPath matches order, like @/components/global-module matches @/components/
                if (regexp.test(importPath)) {
                    // Checking dot-notation importPath without extensions
                    if (order === DOT_NOTATION_OPTION
                        && !(extensionRegExp).test(importPath)
                        && prevImportPath.match(dotNotationWithoutExtensionsRegExp)
                        && importIndex !== 0
                        && importIndex !== _this.imports.length - 1) {
                        // Retrieving slashes count, like ../ or ./ or ../../
                        var currentImportSlashesCount = importPath.match(dotNotationRegExp) || [];
                        var previousImportSlashesCount = prevImportPath.match(dotNotationRegExp) || [];
                        // If current count of slashes less than previous, then error, like ./ < ../
                        if (currentImportSlashesCount.join('').length > previousImportSlashesCount.join('').length) {
                            _this.addFailureAtNode(importStatement, Rule.FAILURE_STRING);
                        }
                    }
                    // Checking importPath with extensions
                    if (order === EXTENSIONS_OPTION
                        && prevImportPath.match(dotNotationWithExtensionRegExp)
                        && importPath.match(dotNotationWithExtensionRegExp)
                        && importIndex !== 0
                        && importIndex !== _this.imports.length) {
                        var currentImportSlashesCount = importPath.match(dotNotationRegExp) || [];
                        var previousImportSlashesCount = prevImportPath.match(dotNotationRegExp) || [];
                        if (currentImportSlashesCount.join('').length > previousImportSlashesCount.join('').length) {
                            _this.addFailureAtNode(importStatement, Rule.FAILURE_STRING);
                        }
                    }
                    // Checking other import positions
                    if (lastMatchedOrderPosition > index) {
                        _this.addFailureAtNode(importStatement, Rule.FAILURE_STRING);
                        lastMatchedOrderPosition = 0;
                    }
                    else {
                        lastMatchedOrderPosition = index;
                    }
                }
            });
        });
    };
    return Walker;
}(Lint.AbstractWalker));
var defineRegExpFromOrder = function (order) {
    if (order === NODE_MODULES_OPTION) {
        return nodeModulesRegExp;
    }
    if (order === DOT_NOTATION_OPTION) {
        return dotNotationWithoutExtensionsRegExp;
    }
    if (order === EXTENSIONS_OPTION) {
        return extensionRegExp;
    }
    return order;
};
var getImportPathText = function (importStatement) {
    return importStatement && importStatement.moduleSpecifier.getText().replace(/'/g, '');
};
var templateObject_1;
