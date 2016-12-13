define(['d3', 'handlebars'], function(d3, Handlebars) {
  var tooltipTemplate = Handlebars.compile(
    '<div class="tooltip"><h4></h4><h5></h5></div>'
  );

  var group, eventInterceptor, xKey, yKey, x, y, data, sizing, innerPadding, height, width;

  var bisectDate = d3.bisector(function(d) { return d[xKey]; }).left;

  var LineChartInteractionHandler = function(svg, options) {
    group = svg.append("g")
      .attr("class", "hoverOverlay")
      .attr("width", options.width)
      .attr("height", options.height)
      .style("display", "none");

    data = options.data;
    sizing = options.sizing;
    innerPadding = options.innerPadding;
    eventInterceptor = options.interceptor;
    xKey = options.keys.x;
    yKey = options.keys.y;
    x = options.x;
    y = options.y;
    height = options.height;
    width = options.width;

    this._setupTooltip(svg);
    this.render();
    this._setupHandlers();
  };

  LineChartInteractionHandler.prototype._setupTooltip = function(container) {
    var $container = $(container[0]),
        $parent = $container.parent();

    this.$tooltip = $(tooltipTemplate());
    $parent.append(this.$tooltip);
  };

  LineChartInteractionHandler.prototype._setupHandlers = function() {
    var $tooltip = this.$tooltip;

    eventInterceptor
      .on("mouseover", function() {
        this.$tooltip.show();
        group.style("display", null);
      }.bind(this))
      .on("mouseout", function() {
        this.$tooltip.hide();
        group.style("display", "none");
      }.bind(this))
      .on("mousemove", function() {
        var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0,
          xVal = x(d[xKey]),
          yVal = y(d[yKey]);

        group.select("circle").attr("transform",
           "translate(" + xVal + "," + (yVal+sizing.top) + ")");

        var left = xVal - ($tooltip.width()/2),
            top = yVal - $tooltip.height() - 20;
        if (top <= sizing.top) { top = yVal + $tooltip.height() - 10; }
        if(left + $tooltip.width() > width - innerPadding.right) {
          left = width - $tooltip.width() - innerPadding.right;
        }
        if(left < innerPadding.left) {
          left = innerPadding.left;
        }
        $tooltip.css({ left: left+"px", top: top+"px" });
        $tooltip.find('h4').text(d[yKey]);

        var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
        var formattedDate = d[xKey].getDate() + " " + monthNames[d[xKey].getMonth()]  + " " + d[xKey].getFullYear();
        $tooltip.find('h5').text(formattedDate);

        group.selectAll("line")
          .attr("x1", xVal)
          .attr("x2", xVal);

        group.select(".top-line")
          .attr("y1", 0)
          .attr("y2", yVal + (sizing.top/2));

        group.select(".bottom-line")
          .attr("y1", yVal + (sizing.top*1.5))
          .attr("y2", height + (sizing.top));
      });
  };

  LineChartInteractionHandler.prototype.render = function() {
    group.append("circle").attr("r", 4.5);
    group.append("line").attr("class", "top-line");
    group.append("line").attr("class", "bottom-line");
  };

  return LineChartInteractionHandler;
});
