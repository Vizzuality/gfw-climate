require 'httparty'

class CountryReport
  include HTTParty
  include Concerns::Cached
  default_timeout 10

  FOREST_LOSS = 1
  EMISSIONS = 14
  ABOVE_C_DENSITY = 11
  BELOW_C_DENSITY = 39
  ABOVE_C_STOCKS = 5
  BELOW_C_STOCKS = 7

  INDICATORS = [FOREST_LOSS, EMISSIONS, ABOVE_C_DENSITY, BELOW_C_DENSITY,
                ABOVE_C_STOCKS, BELOW_C_STOCKS]

  BELOWGROUND_EMISSIONS_FACTOR = 1.26
  PRIMARY_FOREST_BOUNDARY = "prf"
  INSIDE_PLANTATIONS_BOUNDARY = "plt"
  ADMIN_BOUNDARY = "admin"

  BOUNDARIES = [ADMIN_BOUNDARY, PRIMARY_FOREST_BOUNDARY,
                INSIDE_PLANTATIONS_BOUNDARY]

  def base_path
    "#{ENV["CDB_API_HOST"]}?q="
  end

  def initialize options
    @iso = options[:iso] || "BRA"
    @reference_start_year = options[:reference_start_year].try(:to_i) || 2001
    @reference_end_year = options[:reference_end_year].try(:to_i) || 2010
    @monitor_start_year = options[:monitor_start_year].try(:to_i) || 2011
    @monitor_end_year = options[:monitor_end_year].try(:to_i) || 2014
    @thresh = options[:thresh].try(:to_i) || 30
    @below = options[:below] && options[:below] == "true"
    @primary_forest = options[:primary_forest] && options[:primary_forest] == "true"
    @tree_plantations = options[:tree_plantations] && options[:tree_plantations] == "true"

    @use_boundary = @primary_forest ? PRIMARY_FOREST_BOUNDARY : ADMIN_BOUNDARY
  end

  def fetch
    url = base_path
    url += select_query
    url += where_clause

    puts url

    results = {}
    results = CountryReport.get(url)["rows"]

    prepare_response(results)
  end

  def prepare_response results
    return {} if !results || results.empty?
    response = {}
    response[:iso] = @iso
    response[:country] = results.first["country"]
    response[:primary_forest_only] = @primary_forest
    response[:exclude_tree_plantations] = @tree_plantations

    response[:emissions] = {}
    response[:emissions][:reference] = parse_country_data_for(results,
                                                              EMISSIONS,
                                                              :reference)

    response[:emissions][:monitor] = parse_country_data_for(results,
                                                            EMISSIONS,
                                                            :monitor)

    response[:forest_loss] = {}
    response[:forest_loss][:reference] = parse_country_data_for(results,
                                                                FOREST_LOSS,
                                                                :reference)

    response[:forest_loss][:monitor] = parse_country_data_for(results,
                                                              FOREST_LOSS,
                                                              :monitor)

    response[:emission_factors] = emission_factors_from results

    response[:provinces] = emissions_per_provinces results

    response
  end

  def parse_country_data_for(data, indicator, period=:reference)
    result = {}
    start_year = period == :reference ? @reference_start_year : @monitor_start_year
    end_year = period == :reference ? @reference_end_year : @monitor_end_year

    values = data.select do |t|
      t["boundary"] == @use_boundary &&
        t["indicator_id"] == indicator &&
        t["sub_nat_id"] == nil &&
        t["year"] >= start_year &&
        t["year"] <= end_year
    end
    if @below && indicator == EMISSIONS
      values.each do |t|
        t["value"] = t["value"] * BELOWGROUND_EMISSIONS_FACTOR
      end
    end
    result[:years] = values.map{|t| t["year"]}
    result[:total] = values.inject(0){|sum,t| sum += t["value"]}
    result[:average] = values.empty? ? 0 : result[:total] / values.size
    result[:values] = values
    result
  end

  def get_province_vals_for(data, indicator, period=:reference)
    start_year = period == :reference ? @reference_start_year : @monitor_start_year
    end_year = period == :reference ? @reference_end_year : @monitor_end_year

    values = data.select do |t|
      t["boundary"] == @use_boundary &&
        t["indicator_id"] == indicator &&
        !t["sub_nat_id"].nil? &&
        t["year"] >= start_year &&
        t["year"] <= end_year
    end.group_by{|t| t["sub_nat_id"]}

    if @below && indicator == EMISSIONS
      values.each do |t|
        t["value"] = t["value"] * BELOWGROUND_EMISSIONS_FACTOR
      end
    end

    provinces = []
    values.each do |sub_nat_id, vals|
      r = {}
      sample = vals.first
      r[:sub_nat_id] = sub_nat_id
      r[:province] = sample["province"]
      r[:indicator_id] = sample["indicator_id"]
      r[:boundary] = sample["boundary"]
      r[:thresh] = sample["thresh"]
      r[:boundary_name] = sample["boundary_name"]
      r[:value] = vals.inject(0){|sum,t| sum += t["value"]}
      provinces << r
    end
    provinces.sort{|a,b| b[:value] <=> a[:value]}
  end

  def emissions_per_provinces data
    result = {}

    result[:forest_loss] = {}

    result[:forest_loss][:reference] = {}
    provinces = get_province_vals_for(data, FOREST_LOSS, :reference)
    result[:forest_loss][:reference][:top_five] = provinces[0,5]
    result[:forest_loss][:reference][:others] = {}
    if provinces.size > 5
      result[:forest_loss][:reference][:others] = {
        size: provinces.size - 5,
        value: provinces[6, provinces.size].inject(0){|sum, t| sum += t[:value]}
      }
    end

    result[:forest_loss][:monitor] = {}
    provinces = get_province_vals_for(data, FOREST_LOSS, :monitor)
    result[:forest_loss][:monitor][:top_five] = provinces[0,5]
    result[:forest_loss][:monitor][:others] = {}
    if provinces.size > 5
      result[:forest_loss][:monitor][:others] = {
        size: provinces.size - 5,
        value: provinces[6, provinces.size].inject(0){|sum, t| sum += t[:value]}
      }
    end

    result[:emissions] = {}

    result[:emissions][:reference] = {}
    provinces = get_province_vals_for(data, EMISSIONS, :reference)
    result[:emissions][:reference][:top_five] = provinces[0,5]
    result[:emissions][:reference][:others] = {}
    if provinces.size > 5
      result[:emissions][:reference][:others] = {
        size: provinces.size - 5,
        value: provinces[6, provinces.size].inject(0){|sum, t| sum += t[:value]}
      }
    end

    result[:emissions][:monitor] = {}
    provinces = get_province_vals_for(data, EMISSIONS, :monitor)
    result[:emissions][:monitor][:top_five] = provinces[0,5]
    result[:emissions][:monitor][:others] = {}
    if provinces.size > 5
      result[:emissions][:monitor][:others] = {
        size: provinces.size - 5,
        value: provinces[6, provinces.size].inject(0){|sum, t| sum += t[:value]}
      }
    end

    # No reference as there's no years
    result[:c_stocks] = {}

    indicators = []
    indicators << ABOVE_C_STOCKS if @above
    indicators << BELOW_C_STOCKS if @below

    values = data.select do |t|
      t["boundary"] == @use_boundary &&
        indicators.include?(t["indicator_id"]) &&
        !t["sub_nat_id"].nil? &&
        t["year"] = 0
    end.group_by{|t| t["sub_nat_id"]}
    provinces = []
    values.each do |sub_nat_id, vals|
      r = {}
      sample = vals.first
      r[:sub_nat_id] = sub_nat_id
      r[:province] = sample["province"]
      r[:indicator_id] = sample["indicator_id"]
      r[:boundary] = sample["boundary"]
      r[:thresh] = sample["thresh"]
      r[:boundary_name] = sample["boundary_name"]
      r[:value] = vals.inject(0){|sum,t| sum += t["value"]}
      provinces << r
    end
    provinces = provinces.sort{|a,b| b[:value] <=> a[:value]}
    result[:c_stocks][:top_five] = provinces[0,5]
    result[:c_stocks][:others] = {}
    if provinces.size > 5
      result[:c_stocks][:others] = {
        size: provinces.size - 5,
        value: provinces[6, provinces.size].inject(0){|sum, t| sum += t[:value]}
      }
    end
    result
  end

  def emission_factors_from data
    response = {}

    total = 0
    val = data.select do |t|
      t["boundary"] == @use_boundary &&
        t["indicator_id"] == ABOVE_C_DENSITY &&
        t["sub_nat_id"] == nil &&
        t["year"] = 0
    end.first
    total += (val ? val["value"] : 0)
    above = val and val["value"] or nil

    below = if @below
              val = data.select do |t|
                t["boundary"] == @use_boundary &&
                  t["indicator_id"] == BELOW_C_DENSITY &&
                  t["sub_nat_id"] == nil &&
                  t["year"] = 0
              end.first
              total += (val ? val["value"] : 0)
              val and val["value"] or nil
            else
              nil
            end
    response[:aboveground] = above
    response[:belowground] = below
    response[:total] = total
    response
  end

  def select_query
    <<-SQL
      SELECT indicator_id, values.cartodb_id AS cartodb_id,
      values.iso, values.sub_nat_id, values.boundary, values.boundary_id,
      values.thresh, values.admin0_name AS country, values.year,
      values.value, subnat.name_1 AS province,
      boundaries.boundary_name
      FROM #{CDB_INDICATORS_VALUES_TABLE} AS values
      LEFT JOIN #{CDB_SUBNAT_TABLE} AS subnat
      ON values.sub_nat_id  = subnat.id_1 AND values.iso = subnat.iso
      LEFT JOIN #{CDB_BOUNDARIES_TABLE} AS boundaries
      ON values.boundary_id = boundaries.cartodb_id
    SQL
  end

  def where_clause
    <<-SQL
      WHERE values.iso = '#{@iso}'
        AND indicator_id IN (#{INDICATORS.join(",")})
        AND thresh IN (#{@thresh}, 0)
        AND boundary IN (#{BOUNDARIES.map{|t| "'#{t}'"}.join(",")})
        AND ((values.year >= #{@reference_start_year}
        AND values.year <= #{@monitor_end_year})
        OR values.year = 0)
    SQL
  end

  def name
    "country-report"
  end
end
