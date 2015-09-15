class StaticController < AccessController

  skip_before_action :check_terms, only: :accept_terms

  def terms
  end

  def accept_terms
    redirect_to root_path if terms_cookie
  end

  def blog
  end

  def data_methods
  end

  def about
  end

end
