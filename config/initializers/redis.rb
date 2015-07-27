uri    = URI.parse(ENV["REDISTOGO_URL"])
$redis = Redis::Namespace.new("gfwc", :redis => Redis.new(url: uri))