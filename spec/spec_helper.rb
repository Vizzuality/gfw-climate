require 'codeclimate-test-reporter' if ENV['CI']
require 'simplecov'
require 'coveralls'

Coveralls::Output.no_color = true

formatters = [Coveralls::SimpleCov::Formatter, SimpleCov::Formatter::HTMLFormatter]
formatters.push CodeClimate::TestReporter::Formatter if ENV['CI']

SimpleCov.formatter = SimpleCov::Formatter::MultiFormatter.new(formatters)
SimpleCov.start 'rails'

require 'vcr'
VCR.configure do |config|
  config.cassette_library_dir = "spec/fixtures/vcr_cassettes"
  config.hook_into :webmock
end

RSpec.configure do |config|
  
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

end
