import * as Lint from 'tslint';
import * as ts from 'typescript';
import { isImportDeclaration } from 'tsutils';

const nodeModulesRegExp = /^(?!([@.]))/g;
const extensionRegExp = /\.[a-z]+$/g;
const dotNotationRegExp = /^(\.+\/)+/g;
const dotNotationWithoutExtensionsRegExp = /^(\.+\/)+[a-zA-Z0-9/-]+$/g;
const dotNotationWithExtensionRegExp = /^(\.+\/)+[a-zA-Z0-9/-]*\.[a-z0-9]/g;

const NODE_MODULES_OPTION = 'node_modules';
const DOT_NOTATION_OPTION = 'dot-notation';
const EXTENSIONS_OPTION = 'extensions';

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'module-imports-order',
    description: 'Helps to keep your imports in order.',
    options: {
      type: 'string',
      enum: [NODE_MODULES_OPTION, DOT_NOTATION_OPTION, EXTENSIONS_OPTION],
    },
    optionsDescription: Lint.Utils.dedent`
            One of the following options must be provided:
            * \`"${NODE_MODULES_OPTION}"\` defines an order for node_modules
            * \`"${DOT_NOTATION_OPTION}"\` defines an order for dot_notation
            * \`"${EXTENSIONS_OPTION}"\` defines an order for files with extensions`,
    optionExamples: [true, [NODE_MODULES_OPTION, DOT_NOTATION_OPTION, EXTENSIONS_OPTION]],
    type: 'formatting',
    typescriptOnly: false,
    hasFix: false,
    requiresTypeInfo: true,
  };

  public static FAILURE_STRING = 'Wrong import order';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, 'module-imports-order', this.getOptions()));
  }
}

class Walker extends Lint.AbstractWalker<any> {
  private imports = [];

  // Basic walker method
  public walk(sourceFile: ts.SourceFile) {
    for (const statement of sourceFile.statements) {
      if (isImportDeclaration(statement)) {
        this.imports.push(statement);
      }
    }

    this.checkImportsOrder();
  }

  private checkImportsOrder() {
    // Retrieving rule order from tsconfig.json, like ['node_module', '@/modules', 'extensions']
    const importsOrderFromRule = this.options.ruleArguments[0];
    let lastMatchedOrderPosition = 0;

    this.imports.forEach((importStatement: ts.ImportDeclaration, importIndex: number) => {
      // Retrieving current import path, like 'react' or '@/component/global-module'
      const importPath = getImportPathText(importStatement);
      const prevImportPath = getImportPathText(this.imports[importIndex - 1]);

      importsOrderFromRule.forEach((order: string, index: number) => {
        const regExpFromOrder = defineRegExpFromOrder(order);
        const regexp = new RegExp(regExpFromOrder, 'g');

        // Checking if importPath matches order, like @/components/global-module matches @/components/
        if (regexp.test(importPath)) {
          // Checking dot-notation importPath without extensions
          if (prevImportPath) {
            if (order === DOT_NOTATION_OPTION
              && !(extensionRegExp).test(importPath)
              && prevImportPath.match(dotNotationWithoutExtensionsRegExp)
              && importIndex !== 0
              && importIndex !== this.imports.length - 1) {
              // Retrieving slashes count, like ../ or ./ or ../../
              const currentImportSlashesCount = importPath.match(dotNotationRegExp) || [];
              const previousImportSlashesCount = prevImportPath.match(dotNotationRegExp) || [];

              // If current count of slashes less than previous, then error, like ./ < ../
              if (currentImportSlashesCount.join('').length > previousImportSlashesCount.join('').length) {
                this.addFailureAtNode(importStatement, Rule.FAILURE_STRING);
              }
            }
            // Checking importPath with extensions
            if (order === EXTENSIONS_OPTION
              && prevImportPath.match(dotNotationWithExtensionRegExp)
              && importPath.match(dotNotationWithExtensionRegExp)
              && importIndex !== 0
              && importIndex !== this.imports.length) {
              const currentImportSlashesCount = importPath.match(dotNotationRegExp) || [];
              const previousImportSlashesCount = prevImportPath.match(dotNotationRegExp) || [];

              if (currentImportSlashesCount.join('').length > previousImportSlashesCount.join('').length) {
                this.addFailureAtNode(importStatement, Rule.FAILURE_STRING);
              }
            }
          }
          // Checking other import positions
          if (lastMatchedOrderPosition > index) {
            this.addFailureAtNode(importStatement, Rule.FAILURE_STRING);
            lastMatchedOrderPosition = 0;
          } else {
            lastMatchedOrderPosition = index;
          }
        }

      });
    });
  }
}

const defineRegExpFromOrder = (order) => {
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

const getImportPathText = (importStatement: ts.ImportDeclaration): string => {
  return importStatement && importStatement.moduleSpecifier.getText().replace(/'/g, '');
};
