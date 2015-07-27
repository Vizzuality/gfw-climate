require File.expand_path('../boot', __FILE__)

require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'sprockets/railtie'
require 'active_model'
require 'rails/test_unit/railtie'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Gfwc
  class Application < Rails::Application

    config.cache_store = :redis_store, 'redis://localhost:6379/0/cache', { expires_in: 90.minutes }

    config.generators do |g|
      g.test_framework  :rspec
      g.view_specs      false
      g.helper_specs    false
      g.factory_girl    false
      g.template_engine :slim
      g.stylesheets     false
      g.javascripts     false
      g.helper          false
    end
    
  end
end
