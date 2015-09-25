# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

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

unless Rails.env.production?
  Rails.application.config.assets.precompile += %w( teaspoon.css )
  Rails.application.config.assets.precompile += %w( teaspoon-teaspoon.js )
end
