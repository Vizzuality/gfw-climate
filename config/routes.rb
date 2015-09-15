Rails.application.routes.draw do

  # Accept terms
  post 'accept',       to: 'access#accept_and_redirect', as: :accept_and_redirect
  get  'accept_terms', to: 'static#accept_terms',        as: :accept_terms

  # Map
  get '/map' => 'map#index'
  get '/map/*path' => 'map#index'
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
  get  'terms', to: 'static#terms', as: :terms
  get  'about', to: 'static#about', as: :about
  get  'blog', to: 'static#blog', as: :blog
  get  'data-methods', to: 'static#data_methods', as: :data_methods

  with_options only: [:index, :show] do |list_show_only|
    list_show_only.resources :countries
    list_show_only.resources :posts, path: :blog
  end

  # countries routes
  get 'countries/:id/:id_1', to: 'countries#show', as: :jurisdiction
  get 'compare-countries',   to: 'countries#compare_countries', as: :compare_countries

  # API routes
  namespace :api, defaults: {format: 'json'} do

    # Set APIVersion.new(version: X, default: true) for dafault API version
    scope module: :v1, constraints: APIVersion.new(version: 1, current: true) do

      with_options only: [:index, :show] do |list_show_only|
        list_show_only.resources :countries
        list_show_only.resources :widgets
      end

      get 'countries/:id/:id_1', to: 'countries#show_jurisdiction', as: :jurisdiction

    end

  end
  # End API routes

  root 'home#index'

  # API Documentation
  mount Raddocs::App => "api/docs"
  get 'api', to: redirect('api/docs')

end
