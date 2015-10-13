define([
  'backbone',
  'handlebars',
  'underscore',
  'chosen',
  'compare/presenters/CompareSelectorsPresenter',
  'countries/helpers/CountryHelper',
  'text!compare/templates/compareSelectorTpl.handlebars'
], function(Backbone, Handlebars, _, chosen, CompareSelectorsPresenter, CountryHelper, tpl) {

  var CompareSelectorsView = Backbone.View.extend({

    el: '#compareSelectorsView',

    template: Handlebars.compile(tpl),

    events: {
      'click .m-compare-selector' : 'showModal'
    },

    areasOfInterest: [
      { name: 'TREE PLANTATIONS',id: 1,},
      { name: 'PROTECTED AREAS',id: 2,},
      { name: 'PRIMARY FORESTS',id: 3,},
      { name: 'MORATORIUM AREAS',id: 4,},
      { name: 'MINING CONCESSIONS',id: 5,},
      { name: 'LOGGING CONCESSIONS',id: 6,},
      { name: 'PLANTATION CONCESSIONS',id: 7,},
      { name: 'KEY BIODIVERSITY AREAS',id: 8,}
    ],

    initialize:function() {
      this.presenter = new CompareSelectorsPresenter(this);
      this.status = this.presenter.status;

      this._setListeners();
      this._cacheVars();

      this.helper = CountryHelper;
    },

    _setListeners: function() {
    },

    _cacheVars: function() {
    },

    showModal: function(e) {
      this.presenter.showModal($(e.currentTarget).data('tab'));
    },

    render: function() {
      var selection = this._parseData();

      this.$el.html(this.template({'selection': selection}));

      var that = this;

      $.each(selection, function() {
        that._drawCountries(this.iso, this.containerId);
      })
    },

    _parseData: function() {
      var selection = [];
      var country1 = this.status.get('country1').toJSON();
      var country2 = this.status.get('country2').toJSON();

      var select1 = {
        tab: '1',
        iso: country1.iso || null,
        name: country1.name || null,
        jurisdiction: this.status.get('compare1').jurisdiction && this.status.get('compare1').jurisdiction != 0 ? (_.findWhere(country1.jurisdictions, {id: ~~this.status.get('compare1').jurisdiction}).name) : null,
        area: this.status.get('compare1').area && this.status.get('compare1').area != 0 ? _.findWhere(this.areasOfInterest, {id: ~~this.status.get('compare1').area }).name : null,
        containerId: country1.iso + this.status.get('compare1').jurisdiction + this.status.get('compare1').area
      };

      var select2 = {
        tab: '2',
        iso: country2.iso || null,
        name: country2.name || null,
        jurisdiction: this.status.get('compare2').jurisdiction && this.status.get('compare2').jurisdiction != 0 ? (_.findWhere(country2.jurisdictions, {id: ~~this.status.get('compare2').jurisdiction}).name) : null,
        area: this.status.get('compare2').area && this.status.get('compare2').area != 0 ? _.findWhere(this.areasOfInterest, {id: ~~this.status.get('compare2').area }).name : null,
        containerId: country2.iso + this.status.get('compare2').jurisdiction + this.status.get('compare2').area
      };

      selection.push(select1);
      selection.push(select2);

      console.log(selection)

      return selection;
    },

    _drawCountries: function(iso, containerId) {
      var that = this;

      var sql = ['SELECT c.iso, c.enabled, m.the_geom',
                 'FROM ne_50m_admin_0_countries m, gfw2_countries c',
                 'WHERE c.iso = m.adm0_a3 AND c.enabled',
                 "AND c.iso = '"+iso+"'&format=topojson"].join(' ');

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q='+sql, _.bind(function(error, topology) {
        this.helper.draw(topology, 0, containerId, { alerts: true });
      }, this ));

    }

  });

  return CompareSelectorsView;

});
