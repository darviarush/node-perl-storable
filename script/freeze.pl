use strict;
use warnings;
#use utf8;

use Storable qw/freeze thaw/;

my $str = "Санкт-Петербург";
utf8::decode($str);

my $data = bless {
        hs_ttl => 2620672,
        display_city_as_region => 125,
        code => '7800000000000',
        city_is_fake => '0',
	city => {
		display_name => $str,
		region_name => "Санкт-Петербург",
	},
    }, "Session::City";

my $freeze = freeze ref $data? $data: \$data;
my $array = ascii($freeze);

print "Buffer.from([$array])\n";

sub ascii {
    use bytes;
    my ($x) = @_;
    utf8::is_utf8($x) && utf8::encode($x);
    return join ",", map { ord($_) } split m!!x, $x;
}