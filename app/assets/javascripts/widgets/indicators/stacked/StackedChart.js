define([
  'jquery',
  'd3',
  'underscore',
  'handlebars',
  'mps',
  'text!widgets/templates/indicators/line/linechart-tooltip.handlebars'
], function ($, d3, _, Handlebars, mps, tooltipTpl) {

  var StackedChart = function (options) {
    this.svg;
    this.options = options;
    this.parent = options.parent;
    this.data = options.data;
    this.indicators = options.indicators;
    this.unit = options.unit
    this.unitname = options.unitname;
    this.rangeX = options.rangeX;
    this.rangeY = options.rangeY;
    this.lock = options.lock;
    this.templateTooltip = Handlebars.compile(tooltipTpl);

    this.sizing = options.sizing;
    this.innerPadding = options.innerPadding;
    this.namespace = new Date().valueOf().toString();

    this.color = ['#5B80A0', '#ADBFCE', '#B6B6BA', '#E2E2E3'];

    this.parentWidth = $(this.options.el).outerWidth();
    this.parentHeight = $(this.options.el).outerHeight();
    this.width = this.parentWidth - this.sizing.left - this.sizing.right,
    this.height = this.parentHeight - this.sizing.top - this.sizing.bottom;

    if (!!this.parentWidth && !!this.parentHeight) {
      this._createEl();
      this._createDefs();
      this._createStack();
      this._createScales();
    }

    this.setListeners();
    // $(window).resize(_.debounce(this.resize.bind(this), 100))
    $(window).on('resize.namespace' + this.namespace, _.debounce(this.resize.bind(this), 100));
  };

  StackedChart.prototype.offResize = function () {
    $(window).off('resize.namespace' + this.namespace);
  };

  StackedChart.prototype.resize = function () {
    this.offResize();
    $(this.options.el).find('svg').remove();
    this.destroy();
    new StackedChart(this.options).render();
  };

  StackedChart.prototype._createEl = function () {
    this.svg = d3.select(this.options.el)
      .append("svg")
      .attr('class', 'lineChart')
      .attr("width", this.parentWidth)
      .attr("height", this.parentHeight);
  };

  StackedChart.prototype._createStack = function () {
    var self = this;
    this.stacked = d3.layout.stack()(this.data.map(function(d) {
      return d.map(function(i) {
        return {x: i.year, y: i.value}
      })
    }));
    this.stackedTotals = _.map(this.stacked, function(data) {
      return d3.format(".4r")(_.reduce(data, function(total, item) {
        return total + item.y;
      }, 0));
    })

    this.stackedTotals = [];
    if (this.data.length) {
      for (let index = 0; index < this.data[0].length; index++) {
        let total = 0;
        for (let e = 0; e < this.data.length; e++) {
          total += this.data[e][index].value || 0;
        }
        this.stackedTotals.push(d3.format(".4r")(total));
      }
    }
  }

  StackedChart.prototype._createScales = function () {
    var self = this;
    this.xKey = this.options.keys.x;
    this.yKey = this.options.keys.y;

    this.x = d3.scale.ordinal().rangeRoundBands([this.options.innerPadding.left, this.width - this.options.innerPadding.right]);
    this.x.domain(this.stacked[0].map(function(d) { return d.x; }));

    this.y = d3.scale.linear().rangeRound([this.height - this.options.innerPadding.bottom, this.options.innerPadding.top]);
    this.y.domain([0, d3.max(this.stacked[this.stacked.length - 1], function(d) { return d.y0 + d.y; })]).nice();
  };

  StackedChart.prototype._createDefs = function () {
    this.svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height);
  };


  StackedChart.prototype._drawAxes = function () {
    var self = this;
    var tickSizeX = ($(window).width() > 1025) ? 1 : 2;
    var tickFormatY = (this.unit != 'percentage') ? ".2s" : ".2f";
    this.xAxis = d3.svg.axis()
      .scale(self.x)
      .ticks(d3.time.year, tickSizeX)
      .orient("bottom")
      .tickFormat(d3.time.format("%Y"));

    this.yAxis = d3.svg.axis()
      .scale(self.y)
      .tickSize(-this.height, 0)
      .orient("left")
      .tickFormat(d3.format(tickFormatY));

    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (this.height - this.sizing.top) + ")")
      .call(this.xAxis);

    this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis)
      .selectAll("text")
      .attr("y", -10)
      .attr("x", 5)
      .style("text-anchor", "start");
  };

  StackedChart.prototype._getColorByIndex = function (i) {
    return this.color[i % this.color.length];
  };

  StackedChart.prototype._drawData = function () {
    var self = this;
    this.bars = this.svg.selectAll(".layer")
      .data(this.stacked)
      .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return self._getColorByIndex(i); });

    var getXPos = function(d) {
      return (self.x(d.x) + self.x.rangeBand() / 4);
    }

    var getYPos = function(d) {
      return self.y(d.y + d.y0);
    }

    this.rectangles = this.bars.selectAll("rect")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("x", getXPos)
        .attr("y", getYPos)
        .attr("height", function(d) { return self.y(d.y0) - self.y(d.y + d.y0); })
        .attr("width", self.x.rangeBand() - self.x.rangeBand() / 2);


    this.text = this.bars.selectAll("text")
      .data(function(d) { return d; })
      .enter()
      .append("text")
      .attr('class', 'total-count')
      .attr("y", function(d) { return getYPos(d) - 10; })
      .attr("x", function(d) { return getXPos(d) + self.x.rangeBand() / 4})
      .attr("text-anchor","middle")
      .style("fill",'#000')
      .text(function(d, i) { return self.stackedTotals[i] });

  };

  StackedChart.prototype._drawLegend = function () {
    var self = this;
    var legend = _.map(self.indicators, function (indicator, i) {
      return {
        name: indicator.name,
        color: self._getColorByIndex(i),
        // We need to ensure that the data is in order
        visible: !!self.data[i]
      }
    })
    self.parent._drawLegend(legend);
  };

  StackedChart.prototype._drawTooltip = function () {
    var self = this;
    var data = data;

    // Tooltip
    this.tooltip = d3.select('body').append('div')
      .attr('class', 'linegraph-tooltip')
      .style('visibility', 'hidden')

    this.rectangles
      .on("mouseenter", function () {
        self.tooltip.style("visibility", "visible");
      })
      .on('mousemove', function (d) {
        self.setTooltip(d, false);
        mps.publish('StackedChart/mousemove' + self.options.slug_compare + self.options.id, [d[0]]);
      })
      .on("mouseleave", function () {
        self.tooltip.style("visibility", "hidden");
        mps.publish('StackedChart/mouseout' + self.options.slug_compare + self.options.id);
      })
  };


  StackedChart.prototype.setTooltip = function (value, is_reflect) {
    var self = this;
    if (!!value) {
      var year = d3.time.format("%Y")(value.x);
      var formatDate = d3.time.format("%Y");
      var valueFormatted = d3.format(".4r")(value.y) + ' ' + self.unitname;
      var info = [{
        color: self.color[0],
        value: valueFormatted
      }]

      self.tooltip
        .classed("is-reflect", is_reflect)
        .html(this.templateTooltip({ year: year, tootip_info: info }))

        .style('left', (d3.event.pageX + 'px'))
        .style('top', (d3.event.pageY) + 'px');
    }
  };

  StackedChart.prototype.setListeners = function () {
    var formatDate = d3.time.format("%Y");
    var bisectDate = d3.bisector(function (d) { return d.year; }).left;
    var data = this.data;
    var self = this;
    if (self.lock) {
      this.subcriptions = [
        mps.subscribe('StackedChart/mouseout' + this.options.slug + this.options.id, function () {
          if (!!self.svg) {
            self.tooltip
              .classed("is-reflect", false)
              .style("visibility", "hidden");
          }
        }),
        mps.subscribe('StackedChart/mousemove' + this.options.slug + this.options.id, function (x0) {
          if (!!self.svg) {
            self.setTooltip(x0, true);
          }
        })
      ]
    }
  };

  StackedChart.prototype.render = function () {
    var self = this;
    if (!!this.svg) {
      self._drawAxes();
      self._drawData();
      self._drawTooltip();
      self._drawLegend();
    };
  }

  StackedChart.prototype.destroy = function () {
    if (!!this.tooltip) {
      this.tooltip.remove();
    }
    if (this.subcriptions) {
      for (var i = 0; i < this.subcriptions.length; i++) {
        mps.unsubscribe(this.subcriptions[i]);
      }
    }
  };


  return StackedChart;

});
