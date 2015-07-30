module Concerns::Cached
  extend ActiveSupport::Concern
  
  def timeouts
    begin
      yield
    rescue Net::OpenTimeout, Net::ReadTimeout
      {}
    end
  end

  def cache_key_items(options)
    "#{ self.name.pluralize.downcase }_all_#{ options }"
  end

  def cache_key_item(options)
    "#{ self.name.downcase }/item_#{ options }"
  end

  def items_caching(options=nil)
    if cached = $redis.get(cache_key_items(options))
      JSON.parse(cached)
    else
      yield.tap do |items|
        $redis.set(cache_key_items(options), items.to_json)
      end
    end
  end

  def item_caching(options, format=nil)
    if cached = $redis.get(cache_key_item(options))
      if format.present?
        cached
      else
        JSON.parse(cached)
      end
    else
      yield.tap do |item|
        if format.present?
          $redis.set(cache_key_item(options), item.to_s)
        else
          $redis.set(cache_key_item(options), item.to_json)
        end
      end
    end
  end
  
end