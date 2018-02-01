# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.1'

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )

# Map assets
Rails.application.config.assets.precompile += %w( map.js )
Rails.application.config.assets.precompile += %w( map.css )


Rails.application.config.assets.precompile += %w( countries.js )
Rails.application.config.assets.precompile += %w( countries.css )

Rails.application.config.assets.precompile += %w( compare.js )
Rails.application.config.assets.precompile += %w( compare.css )

# Embed pantropical
Rails.application.config.assets.precompile += %w( embed.css )
Rails.application.config.assets.precompile += %w( embed.js )

# Static pages
Rails.application.config.assets.precompile += %w( static.js )
Rails.application.config.assets.precompile += %w( static.css )

# Data download pages
Rails.application.config.assets.precompile += %w( data-download.js )
Rails.application.config.assets.precompile += %w( data-download.css )

unless Rails.env.production?
  Rails.application.config.assets.precompile += %w( teaspoon.css )
  Rails.application.config.assets.precompile += %w( teaspoon-teaspoon.js )
end
Rails.application.config.assets.precompile += %w( spec_helper.js )
