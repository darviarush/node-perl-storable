'use strict';

// Внутри tarantool-driver-а msgpack-lite конвертирует бинарные данные в unicode-строку из utf8.
// При этом символы с кодами больше 127 заменяются на код 253.
// Такая строка не может быть декодирована.
// Следующие несколько строк патчат msgpack-lite заставляя его не конвертировать строки в utf8.
const MsgpackReadFormat = require('msgpack-lite/lib/read-format.js');
const oldGetReadFormat = MsgpackReadFormat.getReadFormat;
/* istanbul ignore next */
MsgpackReadFormat.getReadFormat = function getReadFormat () {
    let format = oldGetReadFormat.apply(this, arguments);
    format.str = format.bin;

    return format;
};

const TarantoolConnection = require('tarantool-driver');
const thaw = require('../../node-perl-storable').thaw;
const Iconv = require('iconv').Iconv;
const iconv_cp1251 = new Iconv('windows-1251', 'utf8');
const fs = require("fs");

function reply(rows) {
    let i = 0;
    for(let row of rows) {
        try {
            thaw(row[2], {}, {
                iconv: buffer => iconv_cp1251.convert(buffer).toString(),
            });
        } catch(e) {
            let j = JSON.stringify({buf:row[2], err: ''+e});
            fs.writeFileSync("err"+i+".json", j);
            console.log("error!!!", i, e.message.slice(0, 50))
        }
        i++;
    }

    console.log('retrive', i);
    process.exit(0);
}

function error(err) {
    console.error(err);
    process.exit(1);
}

let tarantool = new TarantoolConnection({ host: 't1', port: '3301' });
tarantool.select('hot', 'primary', 100000, 0, 'all', []).then(reply, error);
