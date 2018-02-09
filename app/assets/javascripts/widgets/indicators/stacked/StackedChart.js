define([
  'jquery', 'd3', 'underscore', 'enquire'
], function (
  $, d3, _, enquire
) {

  var svg, pie, color, arc;


  var arrayColor = ['#5B80A0', '#b6b6ba'];

  var PieChart = function (options) {
    this.options = options;
    this.data = this._defindeData(options.data);

    enquire.register("screen and (max-width:" + window.gfw.config.GFW_MOBILE + "px)", {
      match: _.bind(function () {
        this.mobile = true;
      }, this)
    });

    this.sizing = options.sizing;
    this.innerPadding = options.innerPadding;

    color = d3.scale.ordinal()
      .range(arrayColor);
    this.parentWidth = $(this.options.el).outerWidth();
    this.parentHeight = $(this.options.el).outerHeight();
    this.width = this.parentWidth - this.sizing.left - this.sizing.right,
      // this.height = this.parentHeight - this.sizing.top - this.sizing.bottom;

      this.height = function () {
        if (this.mobile) {
          return this.parentHeight - this.sizing.top - this.sizing.bottom - 40;
        } else {
          return this.parentHeight - this.sizing.top - this.sizing.bottom;
        }
      }.bind(this)();

    this.radius = Math.min(this.width, this.height) / 2;
    arc = d3.svg.arc()
      .outerRadius(this.radius)
      .innerRadius(this.radius - 60);

    this._createEl();
    this._createDefs();
    this._createPie();

    // $(window).resize(_.debounce(this.resize.bind(this), 100));
  };


  PieChart.prototype._createEl = function () {
    svg = d3.select(this.options.el)
      .append("svg")
      .attr('class', 'pieChart')
      .attr("width", this.parentWidth)
      .attr("height", this.parentHeight)
  };

  PieChart.prototype._createDefs = function () {
    svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height);
  };

  PieChart.prototype._createPie = function () {
    pie = d3.layout.pie()
      .sort(d3.descending)
      .value(function (d) { return d.value })
  };

  PieChart.prototype._defindeData = function (data) {
    var total = _.reduce(data, function (memo, i) { return memo + i.value; }, 0);
    return _.sortBy(_.map(data, function (i) {
      return {
        name: i.name,
        value: ((i.value / total) * 100).toFixed(2)
      };
    }), function (a, b) {
      return b - a;
    });
  };

  PieChart.prototype.render = function () {
    if (!!this.data.length) {
      var g = svg.selectAll('.arc')
        .data(pie(this.data))
        .enter().append('g')
        .attr('class', 'arc')
        .attr('transform', function () {
          if (this.mobile) {
            return 'translate(' + (this.parentWidth / 2 - 10) + ', ' + this.parentHeight / 2 + ')';
          } else {
            return 'translate(' + (this.parentWidth - this.parentHeight / 2) + ', ' + this.parentHeight / 2 + ')';
          }
        }.bind(this))

      g.append('path')
        .attr('d', arc)
        .style('fill', function (d) { return color(d.data.name); })
        .attr('data-legend', function (d) { return d.data.name })
        .attr('data-legend-color', function (d) { return color(d.data.name); });

      g.append('text')
        .attr('transform', function (d) { return 'translate(' + arc.centroid(d) + ')'; })
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .style('fill', '#FFF')
        .text(function (d) { return d.data.value + '%'; });

      this._createLegend(this.mobile, this.parentHeight);
    }
  };

  PieChart.prototype._createLegend = function (mobile, mobileHeight) {
    var self = this;
    var legendDotSize = 12;
    var legendSpacing = 4;
    var widgetHeightMobile = mobileHeight;

    var legend = svg.selectAll('.legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function (d, i) {
        var height = legendDotSize + legendSpacing * 2;
        var offset = height * color.domain().length / 2;

        if (mobile) {
          var horz = 40 + i * 100;
          var vert = widgetHeightMobile - height / 2 - 5;
          return 'translate(' + horz + ',' + vert + ')';
        } else {
          var horz = 0;
          var vert = i * height - offset + self.height / 2;
          return 'translate(' + horz + ',' + vert + ')';
        }
      });

    legend.append('circle')
      .attr("cx", (legendDotSize + 2) / 2)
      .attr("cy", legendDotSize / 4 + 1)
      .attr("r", legendDotSize / 2)
      .attr('class', 'legend-dot')
      .style('fill', color)
      .style('stroke', color)

    legend.append('text')
      .attr('x', legendDotSize + 2 + legendSpacing)
      .attr('y', legendDotSize + 2 - legendSpacing)
      .attr('class', 'legend-text')
      .text(function (d) { return d; });
  };

  return PieChart;
});
