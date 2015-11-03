function CustomTooltip(tooltipId, width) {
  var tooltipId = tooltipId;
  $("#vis").append("<div class='tooltip' id='"+tooltipId+"'></div>");

  if(width){
      $("#"+tooltipId).css("width", width);
  }

  hideTooltip();

  function showTooltip(content, event){
      $("#"+tooltipId).html(content);
      $("#"+tooltipId).show();

      //updatePosition(event);
  }

  function hideTooltip(){
      $("#"+tooltipId).hide();
  }

  function updatePosition(event){
      var ttid = "#"+tooltipId;
      var xOffset = -120;
      var yOffset = -70;

       var ttw = $(ttid).width();
       var tth = $(ttid).height();
       var wscrY = $(window).scrollTop();
       var wscrX = $(window).scrollLeft();
       var curX = (document.all) ? event.clientX + wscrX : event.pageX;
       var curY = (document.all) ? event.clientY + wscrY : event.pageY;
       var ttleft = ((curX - wscrX + xOffset*2 + ttw) > $(window).width()) ? curX - ttw - xOffset*2 : curX + xOffset;
       if (ttleft < wscrX + xOffset){
          ttleft = wscrX + xOffset;
       }
       var tttop = ((curY - wscrY + yOffset*2 + tth) > $(window).height()) ? curY - tth - yOffset*2 : curY + yOffset;
       if (tttop < wscrY + yOffset){
          tttop = curY + yOffset;
       }
       $(ttid).css('top', tttop + 'px').css('left', ttleft + 'px');
  }

  return {
      showTooltip: showTooltip,
      hideTooltip: hideTooltip,
      updatePosition: updatePosition
  }
}
function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

