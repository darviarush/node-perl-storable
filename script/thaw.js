#!/usr/bin/env node

class A {
    constructor () {
        throw new Error('Create objects without constructor!');
    }

    getX () {
        return this.x;
    }
}

let exec = require('child_process').execSync;

let stdout = exec('perl -MStorable -e \'print Storable::freeze(bless {x=>123}, A)\'');

let a = require('..').thaw(stdout, { A });

console.log(a instanceof A, a.getX()); // --> true, 123

