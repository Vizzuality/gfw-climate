require 'httparty'
require 'zip'

class Download
  include HTTParty

  attr_accessor :iso, :id_1, :area, :start_year, :end_year,
    :units, :indicator_ids, :thresholds

  def base_path
    "#{ENV["CDB_API_HOST"]}?q="
  end

  def initialize options
    @iso = options[:iso]
    @id_1 = options[:id_1]
    @area = options[:area]
    @start_year = options[:start_year]
    @end_year = options[:end_year]
    @units = options[:units]
    @indicator_ids = options[:widget_ids].map do |widget_id|
      Widget.find(widget_id).indicators.map{ |i| i["id"] }
    end.flatten
    @thresholds = options[:thresholds]
  end

  def as_zip
    validate_download
    response = self.class.get(query_url)
    if response['error'].present?
      raise CartoDbError, response['error']
      return
    end
    results = response["rows"]
    files = results_to_files(results)
    temp_file = Tempfile.new("my_zip.zip")
    Zip::File.open(temp_file.path, Zip::File::CREATE) do |zipfile|
      files.each do |filename, path|
        # Two arguments:
        # # - The name of the file as it will appear in the archive
        # # - The original file, including the path to find it
        zipfile.add("indicators/#{filename}", path)
      end
    end
    temp_file
  end

  def results_to_csv results
    file_names = []
    grouped = results.group_by{|t| t["indicator_name"]}
    grouped.each do |id, data|
      csv_file = Tempfile.new([id, ".csv"])
      file_names << ["#{id}.csv", csv_file.path]
      CSV.open(csv_file, "wb") do |csv|
        csv << data.first.keys # adds the attributes name on the first line
        data.each do |hash|
          csv << hash.values
        end
      end
    end
    file_names
  end

  alias_method :results_to_files, :results_to_csv

  def query_url
    url = base_path
    url += select_query
    url += where_clause
    url
  end

  def select_query
    <<-SQL
      SELECT values.indicator_id, values.cartodb_id AS cartodb_id,
      values.iso, values.sub_nat_id, values.boundary, values.boundary_id,
      values.thresh, values.admin0_name AS country, values.year,
      values.value, subnat.name_1 AS province,
      boundaries.boundary_name, indicators.indicator_short AS indicator_name,
      indicators.value_units AS units
      FROM #{CDB_INDICATORS_VALUES_TABLE} AS values
      INNER JOIN indicators ON values.indicator_id = indicators.indicator_id
      LEFT JOIN #{CDB_SUBNAT_TABLE} AS subnat
      ON values.sub_nat_id  = subnat.id_1 AND values.iso = subnat.iso
      LEFT JOIN #{CDB_BOUNDARIES_TABLE} AS boundaries
      ON values.boundary_id = boundaries.cartodb_id
    SQL
  end

  def where_clause
    where = <<-SQL
      WHERE values.iso = '#{@iso}'
        AND indicators.indicator_id IN (#{@indicator_ids.join(",")})
    SQL

    if @thresholds
      where += "AND thresh IN (#{@thresholds.join(",")})"
    end

    where += "AND values.boundary_id = #{@area.blank? ? ADMIN_BOUNDARY_ID : area}"
    where += "AND values.sub_nat_id #{@id_1.blank? ? 'IS NULL' : "= #{@id_1}"}"

    if @start_year && @end_year
      where += <<-SQL
        AND values.year >= #{@start_year}
        AND values.year <= #{@end_year}
      SQL
    end
    where
  end

  def validate_download
    raise "Please specify a country, param: iso" unless @iso
    if !@indicator_ids
      raise "Please specify at least one indicator, param: indicator_ids[]"
    end
  end
end
