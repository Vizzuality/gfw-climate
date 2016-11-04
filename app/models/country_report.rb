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
  OUTSIDE_TREE_PLANTATIONS_BOUNDARY = "opl"
  ADMIN_BOUNDARY = "admin"

  BOUNDARIES = [ADMIN_BOUNDARY, PRIMARY_FOREST_BOUNDARY,
                OUTSIDE_TREE_PLANTATIONS_BOUNDARY]

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
    @above = options[:above] || true
    @below = options[:below] || true
    @primary_forest = options[:primary_forest] || false
    @tree_plantations = options[:tree_plantations] || false
  end

  def fetch
    url = base_path
    url += select_query
    url += where_clause

    results = {}
    results = CountryReport.get(url)["rows"]

    prepare_response(results)
  end

  def prepare_response results
    return {} if results.empty?
    response = {}
    response[:iso] = @iso
    response[:country] = results.first["country"]
    response[:emissions] = {}
    response[:emissions][:reference] = {}
    values = results.select do |t|
      t["boundary"] == ADMIN_BOUNDARY &&
        t["indicator_id"] == EMISSIONS &&
        t["sub_nat_id"] == nil &&
        t["year"] >= @reference_start_year &&
        t["year"] <= @reference_end_year
    end
    response[:emissions][:reference][:years] = values.map{|t| t["year"]}
    response[:emissions][:reference][:total] = values.inject(0){|sum,t| sum += t["value"]}
    response[:emissions][:reference][:average] = response[:emissions][:reference][:total] / values.size
    response[:emissions][:reference][:values] = values

    response[:emissions][:monitor] = {}
    values = results.select do |t|
      t["boundary"] == ADMIN_BOUNDARY &&
        t["indicator_id"] == EMISSIONS &&
        t["sub_nat_id"] == nil &&
        t["year"] >= @monitor_start_year &&
        t["year"] <= @monitor_end_year
    end
    response[:emissions][:monitor][:years] = values.map{|t| t["year"]}
    response[:emissions][:monitor][:total] = values.inject(0){|sum,t| sum += t["value"]}
    response[:emissions][:monitor][:average] = response[:emissions][:monitor][:total] / values.size
    response[:emissions][:monitor][:values] = values

    response[:forest_loss] = {}
    response[:forest_loss][:reference] = {}
    values = results.select do |t|
      t["boundary"] == ADMIN_BOUNDARY &&
        t["indicator_id"] == FOREST_LOSS &&
        t["sub_nat_id"] == nil &&
        t["year"] >= @reference_start_year &&
        t["year"] <= @reference_end_year
    end
    response[:forest_loss][:reference][:years] = values.map{|t| t["year"]}
    response[:forest_loss][:reference][:total] = values.inject(0){|sum,t| sum += t["value"]}
    response[:forest_loss][:reference][:average] = response[:forest_loss][:reference][:total] / values.size
    response[:forest_loss][:reference][:values] = values


    response[:forest_loss][:monitor] = {}
    values = results.select do |t|
      t["boundary"] == ADMIN_BOUNDARY &&
        t["indicator_id"] == FOREST_LOSS &&
        t["sub_nat_id"] == nil &&
        t["year"] >= @monitor_start_year &&
        t["year"] <= @monitor_end_year
    end
    response[:forest_loss][:monitor][:years] = values.map{|t| t["year"]}
    response[:forest_loss][:monitor][:total] = values.inject(0){|sum,t| sum += t["value"]}
    response[:forest_loss][:monitor][:average] = response[:forest_loss][:monitor][:total] / values.size
    response[:forest_loss][:monitor][:values] = values
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
    SQL
  end

  def name
    "country-report"
  end
end
