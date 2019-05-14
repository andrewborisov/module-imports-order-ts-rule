# Module imports order ts rule

This tslint rule helps you to keep imports in far-close order, like:
```
 node_module
 @/utils/
 @/modules/
 @/components/
 ../
 ./
 ../*.*
 ./*.*
```

## Installation & Usage
 Install via npm:

 ```
 npm i module-imports-order-ts-rule --save-dev
 ```

 then you should add configuration to your tsconfig.js
 ```
 rulesDirectory: ['node_modules/module-imports-order-ts-rule'],
 rules: {
    "module-imports-order"; [true, [
    "node_modules", "@/", "dot-notation", "extensions"
    ]];
 }
 ```

