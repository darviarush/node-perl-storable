/**
 * Парсит данные в формате perl Storable и возвращает примитивы и объекты JavaScript
 */

// const SX_OBJECT = 0; // Already stored object
// const SX_LSCALAR = 1; // Scalar (large binary) follows (length, data)
// const SX_ARRAY = 2; // Array forthcoming (size, item list)
// const SX_HASH = 3; // Hash forthcoming (size, key/value pair list)
// const SX_REF = 4; // Reference to object forthcoming
// const SX_UNDEF = 5; // Undefined scalar
// const SX_INTEGER = 6; // Integer forthcoming
// const SX_DOUBLE = 7; // Double forthcoming
// const SX_BYTE = 8; // (signed) byte forthcoming
// const SX_NETINT = 9; // Integer in network order forthcoming
// const SX_SCALAR = 10; // Scalar (binary, small) follows (length, data)
// const SX_TIED_ARRAY = 11; // Tied array forthcoming
// const SX_TIED_HASH = 12; // Tied hash forthcoming
// const SX_TIED_SCALAR = 13; // Tied scalar forthcoming
// const SX_SV_UNDEF = 14; // Perl's immortal PL_sv_undef
// const SX_SV_YES = 15; // Perl's immortal PL_sv_yes
// const SX_SV_NO = 16; // Perl's immortal PL_sv_no
// const SX_BLESS = 17; // Object is blessed
// const SX_IX_BLESS = 18; // Object is blessed, classname given by index
// const SX_HOOK = 19; // Stored via hook, user-defined
// const SX_OVERLOAD = 20; // Overloaded reference
// const SX_TIED_KEY = 21; // Tied magic key forthcoming
// const SX_TIED_IDX = 22; // Tied magic index forthcoming
// const SX_UTF8STR = 23; // UTF-8 string forthcoming (small)
// const SX_LUTF8STR = 24; // UTF-8 string forthcoming (large)
// const SX_FLAG_HASH = 25; // Hash with flags forthcoming (size, flags, key/flags/value triplet list)
// const SX_CODE = 26; // Code references as perl source code
// const SX_WEAKREF = 27; // Weak reference to object forthcoming
// const SX_WEAKOVERLOAD = 28; // Overloaded weak reference
// const SX_VSTRING = 29; // vstring forthcoming (small)
// const SX_LVSTRING = 30; // vstring forthcoming (large)
// const SX_SVUNDEF_ELEM = 31; // array element set to &PL_sv_undef
// const SX_REGEXP = 32; // Regexp
// const SX_LOBJECT = 33; // Large object: string, array or hash (size >2G)
const SX_LAST = 34; // invalid. marker only

const RETRIVE_METHOD = [];

const STORABLE_BIN_MAJOR=	2;		/* Binary major "version" */
const STORABLE_BIN_MINOR=	11;		/* Binary minor "version" */
const BYTEORDERSTR = Buffer.alloc(8);
BYTEORDERSTR.write('12345678');

const SIZE_OF_INT = 4;
const SIZE_OF_LONG = 8;
const SIZE_OF_CHAR_PTR = 8;
const SIZE_OF_NV = 8;

const SHV_RESTRICTED	=	0x01;
const SHV_K_UTF8 = 0x01;
const SHV_K_WASUTF8 = 0x02;
const SHV_K_LOCKED = 0x04;
const SHV_K_ISSV = 0x08;
//const SHV_K_PLACEHOLDER = 0x10;




class StorableReader {
    constructor (storable, bless) {
        this.storable = storable;   // буффер с данными
        this.pos = 0;               // позиция в данных
        this.aseen = [];            // значения распознанные раньше
        this.aclass = [];           // классы распознанные раньше
        this.bless = bless || {};   // классы для распознавания
    }

    /**
     * Считывает магическое число
     */
    read_magic () {
        const use_network_order = this.readUInt8();
        const version_major = use_network_order >> 1;
        const version_minor = version_major > 1 ? this.readUInt8(): 0;

        if(version_major > STORABLE_BIN_MAJOR || (version_major === STORABLE_BIN_MAJOR && version_minor > STORABLE_BIN_MINOR))
            throw new Error('Версия Storable не совпадает: требуется v'+STORABLE_BIN_MAJOR+'.'+STORABLE_BIN_MINOR+', а данные имеют версию v'+version_major+'.'+version_minor);

        if(use_network_order & 0x1)
            return; /* OK */

        const length_magic = this.readUInt8();
        const use_NV_size = version_major >= 2 && version_minor >= 2? 1: 0;
        const buf = this.read(length_magic);
        
        if(!buf.equals(BYTEORDERSTR)) throw new Error('Магическое число не совпадает');

        if(this.readInt8() !== SIZE_OF_INT) throw new Error('Integer size is not compatible');
        if(this.readInt8() !== SIZE_OF_LONG) throw new Error('Long integer size is not compatible');
        if(this.readInt8() !== SIZE_OF_CHAR_PTR) throw new Error('Pointer size is not compatible');
        if (use_NV_size) {
            if (this.readInt8() !== SIZE_OF_NV) throw new Error('Double size is not compatible');
        }
    }

