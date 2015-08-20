class APIVersion
  
  def initialize(options)
    @version = options[:version]
    @default = options[:current]
  end

  def matches?(request)
    @default || check_headers(request.headers)
  end

  private
    def check_headers(headers)
      accept = headers['Accept']
      accept && accept.include?("application/gfwc-v#{@version}+json")
    end

end