Rails.application.routes.draw do

  # Accept terms
  post 'accept',       to: 'access#accept_and_redirect', as: :accept_and_redirect
  get  'accept_terms', to: 'static#accept_terms',        as: :accept_terms

  # Static pages
  get  'terms', to: 'static#terms', as: :terms
  get  'about', to: 'static#about', as: :about

  with_options only: [:index, :show] do |list_show_only|
    list_show_only.resources :countries
  end

  root 'home#index'

end
