class PostsController < ApplicationController

  before_action :set_post, only: :show

  def index
    @posts = Post.find_all(search_params)
  end

  def show
  end

  private
    def search_params
      params.permit(:page)
    end

    def filter_params
      params.permit(:id)
    end

    def set_post
      @post = Post.find_post(filter_params)
    end

end