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
  get  'terms',        to: 'static#terms',        as: :terms
  get  'about',        to: 'static#about',        as: :about
  get  'data-methods', to: 'static#data_methods', as: :data_methods

  with_options only: [:index, :show] do |list_show_only|
    list_show_only.resources :countries
    list_show_only.resources :posts, path: :blog
  end

  # Countries - jurisdiction routes
  get 'pantropical',         to: 'countries#pantropical', as: :pantropical
  get 'countries/:id/:id_1', to: 'countries#show',        as: :jurisdiction

  # Compare countries routes
  # GET 'compare-countries/bra+1+0/aus+1+0/aut+0+3'
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

      get 'countries/:id/:id_1',       to: 'countries#show_jurisdiction', as: :jurisdiction
      get 'indicators/:id/:iso',       to: 'indicators#show',             as: :country_indicator
      get 'indicators/:id/:iso/:id_1', to: 'indicators#show',             as: :jurisdiction_indicator
      get 'widgets/:id/:iso',          to: 'widgets#show',                as: :country_widget
      get 'widgets/:id/:iso/:id_1',    to: 'widgets#show',                as: :jurisdiction_widget
      
      # Compare countries API routes
      # GET 'compare-countries/bra+1+0/aus+1+0/aut+0+3/etc...'
      get 'compare-countries(/*path)', to: 'compare_countries#index', as: :compare_countries
    end

  end
  # End API routes

  root 'home#index'

  # API Documentation
  mount Raddocs::App => "api/docs"
  get 'api', to: redirect('api/docs')

end
