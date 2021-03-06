/**
 * @file 单元测试
 * @author meixuguang
 */

/* eslint-disable  */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {compile, compileCode} = require('../src/index.ts');

const files = fs.readdirSync(path.resolve(__dirname, './features'));
const featureNames = files.reduce((res, file) => {
    const m = file.match(/(.+)\.ts/);
    if (m) {
        res.push(m[1]);
    }
    return res;
}, []);

function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, {encoding: 'utf-8'}, (err, data) => {
            resolve(data);
        });
    });
}

describe('features', () => {

    for (let i = 0; i < featureNames.length; i++) {
        const featureName = featureNames[i];
        it(featureName, async function () {
            this.timeout(3000);
            const phpContent = await readFile(path.resolve(__dirname, `./features/${featureName}.php`));
            const tsPath = path.resolve(__dirname, `./features/${featureName}.ts`);
            const res = compile(tsPath, {
                getNamespace(name) {
                    return `test\\${featureName}`;
                },
                showSemanticDiagnostics: false
            });
            assert.equal(res.phpCode, phpContent);
            assert.equal(res.errors.length, 0);
        });
    }

    it('compile semantic diagnostics', function () {
        this.timeout(5000);
        let res = compileCode('const a = 1; a = 2;');
        assert.equal(res.errors.length, 1);
    });

    it('compile code', function () {
        this.timeout(5000);
        let res = compileCode('var a = 1;', {namespace: 'test'});
        assert.equal(res.phpCode, '<?php\nnamespace test;\n$a = 1;\n');
    });
});

