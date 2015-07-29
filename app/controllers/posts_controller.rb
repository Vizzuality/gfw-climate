class PostsController < AccessController

  def index
    @posts = Post.find_all(search_params)
  end

  def show
    @post = Post.find_post(params[:id])
  end

  private
    def search_params
      params.permit(:page)
    end

end