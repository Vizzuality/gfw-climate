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
          name: 'Countries',
          hideAll: true
        },
        {
          id: 'jurisdiction_ids',
          name: 'Jurisdictions',
          placeholder: 'Select a country'
        },
        {
          id: 'indicator_ids',
          name: 'Indicators'
        },
        {
          id: 'dataSource',
          name: 'Data source',
          placeholder: 'Select a indicator'
        },
        {
          id: 'thresholds',
          name: '% Tree cover density',
          placeholder: 'Select a indicator'
        },
        {
          id: 'years',
          name: 'Years',
          placeholder: 'Select a indicator'
        }
      ],
      mandatorys: ['country_codes', 'indicator_ids'],
      validationMsg: 'Please select, at least, a country and a indicator',
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
        'click #download-btn': 'onDownloadClick'
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
            case 'indicator_ids':
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

      getJurisdictionsOptions: function(iso) {
        return $.getJSON('api/countries/' + iso).then(
          function(data) {
            if (data && data.country && data.country.jurisdictions) {
              this.jurisdictionsData[iso] = data.country.jurisdictions;
              return data.country.jurisdictions.map(function(juris) {
                return {
                  value: juris.name,
                  name: juris.name
                };
              });
            }
            return [];
          }.bind(this)
        );
      },

      getIndicatorsOptions: function() {
        return this.widgets.map(function(widget) {
          return {
            value: widget.slug,
            name: widget.name
          };
        });
      },

      onIndicatorsChange: function(selection) {
        var dataSourceOptions = [];
        this.availableIndicators = [];
        this.widgets.forEach(function(widget) {
          if (
            _.include(selection, widget.slug) &&
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
          dataSourceOptions
        );
        this.filterViews[this.filterIndex.thresholds].renderOptions(
          [],
          'Select a data source'
        );
        this.filterViews[this.filterIndex.years].renderOptions(
          [],
          'Select a data source'
        );
      },

      onDataSourceChange: function(selection) {
        var years = [];
        var trhesAllowed = true;

        this.availableIndicators.forEach(function(indicator) {
          if (_.include(selection, indicator.name)) {
            years = _.union(years, indicator.range);
            if (!indicator.thresh) {
              trhesAllowed = false;
            }
          }
        }, this);

        var yearsOptions = years.map(function(year) {
          return { name: year, value: year };
        });
        this.filterViews[this.filterIndex.years].renderOptions(yearsOptions);

        if (trhesAllowed) {
          var trheshOptions = this.tresh.map(function(thresh) {
            return { name: thresh, value: thresh };
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
          case 'indicator_ids':
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
        var jurisView = this.filterViews[jurisIndex];
        if (jurisView) {
          if (selection && selection.length > 0) {
            var options = [];
            Promise.all(
              selection.map(
                function(country) {
                  if (!this.jurisdictionsData[country]) {
                    return this.getJurisdictionsOptions(country);
                  }
                  return this.jurisdictionsData[country];
                }.bind(this)
              )
            ).then(
              function(data) {
                if (data && data.length) {
                  data.forEach(function(jurisdiction) {
                    options = options.concat(jurisdiction);
                  });
                }
                function sortByName(a, b) {
                  if (a.name < b.name) return -1;
                  if (a.name > b.name) return 1;
                  return 0;
                }

                if (options.length) {
                  options = options.sort(sortByName);
                }
                this.filterViews[jurisIndex].renderOptions(options);
              }.bind(this)
            );
          } else {
            this.filterViews[jurisIndex].renderOptions([]);
          }
        }
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
            query += view.filter.id + '[]=' + view.selection.join(',');
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
