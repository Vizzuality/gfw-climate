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

    render: function(country1, country2) {
      var selection = [];

      var country1 = country1.toJSON();
      var country2 = country2.toJSON();

      console.log(this.status.get('compare1').jurisdiction);
      console.log(!this.status.get('compare1').jurisdiction);
      console.log(!!this.status.get('compare1').jurisdiction);
      console.log(!!!this.status.get('compare1').jurisdiction);

      var select1 = {
        tab: '1',
        iso: country1.iso || null,
        name: country1.name || null,
        jurisdiction: !!this.status.get('compare1').jurisdiction ? (_.findWhere(country1.jurisdictions, {id: ~~this.status.get('compare1').jurisdiction}).name) : null,
        area: this.status.get('compare1').area ? country1.forests[~~this.status.get('compare1').area].type : null
      };

      var select2 = {
        tab: '2',
        iso: country2.iso || null,
        name: country2.name || null,
        jurisdiction: !!this.status.get('compare2').jurisdiction ? (_.findWhere(country2.jurisdictions, {id: ~~this.status.get('compare2').jurisdiction}).name) : null,
        area: this.status.get('compare2').area ? country2.forests[~~this.status.get('compare1').area].type : null
      };

      selection.push(select1);
      selection.push(select2);

      this.$el.html(this.template({'selection': selection}));

      var that = this;

      $.each(selection, function() {
        that._drawCountries(this.iso, this.tab);
      })
    },

    _drawCountries: function(iso, tab) {
      var that = this;

      var sql = ['SELECT c.iso, c.enabled, m.the_geom',
                 'FROM ne_50m_admin_0_countries m, gfw2_countries c',
                 'WHERE c.iso = m.adm0_a3 AND c.enabled',
                 "AND c.iso = '"+iso+"'&format=topojson"].join(' ');

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q='+sql, _.bind(function(error, topology) {
        this.helper.draw(topology, 0, iso, { alerts: true });
      }, this ));

    }

  });

  return CompareSelectorsView;

});
