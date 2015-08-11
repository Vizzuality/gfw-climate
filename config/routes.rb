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

  with_options only: [:index, :show] do |list_show_only|
    list_show_only.resources :countries
    list_show_only.resources :posts, path: :blog
  end

  root 'home#index'

end
