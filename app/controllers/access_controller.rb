class AccessController < ApplicationController

  helper_method :base_api_url, :base_blog_url

  before_action :check_terms, except: :accept_and_redirect

  def accept_and_redirect
    cookies.permanent[ENV['TERMS_COOKIE'].to_sym] = { value: true, domain: ENV['GFW_HOST'] }
    redirect_to session[:return_to] || root_path
  end

  private
    def check_terms
      session[:return_to] = request.fullpath
      redirect_to accept_terms_path unless accepted_terms?
    end

    def accepted_terms?
      terms_cookie
    end

    def base_api_url
      ENV['GFW_API_HOST']
    end

    def base_blog_url
      ENV['BLOG_HOST']
    end

end