(function() {
  var BubbleChart, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BubbleChart = (function() {
    function BubbleChart(data) {
      this.hide_details = __bind(this.hide_details, this);
      this.show_details = __bind(this.show_details, this);
      this.hide_years = __bind(this.hide_years, this);
      this.display_years = __bind(this.display_years, this);
      this.move_towards_year = __bind(this.move_towards_year, this);
      this.display_by_year = __bind(this.display_by_year, this);
      this.move_towards_center = __bind(this.move_towards_center, this);
      this.display_group_all = __bind(this.display_group_all, this);
      this.start = __bind(this.start, this);
      this.create_vis = __bind(this.create_vis, this);
      this.create_nodes = __bind(this.create_nodes, this);
      var max_amount;
      this.data = data;
      this.width = 960;
      this.height = 480;
      this.NYDF = "Other NYDF Signatory",
      this.NONYDF = "Other non-NYDF Signatory",
      this.NET_INTEREST = "Net interest",
      this.defaultCharge  = function(d){
                        if (d.value < 0) {
                          return 0
                        } else {
                          return -Math.pow(d.radius,2.0)/8
                        }
                      };
      this.year_to_compare = undefined;
      this.tooltip = CustomTooltip("pantropical_tooltip", 230);
      this.center = {
        x: this.width / 2,
        y: this.height / 2
      };
      this.centerY = 300;
      this.year_centers = {
        "2001": {
          x: this.width * (1/13),
          y: this.height / 2
        },
        "2002": {
          x: this.width * (2/13),
          y: this.height / 2
        },
        "2003": {
          x: this.width * (3/13),
          y: this.height / 2
        },
        "2004": {
          x: this.width * (4/13),
          y: this.height / 2
        },
        "2005": {
          x: this.width * (5/13),
          y: this.height / 2
        },
        "2006": {
          x: this.width * (6/13),
          y: this.height / 2
        },
        "2007": {
          x: this.width * (7/13),
          y: this.height / 2
        },
        "2008": {
          x: this.width * (8/13),
          y: this.height / 2
        },
        "2009": {
          x: this.width * (9/13),
          y: this.height / 2
        },
        "2010": {
          x: 2 * this.width * (10/13),
          y: this.height / 2
        },
        "2011": {
          x: this.width * (11/13),
          y: this.height / 2
        },
        "2012": {
          x: this.width * (12/13),
          y: this.height / 2
        },
        "2013": {
          x: this.width * (13/13),
          y: this.height / 2
        }
      };
      this.layout_gravity = -0.01;
      this.defaultGravity = 0.1;
      this.damper = 0.1;
      this.vis = null;
      this.nodes = [];
      this.force = null;
      this.circles = null;
      this.fill_color = d3.scale.ordinal().domain(["America", "Africa", "Asia"]).range(["rgb(112,178,195)", "rgb(162,206,219)", "rgb(235,179,160)"]);
      max_amount = d3.max(this.data, function(d) {
        return d.Average;
      });
      this.radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 85]);
      this.create_nodes();
      this.create_vis();
    }

    BubbleChart.prototype.create_nodes = function() {
      this.data.forEach((function(_this) {
        return function(d) {
          if (d.Average == 0) return;
          var node;
          node = {
            id: d.id,
            radius: _this.radius_scale(d.Average * 1.6),
            value: d.Average,
            name: d.Country,
            org: d.organization,
            group: d.Continent,

            year: d.start_year,
            y2001: d.y2001,
            y2002: d.y2002,
            y2003: d.y2003,
            y2004: d.y2004,
            y2005: d.y2005,
            y2006: d.y2006,
            y2007: d.y2007,
            y2008: d.y2008,
            y2009: d.y2009,
            y2010: d.y2010,
            y2011: d.y2011,
            y2012: d.y2012,
            y2013: d.y2013,
            continent: d.Continent,
            country: d.Country,
            category: d.Category,
            fips_cntry: d.FIPS_CNTRY,
            average: d.Average,

            x: Math.random() * 900,
            y: Math.random() * 800
          };

          return _this.nodes.push(node);
        };
      })(this));
      return this.nodes.sort(function(a, b) {
        return b.value - a.value;
      });
    };

    BubbleChart.prototype.create_vis = function() {
      var that;
      this.vis = d3.select("#vis").append("svg").attr("width", this.width).attr("height", this.height).attr("id", "svg_vis");
      this.circles = this.vis.selectAll("circle").data(this.nodes, function(d) {
        return d.id;
      });
      that = this;
      this.circles.enter().append("circle").attr("r", 0).attr("fill", (function(_this) {
        return function(d) {
          return _this.fill_color(d.group);
        };
      })(this)).attr("stroke-width", 2).attr("stroke", (function(_this) {
        return function(d) {
          return d3.rgb(_this.fill_color(d.group)).darker();
        };
      })(this)).attr("id", function(d) {
        return "bubble_" + d.id;
      }).on("mouseenter", function(d, i) {
        var el = d3.select(this);
        var xpos = ~~el.attr('cx') - 115;
        var ypos = (el.attr('cy') - d.radius - 37);
        d3.select("#pantropical_tooltip")
          .style('top',ypos+"px")
          .style('left',xpos+"px")
          .style('display','block');
        return that.show_details(d, i, this);
      }).on("mouseout", function(d, i) {
        return that.hide_details(d, i, this);
      });
      return this.circles.transition().duration(2000).attr("r", function(d) {
        return d.radius;
      });
    };

    BubbleChart.prototype.charge = function(d) {
      return -Math.pow(d.radius, 2.0) / 8;
    };

    BubbleChart.prototype.start = function() {
      return this.force = d3.layout.force().nodes(this.nodes).size([this.width, this.height]);
    };

    BubbleChart.prototype.display_group_all = function() {
      this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", (function(_this) {
        return function(e) {
          _this.circles.transition().duration(50).attr("r", function(d) {
              return _this.radius_scale(d.value * 1.6);
            })
          return _this.circles.each(_this.move_towards_center(e.alpha)).attr("cx", function(d) {
            return d.x;
          }).attr("cy", function(d) {
            return d.y;
          });
        };
      })(this));
      this.force.start();
      return this.hide_years();
    };

    BubbleChart.prototype.move_towards_center = function(alpha) {
      return (function(_this) {
        return function(d) {
          d.x = d.x + (_this.center.x - d.x + 150) * (_this.damper + 0.02) * alpha;
          return d.y = d.y + (_this.center.y - d.y) * (_this.damper + 0.02) * alpha;
        };
      })(this);
    };

    BubbleChart.prototype.buoyancy = function(alpha) {
      var that = this;
      return function(d) {
          var targetY = that.centerY
          d.y = d.y + (targetY - d.y) * (that.defaultGravity) * alpha * alpha * alpha * 100
      };
    };

    BubbleChart.prototype.mandatorySort = function(alpha) {
      var that = this;
      return function(d){
        var targetY = that.centerY;
        var targetX = 0;

        if (d.category.includes('non-NYDF'))
          d.category = 'Other non-NYDF Signatory';
        if ((d.category === that.NYDF)) {
          targetX = 550
        } else {
          targetX = 450
        };




        d.y = d.y + (targetY - d.y) * (that.defaultGravity) * alpha * 1.1
        d.x = d.x + (targetX - d.x) * (that.defaultGravity) * alpha * 1.1
      };
    },

    BubbleChart.prototype.display_by_ny = function() {
      var that = this;
      this.force
        .gravity(0)
        .friction(0.9)
        .charge(that.defaultCharge)
        .on("tick", function(e){
          that.circles
            .transition().duration(50).attr("r", function(d) {
              return that.radius_scale(d.value * 1.6);
            })
            .each(that.mandatorySort(e.alpha))
            .each(that.buoyancy(e.alpha))
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        })
        .start();
      //return this.display_ny();
    };

    BubbleChart.prototype.display_by_change = function(year) {
      this.year_to_compare = year;
      var that = this;
      this.force
        .gravity(0)
        .friction(0.9)
        .charge(that.defaultCharge)
        .on("tick", function(e){
          that.circles
            .transition().duration(50).attr("r", function(d) {
              if (! !!that.year_to_compare) {
                var value = d.y2001;
              } else {
                for (key in d) {
                  if (key.includes(that.year_to_compare.toString())){
                    var value = d[key];
                  }
                }
              }
              return that.radius_scale(value * 1.6);
            })
            .each(that.mandatorySort(e.alpha))
            .each(that.buoyancy(e.alpha))
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        })
        .start();
      //return this.display_ny();
    };

    BubbleChart.prototype.move_towards_year = function(alpha) {
      return (function(_this) {
        return function(d) {
          var target;
          target = _this.year_centers[d.year || 2010];
          d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
          return d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
        };
      })(this);
    };

    BubbleChart.prototype.display_by_country = function() {
      var years, years_data, years_x;
      years_x = {
        "2001": this.width - (this.width*0.95),
        "2002": this.width - (this.width*0.85),
        "2003": this.width - (this.width*0.75),
        "2004": this.width - (this.width*0.65),
        "2005": this.width - (this.width*0.55),
        "2006": this.width - (this.width*0.45),
        "2007": this.width - (this.width*0.35),
        "2008": this.width - (this.width*0.25),
        "2009": this.width - (this.width*0.15),
        "2010": this.width - (this.width*0.05)
      };
      years_data = d3.keys(years_x);
      years = this.vis.selectAll(".years").data(years_data);
      return years.enter().append("text").attr("class", "years").attr("x", (function(_this) {
        return function(d) {
          return years_x[d];
        };
      })(this)).attr("y", 40).attr("text-anchor", "middle").text(function(d) {
        return d;
      });
    };

    BubbleChart.prototype.hide_years = function() {
      var years;
      return years = this.vis.selectAll(".years").remove();
    };

    BubbleChart.prototype.show_details = function(data, i, element) {
      var content;
      d3.select(element).attr("stroke", "rgba(0,0,0,0.5)");
      content = "<span class=\"value\"> " + data.name + "</span><br/>";
      content += "<span class=\"name\">Emissions:</span> <span class=\"value\">" + (addCommas(data.value)) + "</span><br/>";
      return this.tooltip.showTooltip(content, d3.event);
    };

    BubbleChart.prototype.hide_details = function(data, i, element) {
      d3.select(element).attr("stroke", (function(_this) {
        return function(d) {
          return d3.rgb(_this.fill_color(d.group)).darker();
        };
      })(this));
      return this.tooltip.hideTooltip();
    };

    return BubbleChart;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  $(function() {
    var chart, render_vis;
    chart = null;
    render_vis = function(csv) {
      chart = new BubbleChart(csv);
      chart.start();
      return root.display_all();
    };
    root.display_all = (function(_this) {
      return function() {
        return chart.display_group_all();
      };
    })(this);
    root.display_ny = (function(_this) {
      return function() {
        return chart.display_by_ny();
      };
    })(this);
    root.display_change = (function(_this) {
      return function(year) {
        return chart.display_by_change(year);
      };
    })(this);
    root.display_country = (function(_this) {
      return function() {
        return chart.display_by_country();
      };
    })(this);
    root.toggle_view = (function(_this) {
      return function(view_type, year) {
        switch (view_type) {
          case 'nydfs':
            return root.display_ny();
          case 'all':
            return root.display_all();
          case 'change':
            return root.display_change(year);
          case 'country':
            return root.display_country();
        }
      };
    })(this);
    return d3.csv("/pantropicalTESTING.csv", render_vis);
  });

}).call(this);
