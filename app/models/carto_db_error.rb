class CartoDbError < StandardError
  def initialize(msg)
    super "Carto DB data retrieval failed: #{msg}"
  end
end
