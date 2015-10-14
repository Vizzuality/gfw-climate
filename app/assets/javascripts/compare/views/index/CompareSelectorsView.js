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

    areasOfInterest: [{ name: 'Tree plantations',id: 1,},{ name: 'Protected areas',id: 2,},{ name: 'Primary forests',id: 3,},{ name: 'Moratorium areas',id: 4,},{ name: 'Mining concessions',id: 5,},{ name: 'Logging concessions',id: 6,},{ name: 'Plantation concessions',id: 7,},{ name: 'Key biodiversity areas',id: 8,}],


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
      this.$el.html(this.template(this._parseData()));
      (!!this.status.get('compare1')) ? this._drawCountries(1) : null;
      (!!this.status.get('compare2')) ? this._drawCountries(2) : null;
    },

    _parseData: function() {
      var selection = [];
      var country1 = this.status.get('country1').toJSON();
      var country2 = this.status.get('country2').toJSON();

      var select1 = {
        tab: '1',
        iso: country1.iso || null,
        name: country1.name || null,
        jurisdiction: (!!~~this.status.get('compare1').jurisdiction) ? (_.findWhere(country1.jurisdictions, {id: ~~this.status.get('compare1').jurisdiction}).name) : null,
        area: (!!~~this.status.get('compare1').area) ? _.findWhere(this.areasOfInterest, {id: ~~this.status.get('compare1').area }).name : null,
      };

      var select2 = {
        tab: '2',
        iso: country2.iso || null,
        name: country2.name || null,
        jurisdiction: (!!~~this.status.get('compare2').jurisdiction) ? (_.findWhere(country2.jurisdictions, {id: ~~this.status.get('compare2').jurisdiction}).name) : null,
        area: (!!~~this.status.get('compare2').area) ? _.findWhere(this.areasOfInterest, {id: ~~this.status.get('compare2').area }).name : null,
      };

      selection.push(select1);
      selection.push(select2);

      return { selection: selection };
    },

    _drawCountries: function(tab) {
      var compare = this.status.get('compare'+tab);
      if (!!compare.iso && !!compare.jurisdiction) {
        var sql = ["SELECT m.the_geom",
                   "FROM gadm_1_all m",
                   "WHERE m.iso = '"+compare.iso+"'",
                   "AND m.id_1 = '"+compare.jurisdiction+"'&format=topojson"].join(' ');
      } else {
        var sql = ["SELECT m.the_geom",
                   "FROM ne_50m_admin_0_countries m",
                   "WHERE m.adm0_a3 = '"+compare.iso+"'&format=topojson"].join(' ');
      }

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q='+sql, _.bind(function(error, topology) {
        this.helper.draw(topology, 0, 'compare-figure'+tab, { alerts: true });
      }, this ));
    }

  });

  return CompareSelectorsView;

});
