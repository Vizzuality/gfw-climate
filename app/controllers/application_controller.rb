class ApplicationController < ActionController::Base

  helper_method :terms_cookie
  
  protect_from_forgery with: :exception
  
  private
    def terms_cookie
      cookies.permanent[ENV['TERMS_COOKIE'].to_sym]
    end

end