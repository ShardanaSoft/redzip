'use strict';

const {join} = require('path');
const {Readable} = require('stream');
const {readFile} = require('fs/promises');

const {test} = require('supertape');
const tryToCatch = require('try-to-catch');
const mockFs = require('mock-fs');
const remove = require('.');
const {read, write} = require('..');

test('redzip: zip: remove', async (t) => {
    const originalOuterPath = join(__dirname, 'fixture/hello.zip');
    
    const outerPath = '/fixture/hello.zip';
    const innerPath = '/world.txt';
    
    const restoreFs = await mockFile(originalOuterPath);
    
    await write(outerPath, innerPath, Readable.from('hello'));
    await remove(outerPath, innerPath);
    const [error] = await tryToCatch(read, outerPath, innerPath);
    
    restoreFs();
    
    t.equal(error.message, `ENOENT: no such file or directory, open '/world.txt'`);
    t.end();
});

async function mockFile(path) {
    mockFs({
        '/fixture': {
            'hello.zip': await readFile(path),
        },
    });
    
    return mockFs.restore;
}