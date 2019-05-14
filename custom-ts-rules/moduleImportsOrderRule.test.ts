import { lintHelper, getErrorLine } from './lint-helper';

const ruleName = 'module-imports-order';

describe('module imports order rule', () => {
  it('should not fail with wrong import order', () => {
    const sourceFile = `
      import * as React from 'react';git push -u origin master
      import { SomeGlobalModule } from '@/utils/some-util';
      import { SomeGlobalModule } from '@/modules/some-global-module1';
      import { SomeGlobalModule } from '@/modules/some-global-module2';
      import { SomeGlobalModule } from '@/components/some-global-module3';
      import { SomeLocalModule } from '../../folder/some-local-module';
      import { SomeLocalModule } from '../folder/some-local-module';
      import { SomeLocalModule } from './folder/some-local-module';
      import '../icon.svg';
      import './styles.scss';
    `;

    const result = lintHelper({ sourceFile, ruleName });
    expect(result.errorCount).toBe(0);
  });

  it('should fail because of @/util/ is higher than node_module', () => {
    const sourceFile = `
      import { SomeGlobalModule } from '@/utils/some-util';
      import * as React from 'react';
      import { SomeGlobalModule } from '@/modules/some-global-module1';
      import { SomeGlobalModule } from '@/modules/some-global-module2';
      import { SomeGlobalModule } from '@/components/some-global-module3';
      import { SomeLocalModule } from '../../folder/some-local-module';
      import { SomeLocalModule } from '../folder/some-local-module';
      import { SomeLocalModule } from './folder/some-local-module';
      import '../icon.svg';
      import './styles.scss';
    `;

    const result = lintHelper({ sourceFile, ruleName });
    expect(result.errorCount).toBe(1);
  });

  it('should fail because @/util is higher than node_module and @/component/ is higher than @/module/', () => {
    const sourceFile = `
      import { SomeGlobalModule } from '@/utils/some-util';
      import * as React from 'react';
      import { SomeGlobalModule } from '@/modules/some-global-module1';
      import { WrongModulePosition } from '@/components/wrong-module-position';
      import { SomeGlobalModule } from '@/modules/some-global-module2';
      import { SomeLocalModule } from '../../folder/some-local-module';
      import { SomeLocalModule } from '../folder/some-local-module';
      import { SomeLocalModule } from './folder/some-local-module';
      import '../icon.svg';
      import './styles.scss';
    `;

    const result = lintHelper({ sourceFile, ruleName });
    expect(result.errorCount).toBe(2);
  });

  it('should fail because of .scss is higher than @/component', () => {
    const sourceFile = `
      import * as React from 'react';
      import { SomeGlobalModule } from '@/utils/some-util';
      import { SomeGlobalModule } from '@/modules/some-global-module1';
      import { SomeGlobalModule } from '@/modules/some-global-module2';
      import './wrong-styles-position.scss';
      import { SomeGlobalModule } from '@/components/some-global-module3';
      import { SomeLocalModule } from '../../folder/some-local-module';
      import { SomeLocalModule } from '../folder/some-local-module';
      import { SomeLocalModule } from './folder/some-local-module';
      import '../icon.svg';
    `;

    const result = lintHelper({ sourceFile, ruleName });
    expect(result.errorCount).toBe(1);
  });

  it('should fail multiply times', () => {
    const sourceFile = `
      import * as React from 'react';
      import { SomeGlobalModule } from '@/utils/some-util';
      import './wrong-styles-position.scss';
      import { SomeGlobalModule } from '@/modules/some-global-module1';
      import { SomeGlobalModule } from '@/components/some-global-module3';
      import { WrongModulePosition } from '@/modules/wrong-module-position';
      import { SomeLocalModule } from '../../folder/some-local-module';
      import { SomeLocalModule } from '../folder/some-local-module';
      import { SomeLocalModule } from './folder/some-local-module';
      import '../icon.svg';
    `;

    const result = lintHelper({ sourceFile, ruleName });
    expect(result.errorCount).toBe(2);
  });

  it('should fail because dot-notation is higher than @/component/', () => {
    const sourceFile = `
      import * as React from 'react';
      import { SomeGlobalModule } from '@/utils/some-util';
      import { SomeGlobalModule } from '@/modules/some-global-module1';
      import { SomeGlobalModule } from '@/modules/some-global-module2';
      import { WrongPositionModule } from './wrong-position-local-module';
      import { SomeGlobalModule } from '@/components/some-global-module3';
      import { SomeLocalModule } from '../folder/some-local-module';
      import { SomeLocalModule } from '../../folder/some-local-module';
      import '../icon.svg';
      import './styles.scss';
    `;

    const result = lintHelper({ sourceFile, ruleName });
    expect(result.errorCount).toBe(2);
  });

  it('should fail because dot-notation is in order ../../ ./ ../', () => {
    const sourceFile = `
      import * as React from 'react';
      import { SomeGlobalModule } from '@/utils/some-util';
      import { SomeGlobalModule } from '@/modules/some-global-module1';
      import { SomeGlobalModule } from '@/modules/some-global-module2';
      import { SomeGlobalModule } from '@/components/some-global-module3';
      import { SomeLocalModule } from '../../some-local-module';
      import { WrongModulePosition } from './wrong-module-position';
      import { SomeLocalModule } from '../some-local-module';
      import '../icon.svg';
      import { SomeGlobalModule } from './styles.scss';
    `;

    const result = lintHelper({ sourceFile, ruleName });
    const errorLine = getErrorLine(result.failures);
    expect(result.errorCount).toBe(1);
  });

  it('should fail because dot-notation is in order ../ ../../ ./', () => {
    const sourceFile = `
      import * as React from 'react';
      import { SomeGlobalModule } from '@/utils/some-util';
      import { SomeGlobalModule } from '@/modules/some-global-module1';
      import { SomeGlobalModule } from '@/modules/some-global-module2';
      import { SomeGlobalModule } from '@/components/some-global-module3';
      import { SomeLocalModule } from '../some-local-module';
      import { SomeLocalModule } from '../../some-local-module';
      import { SomeLocalModule } from './some-local-module';
      import '../icon.svg';
      import './styles.scss';
    `;

    const result = lintHelper({ sourceFile, ruleName });
    expect(result.errorCount).toBe(1);
  });

  it('should fail because dot-notation is in order ./ ../ ../../', () => {
    const sourceFile = `
      import * as React from 'react';
      import { SomeGlobalModule } from '@/utils/some-util';
      import { SomeGlobalModule } from '@/modules/some-global-module1';
      import { SomeGlobalModule } from '@/modules/some-global-module2';
      import { SomeGlobalModule } from '@/components/some-global-module3';
      import { SomeLocalModule } from './some-local-module';
      import { SomeLocalModule } from '../some-local-module';
      import { SomeLocalModule } from '../../some-local-module';
      import '../icon.svg';
      import './styles.scss';
    `;

    const result = lintHelper({ sourceFile, ruleName });
    expect(result.errorCount).toBe(2);
  });

  it('should fail because extensions is in order ./ ../', () => {
    const sourceFile = `
      import * as React from 'react';
      import { SomeGlobalModule } from '@/utils/some-util';
      import { SomeGlobalModule } from '@/modules/some-global-module1';
      import { SomeGlobalModule } from '@/modules/some-global-module2';
      import { SomeGlobalModule } from '@/components/some-global-module3';
      import { SomeLocalModule } from '../../some-local-module';
      import { SomeLocalModule } from '../some-local-module';
      import { SomeLocalModule } from './some-local-module';
      import './styles2.scss';
      import '../icon2.svg';
      import '../../styles.scss';
    `;

    const result = lintHelper({ sourceFile, ruleName });
    expect(result.errorCount).toBe(2);
  });
});