    /**
     * Сохраняет в aseen извлечённое из буфера значение и возвращает его
     * @param sv
     * @returns {*}
     */
    seen (sv) {
        this.aseen.push(sv);

        return sv;
    }

    /**
     * Считывает структуру рекурсивно
     * @returns {any}
     */
    retrieve () {
        const type = this.readUInt8();

        //console.log(type);

        return RETRIVE_METHOD[type > SX_LAST? SX_LAST: type].call(this);
    }

    retrieve_object () {
        let tag = this.readInt32BE();
        if(tag<0 || tag >= this.aseen.length) throw Error('Object #'+tag+' out of range');

        return this.aseen[tag];
    }

    retrieve_other () {
        throw new Error('Структура Storable повреждена');
    }

    retrieve_byte () {
        return this.seen(this.readUInt8() - 128);
    }

    retrieve_integer () {
        return this.seen(this.storable.readIntLE((this.pos += SIZE_OF_LONG) - SIZE_OF_LONG, 6));
    }

    retrieve_double () {
        return this.seen(this.storable.readDoubleLE((this.pos += SIZE_OF_LONG) - SIZE_OF_LONG));
    }

    retrieve_scalar () {
        let len = this.readUInt8();

        return this.seen( this.get_lstring(len) );
    }

    retrieve_lscalar () {
        let len = this.readInt32LE();

        return this.seen(this.get_lstring(len));
    }

    retrieve_utf8str () {
        let len = this.readUInt8();

        return this.seen(this.read(len).toString('utf8'));
    }

    retrieve_array () {
        let len = this.readInt32LE();
        let array = this.seen([]);
        for (let i = 0; i < len; i++) {
            array.push( this.retrieve() );
        }

        return array;
    }

    /**
     * Аналога ссылки perl-а в Js нет, в Js всё ссылки, поэтому возвращаем значение так
     * @returns {*}
     */
    retrieve_ref () {
        return this.seen( this.retrieve() );
    }

    retrieve_hash () {
        let len = this.readInt32LE();
        let hash = this.seen({});
        for (let i = 0; i < len; i++) {
            let value = this.retrieve();
            let size = this.readInt32LE();
            let key = this.get_lstring(size);
            hash[key] = value;
        }

        return hash;
    }

    retrieve_flag_hash () {
        let hash_flags = this.readUInt8();
        let len = this.readInt32LE();
        let hash = this.seen({});

        for (let i = 0; i < len; i++) {
            let value = this.retrieve();
            let flags = this.readUInt8();
            let key;

            if (flags & SHV_K_ISSV) {
                /* XXX you can't set a placeholder with an SV key.
                   Then again, you can't get an SV key.
                   Without messing around beyond what the API is supposed to do.
                */
                key = this.retrieve();
            } else {
                let size = this.readInt32LE();
                key = this.get_lstring(size, flags & (SHV_K_UTF8 | SHV_K_WASUTF8));
            }

            if ((hash_flags & SHV_RESTRICTED) && (flags & SHV_K_LOCKED))
                Object.defineProperty(hash, key, {
                    value,
                    writable: false,
                    configurable: false,
                    enumerable: true,
                });
            else
                hash[key] = value;

        }

        return hash;
    }

    retrieve_undef () {
        return this.seen(null);
    }

    retrieve_blessed () {
        let len = this.readUInt8();

        if (len & 0x80)
            len = this.readInt32LE();

        let classname = this.get_lstring(len);
        this.aclass.push(classname);

        let sv = this.retrieve();

        // делаем класс F одинаковым с классом this.bless[classname]
        // объекты класса F будут "instanceof A"
        let Parent = classname in this.bless? this.bless[classname]:            sv instanceof Array? Array:            Object;

        // тут создаётся объект класса classname без вызова конструктора
        let F = eval('let F = class '+classname+' extends Parent {}; F');

        Parent = null; // для eslint

        let obj = new F();

        // переписываем свойства
        if(obj instanceof Array && sv instanceof Array) {
            for (let i=0, n=sv.length; i<n; i++)
                obj[i] = sv[i];
        } else {
            for (let key in sv)
                obj[key] = sv[key];
        }

        return obj;
    }

