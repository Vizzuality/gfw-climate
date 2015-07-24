Rails.application.routes.draw do

  # Accept terms
  post 'accept',       to: 'access#accept_and_redirect', as: :accept_and_redirect
  get  'accept_terms', to: 'static#accept_terms',        as: :accept_terms

  # Static pages
  get  'terms', to: 'static#terms', as: :terms
  get  'about', to: 'static#about', as: :about

  root 'home#index'

end
