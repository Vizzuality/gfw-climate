require 'httparty'

class CountryReport
  include HTTParty
  include Concerns::Cached
  default_timeout 10

  FOREST_LOSS = 1110
  EMISSIONS = 3012
  ABOVE_C_DENSITY = 78
  BELOW_C_DENSITY = 2311
  ABOVE_C_STOCKS = 2110
  BELOW_C_STOCKS = 2111

  COUNTRY_AREA = 4110

  INDICATORS = [FOREST_LOSS, EMISSIONS, ABOVE_C_DENSITY, BELOW_C_DENSITY,
                ABOVE_C_STOCKS, BELOW_C_STOCKS, COUNTRY_AREA]

  BELOWGROUND_EMISSIONS_FACTOR = 1.26
  PRIMARY_FOREST_BOUNDARY = "prf"
  INSIDE_PLANTATIONS_BOUNDARY = "plt"
  ADMIN_BOUNDARY = "admin"

  BOUNDARIES = [ADMIN_BOUNDARY, PRIMARY_FOREST_BOUNDARY,
                INSIDE_PLANTATIONS_BOUNDARY]

  AF_COUNTRIES = [
    'DZA', 'AGO', 'SHN', 'BEN', 'BWA', 'BFA', 'BDI', 'CMR', 'CPV',
    'CAF', 'TCD', 'COM', 'COG', 'COD', 'DJI', 'EGY', 'GNQ', 'ERI',
    'ETH', 'GAB', 'GMB', 'GHA', 'GIN', 'GNB', 'CIV', 'KEN', 'LSO',
    'LBR', 'LBY', 'MDG', 'MWI', 'MLI', 'MRT', 'MUS', 'MYT', 'MAR',
    'MOZ', 'NAM', 'NER', 'NGA', 'STP', 'REU', 'RWA', 'STP', 'SEN',
    'SYC', 'SLE', 'SOM', 'ZAF', 'SSD', 'SHN', 'SDN', 'SWZ', 'TZA',
    'TGO', 'TUN', 'UGA', 'COD', 'ZMB', 'TZA', 'ZWE'
  ]

  AS_COUNTRIES = [
    'AFG', 'ARM', 'AZE', 'BHR', 'BGD', 'BTN', 'BRN', 'KHM', 'CHN',
    'CXR', 'CCK', 'IOT', 'GEO', 'HKG', 'IND', 'IDN', 'IRN', 'IRQ',
    'ISR', 'JPN', 'JOR', 'KAZ', 'KWT', 'KGZ', 'LAO', 'LBN', 'MAC',
    'MYS', 'MDV', 'MNG', 'MMR', 'NPL', 'PRK', 'OMN', 'PAK', 'PSE',
    'PHL', 'QAT', 'SAU', 'SGP', 'KOR', 'LKA', 'SYR', 'TWN', 'TJK',
    'THA', 'TUR', 'TKM', 'ARE', 'UZB', 'VNM', 'YEM'
  ]

  SA_COUNTRIES = [
    'ARG', 'BOL', 'BRA', 'CHL', 'COL', 'ECU', 'FLK', 'GUF', 'GUF',
    'GUY', 'PRY', 'PER', 'SUR', 'URY', 'VEN'
  ]

  CONTINENTS = {
    AF: {
      name: 'Africa',
      countries: AF_COUNTRIES
    },
    AS: {
      name: 'Asia',
      countries: AS_COUNTRIES
    },
    SA: {
      name: 'South America',
      countries: SA_COUNTRIES
    },
    PT: {
      name: 'Pantropical',
      countries: AF_COUNTRIES + AS_COUNTRIES + SA_COUNTRIES
    }
  }

  def base_path
    "#{ENV["CDB_API_HOST"]}?q="
  end

  def initialize options
    @iso = options[:iso] || 'BRA'
    @reference_start_year = options[:reference_start_year].try(:to_i) || 2001
    @reference_end_year = options[:reference_end_year].try(:to_i) || 2010
    @monitor_start_year = options[:monitor_start_year].try(:to_i) || 2011
    @monitor_end_year = options[:monitor_end_year].try(:to_i) || 2014
    @thresh = options[:thresh].try(:to_i) || 30
    @below = options[:below] && options[:below] == "true"
    @primary_forest = options[:primary_forest] &&
      options[:primary_forest] == "true"
    @exclude_plantations = options[:exclude_plantations] &&
      options[:exclude_plantations] == "true"

    @use_boundary = @primary_forest ? PRIMARY_FOREST_BOUNDARY : ADMIN_BOUNDARY
  end

  def fetch
    url = base_path
    if @iso.length == 2 && CONTINENTS.keys.include?(@iso.to_sym)
      url += continents_query
    else
      url += select_query
      url += where_clause
    end
    url += ' ORDER BY year'

    puts url.inspect

    results = {}
    results = CountryReport.get(url)["rows"]

    prepare_response(results)
  end

  def prepare_response results
    return {} if !results || results.empty?
    response = {}
    response[:iso] = @iso
    response[:country] = results.first["country"]
    area_val = results.select{|t| t["indicator_id"] == COUNTRY_AREA}.first
    response[:area] = area_val && area_val["value"] or nil
    response[:thresh] = @thresh
    response[:reference_start_year] = @reference_start_year
    response[:reference_end_year] = @reference_end_year
    response[:monitor_start_year] = @monitor_start_year
    response[:monitor_end_year] = @monitor_end_year

    response[:primary_forest_only] = @primary_forest
    response[:exclude_tree_plantations] = @exclude_plantations
    response[:exclude_tree_plantations_available] = results.
      select{|t| t["boundary_code"] == INSIDE_PLANTATIONS_BOUNDARY}.present?

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
      t["boundary_code"] == @use_boundary &&
        t["indicator_id"] == indicator &&
        t["sub_nat_id"] == nil &&
        t["year"] >= start_year &&
        t["year"] <= end_year &&
        t["thresh"] == @thresh
    end
    if @below && indicator == EMISSIONS
      values.each do |t|
        t["value"] = t["value"] * BELOWGROUND_EMISSIONS_FACTOR
      end
    end

    if @exclude_plantations
      excluded_vals = data.select do |t|
        t["boundary_code"] == INSIDE_PLANTATIONS_BOUNDARY &&
          t["indicator_id"] == indicator &&
          t["sub_nat_id"] == nil &&
          t["year"] >= start_year &&
          t["year"] <= end_year
      end
      values.each do |t|
        exclude = excluded_vals.select{|p| p["year"] == t["year"]}.first
        if exclude && exclude["value"]
          t["value"] = t["value"] - exclude["value"]
        end
      end
    end

    result[:years] = values.map{|t| t["year"]}
    result[:total] = values.inject(0){|sum,t| sum += t["value"]}
    result[:average] = values.empty? ? 0 : result[:total] / values.size
    result[:values] = values.map do |t|
      {
        indicator_id: t["indicator_id"],
        cartodb_id: t["cartodb_id"],
        year: t["year"],
        value: t["value"],
        country: t["country"],
        iso: t["iso"],
        boundary: t["boundary_code"],
        boundary_name: t["boundary_name"]
      }
    end
    result
  end

  def get_province_vals_for(data, indicator)

    values = data.select do |t|
      t["boundary_code"] == @use_boundary &&
        t["indicator_id"] == indicator &&
        !t["sub_nat_id"].nil? &&
        t["thresh"] == @thresh
    end.group_by{|t| t["sub_nat_id"]}

    provinces = []
    values.each do |sub_nat_id, vals|
      r = {}
      sample = vals.first

      r[:sub_nat_id] = sub_nat_id
      r[:province] = sample["province"]
      r[:indicator_id] = sample["indicator_id"]
      r[:boundary] = sample["boundary_code"]
      r[:thresh] = sample["thresh"]
      r[:boundary_name] = sample["boundary_name"]

      if @exclude_plantations
        excluded_vals = data.select do |t|
          t["boundary_code"] == INSIDE_PLANTATIONS_BOUNDARY &&
            t["indicator_id"] == indicator &&
            t["sub_nat_id"] == sub_nat_id
        end
        vals.each do |t|
          exclude = excluded_vals.select{|p| p["year"] == t["year"]}.first
          if exclude && exclude["value"]
            t["value"] = t["value"] - exclude["value"]
          end
        end
      end
      ref_vals = vals.select{|t| t["year"] >= @reference_start_year && t["year"] <= @reference_end_year }
      r[:reference_avg] = ref_vals.empty? ? nil : ref_vals.inject(0){|sum,t| sum += t["value"]} / ref_vals.size

      monit_vals = vals.select{|t| t["year"] >= @monitor_start_year && t["year"] <= @monitor_end_year }
      r[:monitor_avg] = monit_vals.empty? ? nil : monit_vals.inject(0){|sum,t| sum += t["value"]} / monit_vals.size

      next unless r[:reference_avg] && r[:monitor_avg] && r[:reference_avg] > 0

      r[:delta_perc] = (((r[:monitor_avg]-r[:reference_avg])/r[:reference_avg])*100)

      if @below && indicator == EMISSIONS
        r[:reference_avg] = r[:reference_avg] * BELOWGROUND_EMISSIONS_FACTOR
        r[:monitor_avg] = r[:monitor_avg] * BELOWGROUND_EMISSIONS_FACTOR
      end
      provinces << r
    end
    provinces.sort{|a,b| (b[:monitor_avg]-b[:reference_avg]) <=> (a[:monitor_avg]-a[:reference_avg])}
  end

  def emissions_per_provinces data
    result = {}

    result[:forest_loss] = {}
    provinces = get_province_vals_for(data, FOREST_LOSS)
    result[:forest_loss][:top_five] = provinces[0,5]


    result[:emissions] = {}
    provinces = get_province_vals_for(data, EMISSIONS)
    result[:emissions][:top_five] = provinces[0,5]

    result
  end

  def emission_factors_from data
    response = {}

    total = 0
    val = data.select do |t|
      t["boundary_code"] == @use_boundary &&
        t["indicator_id"] == ABOVE_C_DENSITY &&
        t["sub_nat_id"] == nil &&
        t["year"] = 0
    end.first
    total += (val ? val["value"] : 0)
    above = val && val["value"] or nil

    below = if @below
              val = data.select do |t|
                t["boundary_code"] == @use_boundary &&
                  t["indicator_id"] == BELOW_C_DENSITY &&
                  t["sub_nat_id"] == nil &&
                  t["year"] = 0
              end.first
              total += (val ? val["value"] : 0)
              val && val["value"] or nil
            else
              nil
            end
    response[:aboveground] = above
    response[:belowground] = below
    response[:total] = total
    response
  end

  def continents_query
    continent = CONTINENTS[@iso.to_sym]
    countries = continent[:countries]

    <<-SQL
      SELECT indicator_id, -1000 AS cartodb_id,
      '#{@iso}' AS iso, NULL AS sub_nat_id, values.boundary, values.boundary_id,
      values.thresh, '#{continent[:name]}' AS country, values.year,
      SUM(values.value) AS value, NULL AS province,
      boundaries.boundary_name
      FROM #{CDB_INDICATORS_VALUES_TABLE} AS values
      LEFT JOIN #{CDB_BOUNDARIES_TABLE} AS boundaries
      ON values.boundary_id = boundaries.cartodb_id
      WHERE values.iso IN (#{countries.map{|t| "'#{t}'"}.join(",")})
        AND indicator_id IN (#{INDICATORS.join(",")})
        AND thresh IN (#{@thresh}, 0)
        AND boundary IN (#{BOUNDARIES.map{|t| "'#{t}'"}.join(",")})
        AND ((values.year >= #{@reference_start_year}
        AND values.year <= #{@monitor_end_year})
        OR values.year = 0)
      GROUP BY indicator_id, boundary, boundary_id, thresh, year, boundary_name
    SQL
  end

  def select_query
    <<-SQL
      SELECT indicator_id, values.cartodb_id AS cartodb_id,
      values.iso, values.sub_nat_id, boundaries.boundary_name AS boundary, values.boundary_code,
      values.thresh, values.country, values.year,
      values.value, subnat.name_1 AS province,
      boundaries.boundary_name
      FROM #{CDB_INDICATORS_VALUES_TABLE} AS values
      LEFT JOIN #{CDB_SUBNAT_TABLE} AS subnat
      ON values.sub_nat_id  = subnat.id_1 AND values.iso = subnat.iso
      LEFT JOIN #{CDB_BOUNDARIES_TABLE} AS boundaries
      ON values.boundary_code = boundaries.boundary_code
    SQL
  end

  def where_clause
    <<-SQL
      WHERE values.iso = '#{@iso}'
        AND indicator_id IN (#{INDICATORS.join(",")})
        AND thresh IN (#{@thresh}, 0)
        AND values.boundary_code IN (#{BOUNDARIES.map{|t| "'#{t}'"}.join(",")})
        AND ((values.year >= #{@reference_start_year}
        AND values.year <= #{@monitor_end_year})
        OR values.year = 0)
    SQL
  end

  def name
    "country-report"
  end
end
