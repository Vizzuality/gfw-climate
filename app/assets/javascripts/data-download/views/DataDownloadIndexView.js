define(
  [
    'backbone',
    'handlebars',
    'bluebird',
    'underscore',
    'jquery',
    'data-download/views/DownloadFilterCardView',
    'data-download/views/SwitchView',
    'helpers/utilsHelper',
    'text!data-download/templates/download-filters.handlebars'
  ],
  function(
    Backbone,
    Handlebars,
    Promise,
    _,
    $,
    DownloadFilterCardView,
    SwitchView,
    UtilsHelper,
    tpl
  ) {
    'use strict';
    var DataDownloadIndexView = Backbone.View.extend({
      filters: [
        {
          id: 'country_codes',
          name: 'Countries'
        },
        {
          id: 'jurisdiction_ids',
          name: 'Jurisdictions',
          placeholder: 'Select a country'
        },
        {
          id: 'areas_of_interest',
          name: 'Areas of interest',
          placeholder: 'Select a country'
        },
        {
          id: 'widget_ids',
          name: 'Indicators'
        },
        {
          id: 'dataSource',
          name: 'Data source',
          placeholder: 'Select an indicator',
          hide: true
        },
        {
          id: 'thresholds',
          name: '% Tree cover density',
          placeholder: 'Select an indicator'
        },
        {
          id: 'years',
          name: 'Years',
          placeholder: 'Select an indicator'
        }
      ],
      mandatorys: ['country_codes', 'widget_ids'],
      validationMsg: 'Please select, at least, a country, an indicator and a year',
      tresh: [10, 15, 20, 25, 30],
      switchs: [
        {
          el: 'outputTypeSwitch',
          param: 'pivot',
          label: 'Output Type',
          options: [{ label: 'Table', value: 0 }, { label: 'Pivot', value: 1 }]
        },
        {
          el: 'filerSwitch',
          param: 'json',
          label: 'File',
          options: [{ label: '.csv', value: 0 }, { label: '.json', value: 1 }]
        }
      ],

      el: '#download-page',
      template: Handlebars.compile(tpl),

      events: {
        'click #download-btn': 'onDownloadClick',
        'click #clear-btn': 'onClearClick'
      },

      initialize: function() {
        this.filterViews = [];
        this.switchViews = [];
        this.filterIndex = {};
        this.availableIndicators = [];
        this.jurisdictionsData = {};
        this.domCache();
        this.getData().then(
          function() {
            this.populate();
            this.render();
          }.bind(this)
        );
      },

      domCache: function() {
        this.filtersContainer = this.$('#filters-container');
      },

      getData: function() {
        return Promise.all([
          $.getJSON('api/widgets'),
          $.getJSON('api/countries')
        ]).then(
          function(data) {
            this.widgets = data[0].widgets;
            this.countries = data[1].countries;
          }.bind(this)
        );
      },

      populate: function() {
        this.filters.forEach(function(filter) {
          switch (filter.id) {
            case 'country_codes':
              filter.options = this.getCountryOptions();
              break;
            case 'jurisdiction_ids':
              filter.options = [];
              break;
            case 'widget_ids':
              filter.options = this.getIndicatorsOptions();
              break;
            case 'dataSource':
              filter.options = [];
              break;
            case 'thresholds':
              filter.options = [];
              break;
            case 'years':
              filter.options = [];
              break;
            default:
              filter.options = [];
          }
        }, this);
      },

      getCountryOptions: function() {
        return this.countries.map(function(country) {
          return {
            value: country.iso,
            name: country.name
          };
        });
      },

      getCountryData: function(iso) {
        return $.getJSON('api/countries/' + iso).then(
          function(data) {
            if (data && data.country && data.country) {
              var parseData = function(items) {
                return items.map(function(item) {
                  return {
                    value: item.id,
                    name: item.name
                  };
                });
              };
              var jurisdictionsData = {
                areasOfInterest: parseData(data.country.areas_of_interest),
                jurisdictions: parseData(data.country.jurisdictions)
              };
              this.jurisdictionsData[iso] = jurisdictionsData;
              return jurisdictionsData;
            }
            return [];
          }.bind(this)
        );
      },

      getIndicatorsOptions: function() {
        return this.widgets.map(function(widget) {
          return {
            value: widget.id + '',
            indicators: widget.indicators.map(function(indicator) {
              return indicator.id;
            }),
            name: widget.name
          };
        });
      },

      setClearVisibility: function(value) {
        if (!this.clearBtn) {
          this.clearBtn = this.$('#clear-btn');
        }
        if (value) {
          this.clearBtn.removeClass('-hide');
        } else {
          this.clearBtn.addClass('-hide');
        }
      },

      onIndicatorsChange: function(selection) {
        var dataSourceOptions = [];
        this.availableIndicators = [];
        this.widgets.forEach(function(widget) {
          if (
            _.include(selection, widget.id + '') &&
            widget.tabs &&
            widget.tabs.length > 0
          ) {
            widget.tabs.forEach(function(tab) {
              this.availableIndicators.push(tab);
              dataSourceOptions.push({
                value: tab.name,
                name: tab.name
              });
            }, this);
          }
        }, this);

        this.filterViews[this.filterIndex.dataSource].renderOptions(
          dataSourceOptions,
          ''
        );
        if (dataSourceOptions) {
          this.filterViews[this.filterIndex.dataSource].setAllMarked(true);
          this.onDataSourceChange(
            dataSourceOptions.map(function(option) {
              return option.value;
            })
          );
        } else {
          this.filterViews[this.filterIndex.dataSource].setAllMarked(false);
        }
        this.setClearVisibility(true);
      },

      onDataSourceChange: function(selection) {
        var years = [];
        var trhesAllowed = false;

        if (selection && selection.length) {
          this.availableIndicators.forEach(function(indicator) {
            if (_.include(selection, indicator.name)) {
              if (indicator.range) {
                years = _.union(years, indicator.range);
              }
              if (indicator.thresh) {
                trhesAllowed = true;
              }
            }
          }, this);

          var yearsOptions = [];
          var yearsMsg = '';
          var selectAllYears = false;
          if (years.length) {
            yearsOptions = years.map(function(year) {
              return { name: year, value: year };
            });
            selectAllYears = true;
          } else {
            yearsMsg = 'No years availables';
          }
          this.filterViews[this.filterIndex.years].renderOptions(
            yearsOptions,
            yearsMsg
          );
          this.filterViews[this.filterIndex.years].setAllMarked(selectAllYears);

          if (trhesAllowed) {
            var trheshOptions = this.tresh.map(function(thresh) {
              return { name: thresh, value: thresh, selected: thresh === 30 };
            });
            this.filterViews[this.filterIndex.thresholds].renderOptions(
              trheshOptions
            );
          } else {
            this.filterViews[this.filterIndex.thresholds].renderOptions(
              [],
              'Threshold selection is not allowed'
            );
          }
        } else {
          this.filterViews[this.filterIndex.thresholds].renderOptions(
            [],
            'Select a data source'
          );
          this.filterViews[this.filterIndex.years].renderOptions(
            [],
            'Select a data source'
          );
          this.filterViews[this.filterIndex.years].setAllMarked(false);
        }
      },

      getTreeCoverOptions: function() {
        return this.tresh.map(function(tresh) {
          return {
            value: tresh,
            name: tresh + '%'
          };
        });
      },

      getYearsOptions: function() {
        return this.years.map(function(year) {
          return {
            value: year,
            name: year
          };
        });
      },

      render: function() {
        this.filtersContainer.html(this.template({ filters: this.filters }));
        this.filters.forEach(function(filter, index) {
          var view = new DownloadFilterCardView({
            el: '#' + filter.id + '-filter-card',
            filter: filter
          });
          this.listenTo(
            view,
            'option:changed',
            this.onOptionChange.bind(this, filter.id)
          );
          var filterindex = {};
          filterindex[filter.id] = index;
          this.filterIndex = _.extend(this.filterIndex, filterindex);
          this.filterViews.push(view);
        }, this);

        this.switchs.forEach(function(option) {
          var view = new SwitchView({
            el: '#' + option.el,
            param: option.param,
            data: {
              label: option.label,
              options: option.options
            }
          });
          this.switchViews.push(view);
        }, this);
      },

      checkDownloadAvailable: function() {
        var mandatorysSelected = 0;
        var hasSelected = function(view) {
          if (!view) return false;
          if (view.selection && view.selection.length > 0) return true;
          return false;
        };
        this.filterViews.forEach(function(view) {
          if (_.include(this.mandatorys, view.filter.id) && hasSelected(view)) {
            mandatorysSelected += 1;
          }
        }, this);
        var isValid = mandatorysSelected === this.mandatorys.length;
        this.$('#download-btn').prop('disabled', !isValid);
        if (!this.validationMsgEl) {
          this.validationMsgEl = this.$('.validation-msg');
        }
        if (isValid) {
          this.validationMsgEl.addClass('-hide');
        } else {
          this.validationMsgEl.removeClass('-hide');
        }
      },

      onOptionChange: function(type, selection) {
        switch (type) {
          case 'country_codes':
            this.onCountryChange(selection);
            break;
          case 'widget_ids':
            this.onIndicatorsChange(selection);
            break;
          case 'dataSource':
            this.onDataSourceChange(selection);
            break;

          default:
            break;
        }
        this.checkDownloadAvailable();
      },

      onCountryChange: function(selection) {
        var jurisIndex = this.filterIndex.jurisdiction_ids;
        var aoiIndex = this.filterIndex.areas_of_interest;
        var jurisView = this.filterViews[jurisIndex];
        var aoiView = this.filterViews[aoiIndex];
        if (jurisView && aoiView) {
          if (selection && selection.length === 1) {
            var jurisdictions = [];
            var areasOfInterest = [];
            Promise.all(
              selection.map(
                function(country) {
                  if (!this.jurisdictionsData[country]) {
                    return this.getCountryData(country);
                  }
                  return this.jurisdictionsData[country];
                }.bind(this)
              )
            ).then(function(data) {
              if (data && data.length) {
                data.forEach(function(d) {
                  jurisdictions = d.jurisdictions.concat(jurisdictions);
                  areasOfInterest = d.areasOfInterest.concat(areasOfInterest);
                });
              }
              function sortByName(a, b) {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
              }

              var populateOptions = function(options, view, emptyMsg) {
                var sortedOptions = options;
                var hasOptions = options.length > 0;
                if (hasOptions) {
                  sortedOptions = options.sort(sortByName);
                }
                var msg = hasOptions > 0 ? '' : emptyMsg;
                view.renderOptions(sortedOptions, msg);
              };
              populateOptions(
                jurisdictions,
                jurisView,
                'There is no jurisdictions'
              );
              populateOptions(
                areasOfInterest,
                aoiView,
                'There is no area of interest'
              );
            });
          } else if (selection && selection.length > 1) {
            jurisView.renderOptions([], 'Please select only one country');
            jurisView.setAllMarked(false);
            aoiView.renderOptions([], 'Please select only one country');
            aoiView.setAllMarked(false);
          } else {
            jurisView.renderOptions([]);
            jurisView.setAllMarked(false);
            aoiView.renderOptions([]);
            aoiView.setAllMarked(false);
          }
          this.setClearVisibility(true);
        }
      },

      onClearClick: function() {
        this.filterViews.forEach(function(view) {
          view.setAllMarked(false);
        });
        this.setClearVisibility(false);
      },

      onDownloadClick: function(e) {
        e.preventDefault();
        var downloadUrl = '/api/data_portal_downloads'; // TODO: move this to .env
        var query = '';
        var firstParam = true;
        this.filterViews.forEach(function(view, index) {
          if (view.selection.length > 0) {
            if ((index === 0 && firstParam) || query === '') {
              firstParam = false;
              query += '?';
            } else {
              query += '&';
            }
            var value = view.selection.join(',');
            query += view.filter.id + '[]=' + value;
          }
        });

        this.switchViews.forEach(function(view, index) {
          if (view.value === '1') {
            if ((index === 0 && firstParam) || query === '') {
              firstParam = false;
              query += '?';
            } else {
              query += '&';
            }
            query += view.param + '=' + view.value;
          }
        });

        window.open(downloadUrl + query, '_blank');
      }
    });

    return DataDownloadIndexView;
  }
);
