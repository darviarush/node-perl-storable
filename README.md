# NAME

node-perl-storable - � packer-unpacker for format from perl world: https://metacpan.org/pod/Storable

# VERSION

0.0.5

# DESCRIPTION

```js

class A {
    constructor() {
	    throw new Error("Create objects without constructor!");
    }

    getX() {
	    return this.x;
    }
}

let exec = require('child_process').execSync;

let stdout = exec("perl -MStorable -e 'print Storable::freeze(bless {x=>123}, A)'");

let a = require("node-perl-storable").thaw(stdout, {A});

console.log(a instanceof A, a.getX()); // --> true, 123

```

```js

const Iconv = require('iconv').Iconv;
const iconv_to_cp1251 = new Iconv('utf8', 'windows-1251');
const iconv_from_cp1251 = new Iconv('windows-1251', 'utf8');

let stdout = require('child_process').execSync(
    iconv_to_cp1251.convert(
        "perl -MStorable -e 'print Storable::freeze(\"������!\")'"));

let hello = require("node-perl-storable").thaw(stdout, {}, {
    iconv: buffer => iconv_from_cp1251.convert(buffer).toString(),
});

console.log(hello); // --> "������!"

```

# SYNOPSIS

� ����� perl ���� ���� ������ �������� ������ ��� �������� ����� ��������: �����, �������, ��������, ���������, ��������, �������� ������������, ������, ������ � �.�. �� ����������� ������� https://metacpan.org/pod/Storable.

������ ������ �������� ��������� � ������������ � �������� ������ ������ ��������� �������� �� perl �������� �� ������� ����������: mysql, memcached, tarantool � �.�.

������ ������� ������ ������������ ��� ���������� ������, ���������� �� ����� ��������, � ��������� `node`. 

# FUNCTIONS

## thaw

### ARGUMENTS

- storable - �������� ������
- classes - ������� � ��������. �������������� ��������
- options.iconv - ������� ��� ����������� ����� �� � utf8. �������������� ��������

### RETURNS

Any

# INSTALL

```sh
$ yarn add node-perl-storable
```

���

```sh
$ npm i node-perl-storable
```

# REQUIREMENTS

���

# LICENSE

Copyright (C) Yaroslav O. Kosmina.

This library is free software; you can redistribute it and/or modify
it under the same terms as Python itself.

# AUTHOR

Yaroslav O. Kosmina <darviarush@mail.ru>

# LICENSE

MIT License

Copyright (c) 2020 Yaroslav O. Kosmina


