Rabl.configure do |config|
  config.view_paths = [Rails.root.join('app', 'views', 'api', 'v1')]
  config.exclude_nil_values = true
  config.exclude_empty_values_in_collections = true
  config.include_json_root = false
  config.include_child_root = true
end