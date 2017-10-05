class DataPortalDownload < Download
  def initialize options
    @country_codes = options[:country_codes] || []
    @jurisdiction_ids = options[:jurisdiction_ids] || []
    @area_ids = options[:area_ids] || []
    @years = options[:years] || []
    @indicator_ids = options[:indicator_ids] || []
    @thresholds = options[:thresholds] || []
    @json = options[:json]
    @pivot = options[:pivot]
  end

  def results_to_files(results)
    if @json
      results_to_json(results)
    else
      results_to_csv(results)
    end
  end

  def results_to_csv results
    file_names = []
    grouped = results.group_by{|t| t["indicator_name"]}
    grouped.each do |id, data|
      headers, rows = data_to_headers_and_rows(data)
      csv_file = Tempfile.new([id, ".csv"])
      file_names << ["#{id}.csv", csv_file.path]
      CSV.open(csv_file, "wb") do |csv|
        csv << headers # adds the attributes name on the first line
        rows.each do |hash|
          csv << headers.map { |h| hash[h] }
        end
      end
    end
    file_names
  end

  def results_to_json results
    file_names = []
    grouped = results.group_by{|t| t["indicator_name"]}
    grouped.each do |id, data|
      headers, rows = data_to_headers_and_rows(data)
      json_file = Tempfile.new([id, ".json"])
      file_names << ["#{id}.json", json_file.path]
      File.open(json_file, "wb") do |json|
        json << rows.as_json
      end
    end
    file_names
  end

  private

  def data_to_headers_and_rows(data)
    rows = []
    if @pivot
      core_headers = data.first.keys.reject{ |k| ['year', 'value'].include? k }
      years = Set.new
      data.each do |row_hash|
        row_idx = rows.find_index do |r|
          r['iso'] == row_hash['iso'] &&
            r['indicator_id'] == row_hash['indicator_id'] &&
            r['thresh'] == row_hash['thresh']
        end
        unless row_idx.present?
          row = Hash[core_headers.map { |h| [h, row_hash[h]] }]
          rows << row
          row_idx = rows.length - 1
        end
        rows[row_idx][row_hash['year'].to_s] = row_hash['value']
        years.add(row_hash['year'])
      end
      headers = core_headers + years.to_a.sort.map(&:to_s)
    else
      headers = data.first.keys
      data.each do |row_hash|
        rows << row_hash
      end
    end
    [headers, rows]
  end

  def where_clause
    where = <<-SQL
      WHERE indicators.indicator_id IN (#{@indicator_ids.join(",")})
    SQL

    if @country_codes.any?
      where += "AND values.iso IN (#{@country_codes.map { |c| "'" + c + "'"}.join(",")})"
    end

    if @thresholds.any?
      where += "AND thresh IN (#{@thresholds.join(",")})"
    end

    where += " AND values.boundary_id #{@area_ids.empty? ? "=#{ADMIN_BOUNDARY_ID}" : "IN (#{@area_ids.join(",")})"}"
    where += " AND values.sub_nat_id #{@jurisdiction_ids.empty? ? 'IS NULL' : "IN (#{@jurisdiction_ids.join(",")})"}"

    if @years.any?
      where += " AND values.year IN (#{@years.join(",")})"
    end
    where
  end

  def validate_download
    if @indicator_ids.empty?
      raise "Please specify at least one indicator, param: indicator_ids[]"
    end
  end
end