    readUInt8 () {
        return this.storable.readUInt8(this.pos++);
    }

    readInt32LE () {
        return this.storable.readInt32LE((this.pos += SIZE_OF_INT)- SIZE_OF_INT);
    }

    readInt32BE () {
        return this.storable.readInt32BE((this.pos += SIZE_OF_INT)- SIZE_OF_INT);
    }

    readInt8 () {
        return this.storable.readInt8(this.pos++);
    }

    read (length) {
        return this.storable.slice(this.pos, this.pos+=length);
    }

    is_ascii (buffer) {
        for (let i = 0, n = buffer.length; i < n; i++) {
            if(buffer[i] > 127) return false;
        }

        return true;
    }

    get_lstring (length, in_utf8) {
        if(length === 0) return '';
        let s = this.read(length);
        if(in_utf8) return s.toString('utf8');
        if(this.is_ascii(s)) return s.toString('ascii');

        return s;
    }

    end () {
        if(this.pos !== this.storable.length) throw new Error('Структура не разобрана до конца');
    }
}

const storable_reader_proto = StorableReader.prototype;

RETRIVE_METHOD.push(
    storable_reader_proto.retrieve_object,	/* SX_OBJECT -- entry unused dynamically */
    storable_reader_proto.retrieve_lscalar,	/* SX_LSCALAR */
    storable_reader_proto.retrieve_array,	/* SX_ARRAY */
    storable_reader_proto.retrieve_hash,	/* SX_HASH */
    storable_reader_proto.retrieve_ref,	    /* SX_REF */
    storable_reader_proto.retrieve_undef,	/* SX_UNDEF */
    storable_reader_proto.retrieve_integer,	/* SX_INTEGER */
    storable_reader_proto.retrieve_double,	/* SX_DOUBLE */
    storable_reader_proto.retrieve_byte,	/* SX_BYTE */
    storable_reader_proto.retrieve_netint,	/* SX_NETINT */
    storable_reader_proto.retrieve_scalar,	/* SX_SCALAR */
    storable_reader_proto.retrieve_tied_array,	/* SX_TIED_ARRAY */
    storable_reader_proto.retrieve_tied_hash,	/* SX_TIED_HASH */
    storable_reader_proto.retrieve_tied_scalar,/* SX_TIED_SCALAR */
    storable_reader_proto.retrieve_sv_undef,	/* SX_SV_UNDEF */
    storable_reader_proto.retrieve_sv_yes,	/* SX_SV_YES */
    storable_reader_proto.retrieve_sv_no,	/* SX_SV_NO */
    storable_reader_proto.retrieve_blessed,	/* SX_BLESS */
    storable_reader_proto.retrieve_idx_blessed,/* SX_IX_BLESS */
    storable_reader_proto.retrieve_hook,	/* SX_HOOK */
    storable_reader_proto.retrieve_overloaded,	/* SX_OVERLOAD */
    storable_reader_proto.retrieve_tied_key,	/* SX_TIED_KEY */
    storable_reader_proto.retrieve_tied_idx,	/* SX_TIED_IDX */
    storable_reader_proto.retrieve_utf8str,	/* SX_UTF8STR  */
    storable_reader_proto.retrieve_lutf8str,	/* SX_LUTF8STR */
    storable_reader_proto.retrieve_flag_hash,	/* SX_FLAG_HASH */
    storable_reader_proto.retrieve_code,	/* SX_CODE */
    storable_reader_proto.retrieve_weakref,	/* SX_WEAKREF */
    storable_reader_proto.retrieve_weakoverloaded,/* SX_WEAKOVERLOAD */
    storable_reader_proto.retrieve_vstring,	/* SX_VSTRING */
    storable_reader_proto.retrieve_lvstring,	/* SX_LVSTRING */
    storable_reader_proto.retrieve_svundef_elem,/* SX_SVUNDEF_ELEM */
    storable_reader_proto.retrieve_regexp,	/* SX_REGEXP */
    storable_reader_proto.retrieve_lobject,	/* SX_LOBJECT */
    storable_reader_proto.retrieve_other,  	/* SX_LAST */
);

module.exports = function PerlStorableThaw (storable, bless) {
    const stream = new StorableReader(storable, bless);
    stream.read_magic();
    let result = stream.retrieve();
    stream.end();

    return result;
};
