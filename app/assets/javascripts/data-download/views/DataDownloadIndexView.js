define(
  [
    'backbone',
    'handlebars',
    'bluebird',
    'jquery',
    'data-download/views/DownloadFilterCardView',
    'helpers/utilsHelper',
    'text!data-download/templates/download-filters.handlebars'
  ],
  function(
    Backbone,
    Handlebars,
    Promise,
    $,
    DownloadFilterCardView,
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
          name: 'Jurisdictions'
        },
        {
          id: 'indicator_ids',
          name: 'Indicators'
        },
        {
          id: 'dataSource', // TODO: define this
          name: 'Data source'
        },
        {
          id: 'thresholds',
          name: '% Tree cover density'
        },
        {
          id: 'years',
          name: 'Years'
        }
      ],
      tresh: [10, 15, 20, 25, 30],
      years: [
        2001,
        2002,
        2003,
        2004,
        2005,
        2006,
        2007,
        2008,
        2009,
        2010,
        2011,
        2012,
        2013,
        2014,
        2015
      ],

      el: '#download-page',
      template: Handlebars.compile(tpl),

      events: {
        'click #download-btn': 'onDownloadClick'
      },

      initialize: function() {
        this.filterViews = [];
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
              filter.options = this.getDatasSourceOptions();
              break;
            case 'thresholds':
              filter.options = this.getTreeCoverOptions();
              break;
            case 'years':
              filter.options = this.getYearsOptions();
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
                  value: UtilsHelper.slugify(juris.name), // TODO: find a way to identify the jurisdictions
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

      getDatasSourceOptions: function() {
        var options = [];
        this.widgets.forEach(function(widget) {
          if (widget.tabs) {
            widget.tabs.forEach(function(tab) {
              options.push({
                value: UtilsHelper.slugify(tab.name), // TODO: same than jurisdictions
                name: tab.name
              });
            }, this);
          }
        }, this);
        return options;
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
          if (filter.id === 'country_codes') {
            this.listenTo(
              view,
              'option:changed',
              this.onCountryChange.bind(this)
            );
          }
          if (filter.id === 'jurisdiction_ids') {
            this.jurisdictionIndex = index;
          }
          this.filterViews.push(view);
        }, this);
      },

      onCountryChange: function(selection) {
        var jurisView = this.filterViews[this.jurisdictionIndex];
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
                this.filterViews[this.jurisdictionIndex].renderOptions(options);
              }.bind(this)
            );
          } else {
            this.filterViews[this.jurisdictionIndex].renderOptions([]);
          }
        }
      },

      onDownloadClick: function(e) {
        e.preventDefault();
        var downloadUrl = '/api/data_portal_downloads'; // TODO: move this to .env
        var query = '';
        this.filterViews.forEach(function(view, index) {
          if (view.selection.length > 0) {
            if (index === 0 || query === '') {
              query += '?';
            } else {
              query += '&';
            }
            query += view.filter.id + '[]=' + view.selection.join(',');
          }
        });
        window.open(downloadUrl + query, '_blank');
      }
    });

    return DataDownloadIndexView;
  }
);
