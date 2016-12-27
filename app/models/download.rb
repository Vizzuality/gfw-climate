require 'httparty'

class Download
  include HTTParty

  attr_accessor :iso, :id_1, :area, :start_year, :end_year,
    :units, :indicator_ids, :thresholds

  def initialize options
    @iso = options[:iso]
    @id_1 = options[:id_1]
    @area = options[:area]
    @start_year = options[:start_year]
    @end_year = options[:end_year]
    @units = options[:units]
    @indicator_ids = options[:indicator_ids]
    @thresholds = options[:thresholds]
  end

  def as_zip
    validate_download
    []
  end


  def validate_download
    raise "Please specify a country, param: iso" unless @iso
    if !@indicator_ids
      raise "Please specify at least one indicator, param: indicator_ids[]"
    end
  end
end
