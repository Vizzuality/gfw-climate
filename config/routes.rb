Rails.application.routes.draw do

  # Accept terms
  post 'accept',       to: 'access#accept_and_redirect', as: :accept_and_redirect
  get  'accept_terms', to: 'static#accept_terms',        as: :accept_terms

  # Map
  get '/map', to: 'map#index', as: :map
  get '/map/*path', to: 'map#index'
  get '/map/:zoom/:lat/:lng/:iso/:maptype(/:baselayers)' => 'map#index', :lat => /[^\/]+/, :lng => /[^\/]+/
  get '/map/:zoom/:lat/:lng/:iso/:maptype(/:baselayers/:sublayers)' => 'map#index', :lat => /[^\/]+/, :lng => /[^\/]+/
  get '/map/:zoom/:lat/:lng/:iso(/:basemap/:baselayer)' => 'map#index', :lat => /[^\/]+/, :lng => /[^\/]+/

  get '/embed/map' => 'map#embed'
  get '/embed/map/*path' => 'map#embed'
  get '/embed/map/:zoom/:lat/:lng/:iso/:maptype(/:baselayers)' => 'map#embed', :lat => /[^\/]+/, :lng => /[^\/]+/
  get '/embed/map/:zoom/:lat/:lng/:iso/:maptype(/:baselayers/:sublayers)' => 'map#embed', :lat => /[^\/]+/, :lng => /[^\/]+/
  get '/embed/map/:zoom/:lat/:lng/:iso(/:basemap/:baselayer)' => 'map#embed', :lat => /[^\/]+/, :lng => /[^\/]+/
  get '/embed/map/:zoom/:lat/:lng/:iso/:basemap/:baselayer(/:filters)' => 'map#embed', :lat => /[^\/]+/, :lng => /[^\/]+/

  # Static pages
  get  'terms', to: 'static#terms',               as: :terms
  get  'about', to: 'static#about',               as: :about
  get  'data-methods', to: 'static#data_methods', as: :data_methods

  with_options only: [:index, :show] do |list_show_only|
    list_show_only.resources :countries
    list_show_only.resources :posts, path: :blog
  end

  # Countries - jurisdiction routes
  get 'pantropical' => 'countries#pantropical'
  get 'countries/:id/:id_1', to: 'countries#show', as: :jurisdiction

  # Compare countries routes
  # get 'compare-countries(/:iso_1)(:id_1)(/:iso_2)(:id_2)(/:iso_3)(:id_3)', to: 'compare#index', as: :compare_countries
  get 'compare-countries(/*path)', to: 'compare#index', as: :compare_countries

  # API routes
  namespace :api, defaults: {format: 'json'} do

    # Set APIVersion.new(version: X, default: true) for dafault API version
    scope module: :v1, constraints: APIVersion.new(version: 1, current: true) do

      with_options only: [:index, :show] do |list_show_only|
        list_show_only.resources :indicators
        list_show_only.resources :countries
        list_show_only.resources :widgets
      end

      get 'countries/:id/:id_1',    to: 'countries#show_jurisdiction', as: :jurisdiction
      get 'indicators/:id/:iso',    to: 'indicators#show',             as: :country_indicator
      get 'widgets/:id/:iso',       to: 'widgets#show',                as: :country_widget
      get 'widgets/:id/:iso/:id_1', to: 'widgets#show',                as: :juridiction_widget

    end

  end
  # End API routes

  root 'home#index'

  # API Documentation
  mount Raddocs::App => "api/docs"
  get 'api', to: redirect('api/docs')

end
