module AccessHelper

  def set_cookie
    request.cookies[ENV['TERMS_COOKIE']] = 'terms_cookie'
  end

end