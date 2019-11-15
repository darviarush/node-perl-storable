#!/usr/bin/perl
use strict;
use warnings;
use utf8;
use open qw/:std :utf8/;

use Storable qw/freeze thaw/;
use JSON::XS;

my $json = JSON::XS->new->canonical->allow_nonref;

open my $f, ">", "__tests__/perl-storable-thaw.test.js" or die $!;

sub ascii {
    use bytes;
    my ($x) = @_;
    utf8::is_utf8($x) && utf8::encode($x);
    return join ",", map { ord($_) } split m!!x, $x;
}

my $x;
my $its = join "\n\n", map {
    my $name = $_->[0];
    my $data = $_->[1];
    my $freeze = freeze ref $data? $data: \$data;
    my $array = ascii($freeze);
    my $equal = $_->[2] // $json->encode($data);
    print "$name\t$freeze\n\n";
<< "END_IT"
    it('$name', () => {
        let data = Buffer.from([$array]);
        expect(thaw(data)).toEqual($equal);
    });
END_IT
}
    ["Натуральное", 123],
    ["Среднее натуральное", 128],
    ["Среднее натуральное побольше", 1_000_000],
    ["Большое натуральное", 5_000_000_000],
    ["Целое", -123],
    ["Среднее целое", -128],
    ["Среднее целое поменьше", -1_000_000],
    ["Большое целое", -5_000_000_000],
    ["Плавающее", 1.23],
    ["Плавающее отрицательное", -1.23e100, "-1.2300000000000003e+100"],
    ["Строка", "123"],
    ["Пустая строка", ""],
    ["Длинная строка", "1" x 1000, "'1'.repeat(1000)"],
    ["Строка no utf8", do { $x="Привет!"; utf8::encode($x); $x}, "Buffer.from([".ascii($x)."])"],
    ["Строка в utf8", "Привет!"],
    ["Скаляр", $x = do { my $x = -1.23; my $y=int $x; "$x" }],
    ["Массив", [123, -1.23, "123", "Привет!"]],
    ["Хеш", {1 => 23, -1.56e10 => -1.23, u => "123",  "Привет!" => [1, 2, 3], tip => {x => undef} }],
    ["Неопределённое значение", undef],
    ["Вложенный Массив", [123, -1.23, "123", [1, 2, 3], "Привет!"]],
    ["Рекурсивный Массив", do {
        my $x = [123, -1.23, undef, "123", "1" x 1000, [5], {x=>6}, "Привет!"];
        push @$x, $x;
        $x
    }, "(() => { let x=[123, -1.23, null, '123', '1'.repeat(1000), [5], {x: 6}, 'Привет!']; x.push(x); return x })()"],
    ["Объект", bless({x=>6}, "A"), "(() => { class A { constructor() { this.x=6 } }; return new A() })()"],
    ["Объект-массив", bless([5, "abc"], "A"), "(() => { class A { constructor() { this[0]=5; this[1]='abc' } }; return new A() })()"],
    ;


print $f +<< "END";
/**
 * ВНИМАНИЕ!!!
 *   Тест сгенерирован утилитой $0.
 *   Ничего не менять: перетрётся.
 */
const thaw = require("../lib/perl-storable-thaw");

describe('perl-storable-thaw', () => {

$its

});
END

close $f;