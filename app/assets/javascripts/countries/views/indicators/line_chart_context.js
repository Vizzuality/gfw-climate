define(['d3'], function(d3) {
  var group, x, y, xKey, yKey;

  var area = d3.svg.area()
    .x(function(d) { return x(d[xKey]); })
    .y1(function(d) { return y(d[yKey]); });

  var LineChartContext = function(options) {
    this.options = options;
    this.data = options.data;

    this.sizing = options.sizing;
    this.margin = {top: $(this.options.el).outerHeight() - 70, right: 10, bottom: 7, left: 0};
    this.width = $(this.options.el).outerWidth();
    this.height = $(this.options.el).outerHeight() - this.margin.top - this.margin.bottom;

    this._createScales();
  };

  LineChartContext.prototype._createScales = function() {
    xKey = this.options.keys.x;
    yKey = this.options.keys.y;

    x = d3.time.scale().range([0, this.width]),
    x.domain(this.options.domain.x);

    y = d3.scale.linear().range([this.height, 0]);
    y.domain(this.options.domain.y);
  };

  LineChartContext.prototype._drawArea = function(group) {
    area.y0(this.height);

    group.append("path")
      .datum(this.data)
      .attr("class", "area")
      .attr("transform", "translate(0," + 7 + ")")
      .attr("d", area);
  }

  LineChartContext.prototype._drawAxes = function(group) {
    var xAxis = d3.svg.axis().scale(x).tickSize(-this.height - 7, 0).orient("bottom");

    group.append("g")
        .attr("class", "x axis2")
        .attr("transform", "translate(0," + (this.height + 7) + ")")
        .call(xAxis)
      .selectAll("text")
        .attr("y", -15)
        .attr("x", 6)
        .style("text-anchor", "start");
  };

  LineChartContext.prototype._drawBackground = function(group) {
    group.append("rect")
      .attr("class", "background")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", this.height + 7)
      .attr("width", this.width);
  };

  LineChartContext.prototype._drawBrush = function(group) {
    var brush = d3.svg.brush().x(x);

    brush.on("brush", function() {
      var newDomain = brush.empty() ? x.domain() : brush.extent();
      this.options.onBrush(newDomain);
    }.bind(this));

    group.append("g")
        .attr("class", "x brush")
        .attr("transform", "translate(0," + 6 + ")")
        .call(brush)
      .selectAll("rect")
        .attr("y", -6)
        .attr("height", this.height + 7);
  };

  LineChartContext.prototype.render = function() {
    group = this.options.group;
    group.attr("transform",
      "translate(" + this.margin.left + "," + this.margin.top + ")");

    this._drawBackground(group);
    this._drawArea(group);
    this._drawAxes(group);
    this._drawBrush(group);
  };

  return LineChartContext;
});