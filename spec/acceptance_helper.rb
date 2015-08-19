require 'rails_helper'
require 'rspec_api_documentation'
require 'rspec_api_documentation/dsl'

RspecApiDocumentation.configure do |config|
  config.format = :json
  config.curl_headers_to_filter = nil
  config.curl_host = 'http://gfwc-staging.herokuapp.com'
  config.api_name  = "API GFW-CLIMATE"
end

Raddocs.configure do |config|
  config.docs_dir   = "api/docs"
  config.api_name   = "API GFW-CLIMATE"
end