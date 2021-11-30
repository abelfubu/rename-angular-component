// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { FileHandle } from 'fs/promises';
import * as vscode from 'vscode';
import { rename } from './helpers/rename.function';
import { ReferenceIndexer } from './indexer/referenceindexer';
import * as fs from 'fs-extra-promise';
import * as ts from 'typescript';

export function activate(context: vscode.ExtensionContext) {
  // console.log('Extension activated');
  // const importer: ReferenceIndexer = new ReferenceIndexer();

  // function initWithProgress() {
  //   return vscode.window.withProgress(
  //     {
  //       location: vscode.ProgressLocation.Window,
  //       title: 'Rename Angular Component is indexing',
  //     },
  //     async (progress) => {
  //       return importer.init(progress);
  //     }
  //   );
  // }

  // const initialize = () => {
  //   if (importer.isInitialized) {
  //     return Promise.resolve();
  //   }
  //   return initWithProgress();
  // };

  /* TODO run initialize() and show Input Box at the same time - 
  then make sure / wait for importer.isInitialized without running 
  a second instance of initWithProgress */

  let renameComponent = vscode.commands.registerCommand(
    'rename-angular-component.renameComponent',
    async (uri: vscode.Uri) => {
      const filePath =
        '/Users/tom/Development/dng/dgx-sales-spa-dev2/libs/sales/feature-appliance-details/src/lib/appliance-details/appliance-details.component.ts';

      const testText = await fs.readFileAsync(filePath, 'utf8');

      applyClassNameEdits(
        filePath,
        testText,
        'ApplianceDetailsComponent',
        'TestClass'
      );
    }
    // initialize().then(() => rename('component', uri, importer))
  );
  context.subscriptions.push(renameComponent);

  // let renameDirective = vscode.commands.registerCommand(
  //   'rename-angular-component.renameDirective',
  //   (uri: vscode.Uri) =>
  //     initialize().then(() => rename('directive', uri, importer))
  // );
  // context.subscriptions.push(renameDirective);

  // let renameService = vscode.commands.registerCommand(
  //   'rename-angular-component.renameService',
  //   (uri: vscode.Uri) =>
  //     initialize().then(() => rename('service', uri, importer))
  // );
  // context.subscriptions.push(renameService);
}

export function deactivate() {}

interface Reference {
  specifier: string;
  originalText?: string;
  location: { start: number; end: number };
}

const decoratorPropertiesRequired = ['selector', 'templateUrl', 'styleUrls'];

function applyClassNameEdits(
  fileName: string,
  sourceText: string,
  originalClassName: string,
  newClassName: string
) {
  console.log('new session4');

  const file = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest
  );

  const result: Reference[] = [];

  file.statements.forEach((node: ts.Node) => {
    if (
      ts.isClassDeclaration(node) &&
      node.name?.escapedText === originalClassName
    ) {
      result.push({
        specifier: node.name?.escapedText,
        location: {
          start: node.name.pos,
          end: node.name.end,
        },
      });

      try {
        node.decorators?.find((decorator: ts.Decorator) => {
          if (
            ts.isCallExpression(decorator.expression) &&
            ts.isIdentifier(decorator.expression.expression) &&
            decorator.expression.expression.text === 'Component'
          ) {
            const test = decorator.expression.arguments[0];
            if (ts.isObjectLiteralExpression(test)) {
              test.properties.forEach((prop) => {
                if (
                  ts.isPropertyAssignment(prop) &&
                  ts.isIdentifier(prop.name) &&
                  decoratorPropertiesRequired.includes(prop.name.text)
                ) {
                  if (ts.isStringLiteral(prop.initializer)) {
                    result.push({
                      specifier: prop.name.text,
                      originalText: prop.initializer.text,
                      location: {
                        start: prop.initializer.pos,
                        end: prop.initializer.end,
                      },
                    });
                  }
                  if (ts.isArrayLiteralExpression(prop.initializer)) {
                    const specifier = prop.name.text;
                    prop.initializer.elements.find((elem) => {
                      if (ts.isStringLiteral(elem)) {
                        result.push({
                          specifier,
                          originalText: elem.text,
                          location: {
                            start: elem.pos,
                            end: elem.end,
                          },
                        });
                        return true;
                      }
                    });
                  }
                }
              });
            }
            // (arg =>{

            // })

            return true;
          }
        });

        // const child = decorator?.
        // const count = child?.getChildCount();
        // const test = child?.getFirstToken();

        // console.log('isClassDeclaration4', !!isInjectableDecorator);
      } catch (e) {
        console.log(e);
      }

      // node.decorators?[0].

      // for(let i=0;i<node.decorators?.entries.length??0;i++)

      // if (ts.isDecorator(node)) {
      //   console.log('decorator', node);
      // }
    }
  });

  console.log(result);

  const editedText = sourceText;
  return editedText;
}
