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
      this.VALID_NAMES = ["Brazil","Indonesia","New_York_Declaration_on_Forests_Signatories","Non_New_York_Declaration_on_Forests_Signatories"];
      this.NET_INTEREST = "Net interest",
      this.defaultCharge  = function(d){
                        if (d.value < 0) {
                          return 0
                        } else {
                          return -Math.pow(d.radius,2.0)/8
                        }
                      };
      this.year_to_compare = undefined;
      this.years = undefined;
      this.year_left = undefined;
      this.year_right = undefined;
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
          if (parseFloat(d.Average).toFixed(3) > 0.003) {
            var node;
            node = {
              id: d.id,
              radius: _this.radius_scale(d.Average * 1.6),
              value: d.Average,
              name: d.Country,
              org: d.organization,
              group: d.Continent,
              iso: d.FIPS_CNTRY,

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
          } 
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
      this
        .force
        .gravity(this.layout_gravity)
        .charge(this.charge).friction(0.9)
        .on("end", function(e) {
          root.$pantropicalVis.removeClass('is-loading');
        })
        .on("tick", (function(_this) {
          return function(e) {
            _this.circles.transition().duration(50).attr("r", function(d) {
                d.currentValue = d.value;
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

      var that = this;
      this.circles.on("mouseenter", function(d, i) {
        var el = d3.select(this);
        var xpos = ~~el.attr('cx') - 115;
        var ypos = (el.attr('cy') - d.radius - 37);
        d3.select("#pantropical_tooltip")
          .style('top',ypos+"px")
          .style('left',xpos+"px")
          .style('display','block');
        return that.show_details(d, i, this);
      })

      return this.hide_years();
    };

    BubbleChart.prototype.move_towards_center = function(alpha) {
      return (function(_this) {
        return function(d) {
            if (d.id == 103 || d.id == 104) {
              return d.x = d.y = -2000;
            }
          d.x = d.x + (_this.center.x - d.x + 150) * (_this.damper + 0.02) * alpha;
          return d.y = d.y + (_this.center.y - d.y) * (_this.damper + 0.02) * alpha;
        };
      })(this);
    };

    BubbleChart.prototype.buoyancy = function(alpha) {
      var that = this;
      return function(d) {
        var targetY = that.centerY
        d.y = d.y + (targetY - d.y) * (that.defaultGravity) * alpha * alpha * alpha * 100;
      };
    };

    BubbleChart.prototype.mandatorySort = function(alpha, filter) {
      var that = this;
      return function(d){
        // if (! !!filter) {
        //   if (d.id == 103 || d.id == 104) return;
        // } else {
        //   if (that.VALID_NAMES.indexOf(d.name) == -1) return;
        // }
        //Avoid non-NYDF and NYDF items.
        if (d.id == 103 || d.id == 104) {
          return d.x = d.y = -2000;
        }
        var targetY = that.centerY;
        var targetX = 0;
        if (d.category.includes('non-NYDF'))
          d.category = 'Other non-NYDF Signatory';
        if (d.category === that.NYDF) {
          targetX = 600
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
              d.currentValue = d.value;
              return that.radius_scale(d.value * 1.6);
            })
            .each(that.mandatorySort(e.alpha))
            .each(that.buoyancy(e.alpha))
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
        })
        .on("end", function(e) {
          root.$pantropicalVis.removeClass('is-loading');
        })
        .start();

        this.circles.on("mouseenter", function(d, i) {
          var el = d3.select(this);
          var xpos = ~~el.attr('cx') - 115;
          var ypos = (el.attr('cy') - d.radius - 37);
          d3.select("#pantropical_tooltip")
            .style('top',ypos+"px")
            .style('left',xpos+"px")
            .style('display','block');
          return that.show_details(d, i, this);
        })
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
                d.currentValue = d.y2001;
              } else {
                for (key in d) {
                  if (key.includes(that.year_to_compare.toString())){
                    var value = d[key];
                    d.currentValue = value;
                  }
                }
              }
              return that.radius_scale(value * 1.6);
            })
            .each(that.mandatorySort(e.alpha, true))
            .each(that.buoyancy(e.alpha))
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            // .each(function(d) {
            //   // filter the circles so we only paint BRA. IND and the sums of YESNY and NONY
            //   var valid_ids = [1,2,103,104];
            //   if (valid_ids.indexOf(~~d.id) == -1) {
            //     // we don't want to display that country
            //     $(this).attr("cx", Math.random() -2000);
            //     $(this).attr("cy", Math.random() -2000);
            //   } else {
            //     $(this).attr("cx", function(d) { return d.x; });
            //     $(this).attr("cy", function(d) { return d.y; });
            //   }
            // });
        })
        .on("end", function(e) {
          root.$pantropicalVis.removeClass('is-loading');
        })
        .start();

        this.circles.on("mouseenter", function(d, i) {
          var el = d3.select(this);
          var xpos = ~~el.attr('cx') - 115;
          var ypos = (el.attr('cy') - d.radius - 37);
          d3.select("#pantropical_tooltip")
            .style('top',ypos+"px")
            .style('left',xpos+"px")
            .style('display','block');
          return that.show_details(d, i, this);
        })
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

    BubbleChart.prototype.display_by_country = function(values_array) {
      $('#svg_vis').css({
        'height':1100
      });

      var that = this;
      var style_string;

      var circles = this.generateCircles(values_array)

      this.force
        .gravity(0)
        .friction(0.9)
        .charge(that.defaultCharge)
        .on("tick", function(e){
          circles.each(that.buoyancy(e.alpha));
        })
        .on("end", function(e) {
          root.$pantropicalVis.removeClass('is-loading');
        })
        .start();
    };

    BubbleChart.prototype.generateCircles = function(values_array) {
      var that = this;
      var circles = that.circles;
      var style_string;

      circles
        .transition().duration(100).attr("r", function(d) {
          id = d.id;
          for (index in values_array){
            // find corresponding value for this bubble
            if (values_array[index].id == id) {
              var value = values_array[index].value;
              break;
            }
          }
          
          return that.radius_scale(value * 1.6);
        });

      circles
        .each( function(d) {
          var coordinates = [];
          var label_text = "";
          // look up current bubble in value_array
          // use that index to assign order
          // use order to determine coordinates
          for (var i = 0; i < values_array.length; i++){
            id_search_string = "bubble_" + values_array[i].id;
            
            if (this.id == id_search_string) {
              style_string = 'order:' + i + ";";
              $(this).attr('style', style_string);

              coordinates = that.get_coordinates(i);

              $(this).attr('cx', coordinates[0]);
              $(this).attr('cy', coordinates[1]);
              $(this).attr('data-url', '/countries/' + d.iso);

              var value = values_array[i].value;
              var radius = that.radius_scale(value * 1.6);

              label_text = that.get_label_text(i, coordinates, this.id, d.name, value, radius, d.iso);
              document.getElementById(this.id).insertAdjacentHTML('afterend', label_text)

              break;
            }
          }
        })
        .on('click', function(e) {
          var url = $(this).data('url');
          window.location.href = url;
        })
        .on("mouseenter",function() {
            d3.event.stopPropagation(); 
        });

      return circles;
    };

    BubbleChart.prototype.get_label_text = function(order, coordinates, id, country, data, radius, iso) {
      var x_coord = 'x="' + coordinates[0] + '" ';

      var y_coord =         'y="' + coordinates[1] + '" ';
      var y_coord_country = 'y="' + (coordinates[1]+45) + '" ';
      var y_coord_data =    'y="' + (coordinates[1]+65) + '" ';

      var id_country = 'id="' + id + '-country" ';
      var id_data = 'id="' + id + '-data" ';


      if ( order === 1 && radius < 47.5 || order === 2 && radius < 47.5 || order === 3 && radius < 47.5) {
        var y_coord_country = 'y="' + (coordinates[1]+60) + '" ';
        var y_coord_data =    'y="' + (coordinates[1]+80) + '" ';
      } 

      if ( radius > 47.5 ) {
        var y_coord_country = 'y="' + (coordinates[1]) + '" ';
        var y_coord_data =    'y="' + (coordinates[1]+20) + '" ';
      }

      var label_text =
      '<text class="country-label bubble-label" ' +
              id_country +
              x_coord +
              y_coord_country +
              'data-url=countries/'+ iso +
              ' text-anchor="middle" width="150px">' +
              country +
      '</text>' +

      '<text  class="data-label bubble-label"' +
              id_data +
              x_coord +
              y_coord_data +
              'data-url=countries/'+ iso +
              ' text-anchor="middle">' +
              parseFloat(data*100).toFixed(3) + '%' + 
      '</text>';

      $('.bubble-label').on('click', function(e) {
        var url = $(this).data('url');
        window.location.href = url;
      });

      return label_text;
    }

    BubbleChart.prototype.calculate_average = function(d) {
      var year_left = this.year_left;
      var year_right = this.year_right;
      var diff_years = Math.abs(this.year_right - this.year_left);
      var years_between = diff_years - 1;
      var years_total = diff_years + 2;
      var lookup_years = [];

      // push years onto array

      lookup_years.push(year_left);
      // generate years in between
      for(var i = 0; i < years_between; i++){
        var sum = i + 1;
        lookup_years.push(year_left + sum);
      }
      lookup_years.push(year_right);

      // look up data corresponding to year
      var sum_data = 0;
      for (year in lookup_years){
        for (key in d) {
          if (key == ("y" + lookup_years[year].toString())){
            sum_data += parseFloat(d[key]);
          }
        }
      }

      var avg = sum_data/years_total;

      return avg.toFixed(6);
    };

    // returns array of bubbles in descending order
    // array [{id1, value1}, {id2, value2}, ...]
    BubbleChart.prototype.sort_desc = function(array){

      array.sort(function(a, b) {
        if (a.value > b.value) {
          return 1;
        }
        if (a.value < b.value) {
          return -1;
        }
        return 0;
      });
      array = array.reverse();

      return array;
    };

    BubbleChart.prototype.set_years = function(year){
      this.year = year;

      if (! !!this.year) {
        this.year_left = 2001;
        this.year_right = 2013;
      } else {
        this.year_left = this.year[0];
        this.year_right = this.year[1];
      }
    };


    BubbleChart.prototype.get_values_array = function() {
      var that = this;
      var values_array = [];

      this.circles.each(function(d) {
        if (that.year_left == that.year_right) {
          var year_string = "y" + that.year_left;
          var value = d[year_string];
        } else {
          var value = that.calculate_average(d);
        }
        var id = ~~d.id;
        values_array.push({id: id, value: value});
      });
      return this.sort_desc(values_array);
    };

    // returns an array of the coordinates according to the sorted_array index (bubble_id, starts at 1)
    // sorted_index, index_of start at 0
    BubbleChart.prototype.get_coordinates = function(sorted_index){
      var dist_x = 125;
      var dist_y = 55;
      var offset_x = 150;
      var offset_y = 50;
      var col_count = 6;

      if (sorted_index < 4){
        // bubbles at index 0, 1, 2, 3 are in line 1
        col_count = 4;
        dist_x = 170;
        offset_x = 275;
      } else {
        // modify current index to push bubbles into line 2
        sorted_index += 2;
      }

      if (sorted_index === 0 ) {
        offset_x = 225
      }
      
      if (sorted_index === 3 ) {
        offset_x = 260
      }

      var x_position = (((sorted_index) % col_count) * dist_x);
      var y_position = 0;

      if (sorted_index < (col_count)){
        y_position = 150;
      } else if (sorted_index < (2*col_count)){
        y_position = 300;
      } else if (sorted_index < (3*col_count)){
        y_position = 450;
      } else if (sorted_index < (4*col_count)){
        y_position = 600;
      } else if (sorted_index < (5*col_count)){
        y_position = 750;
      } else if (sorted_index < (6*col_count)){
        y_position = 900;
      } else if (sorted_index < (7*col_count)){
        y_position = 1050;
      } else if (sorted_index < (8*col_count)){
        y_position = 1200;
      } else if (sorted_index < (9*col_count)){
        y_position = 1350;
      } else if (sorted_index < (10*col_count)){
        y_position = 1500;
      } else if (sorted_index < (11*col_count)){
        y_position = 1650;
      } else if (sorted_index < (12*col_count)){
        y_position = 1800;
      } else if (sorted_index < (13*col_count)){
        y_position = 1950;
      } else if (sorted_index < (14*col_count)){
        y_position = 2100;
      } else if (sorted_index < (15*col_count)){
        y_position = 2250;
      }

      y_position += dist_y;

      var cx = x_position + offset_x;
      var cy = y_position + offset_y;

      return [cx, cy];
    };

    BubbleChart.prototype.hide_years = function() {
      var years;
      return years = this.vis.selectAll(".years").remove();
    };

    BubbleChart.prototype.show_details = function(data, i, element) {
      var content;
      d3.select(element).attr("stroke", "rgba(0,0,0,0.5)");
      content = "<span class=\"value\"> " + data.name + "</span><br/>";
      content += "<span class=\"name\">Emissions:</span> <span class=\"value\">" + (data.currentValue*100 || data.value*100).toFixed(3) + "%</span><br/>";
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
      root.cache_vars();
      return root.display_all();
    };
    root.cache_vars = (function(_this) {
      return function() {
        root.$pantropicalVis = $('.pantropical-vis');
        root.$visContainer = $('#svg_vis');
      };
    })(this);
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
      return function(year) {
        chart.set_years(year);
        var values_array = chart.get_values_array();
        return chart.display_by_country(values_array);
      };
    })(this);

    root.remove_labels = (function(_this) {
      return function() {
        root.$visContainer.find('.country-label').remove();
        root.$visContainer.find('.data-label').remove();
      };
    })(this);

    root.set_loading = (function(_this) {
      return function() {
        root.$pantropicalVis.addClass('is-loading');
      };
    })(this);

    root.toggle_view = (function(_this) {
      return function(view_type, year, noSpinner) {
        root.remove_labels();
        if (!noSpinner) {
          root.set_loading();
        }
        switch (view_type) {
          case 'nydfs':
            return root.display_ny();
          case 'all':
            return root.display_all();
          case 'change':
            return root.display_change(year);
          case 'country':
            return root.display_country(year);
        }
      };
    })(this);
    return d3.csv("/pantropicalTESTING_isos.csv", render_vis);
  });

}).call(this);
