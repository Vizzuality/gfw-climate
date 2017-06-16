class DataPortalDownload < Download
  def initialize options
    @json = options[:json]
    @pivot = options[:pivot]
    super
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
        row_idx = rows.find_index { |r| r['indicator_id'] == row_hash['indicator_id'] && r['threshold'] == row_hash['threshold'] }
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
end
