define([
  'backbone',
  'handlebars',
  'underscore',
  'chosen',
  'compare/presenters/CompareSelectorsPresenter',
  'helpers/CountryHelper',
  'text!compare/templates/compareSelector.handlebars'
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
      this.helper = CountryHelper;

      enquire.register("screen and (max-width:"+window.gfw.config.GFW_MOBILE+"px)", {
        match: _.bind(function(){
          this.mobile = true;
        },this)
      });

      enquire.register("screen and (min-width:"+window.gfw.config.GFW_MOBILE+"px)", {
        match: _.bind(function(){
          this.mobile = false;
        },this)
      });
    },

    showModal: function(e) {
      this.presenter.showModal($(e.currentTarget).data('tab'));
    },

    render: function() {
      this.$el.html(this.template(this._parseData()));

      if (!this.mobile) {
        (!!this.status.get('compare1')) ? this._drawCountries(1) : null;
        (!!this.status.get('compare2')) ? this._drawCountries(2) : null;
      }
    },

    _parseData: function() {
      var country1 = this.status.get('country1').toJSON();
      var country2 = this.status.get('country2').toJSON();

      var select1 = {
        tab: '1',
        name: this.setName(country1,1),
        classname: this.setClass(1),
      };

      var select2 = {
        tab: '2',
        name: this.setName(country2,2),
        classname: this.setClass(2),
      };

      return { selection: [select1, select2] };
    },

    _drawCountries: function(tab) {
      var compare = this.status.get('compare'+tab);
      if (!!compare.iso && !!compare.jurisdiction) {
        var sql = ["SELECT",
                   "ST_Simplify(ST_RemoveRepeatedPoints(the_geom, 0.00005), 0.01) AS the_geom",
                   "FROM gadm27_adm1",
                   "WHERE iso = '"+compare.iso+"'",
                   "AND id_1 = '"+compare.jurisdiction+"'&format=topojson"].join(' ');
      } else {
        var sql = ["SELECT",
                   "ST_Simplify(ST_RemoveRepeatedPoints(the_geom, 0.00005), 0.01) AS the_geom",
                   "FROM gadm27_adm0",
                   "WHERE iso = '"+compare.iso+"'&format=topojson"].join(' ');
      }

      d3.json('https://wri-01.cartodb.com/api/v2/sql?q='+sql, _.bind(function(error, topology) {
        this.helper.draw(topology, 0, 'compare-figure'+tab, { alerts: true });
      }, this ));
    },

    setName: function(country,tab) {
      var jurisdiction = ~~this.status.get('compare'+tab).jurisdiction;
      var area = ~~this.status.get('compare'+tab).area;
      if (!!jurisdiction) {
        return _.findWhere(country.jurisdictions, {id: jurisdiction}).name +' in ' + country.name;
      } else if (!!area) {
        return _.findWhere(country.areas_of_interest, {id: area }).name +' in ' + country.name;
      } else {
        return country.name;
      }
    },

    setClass: function(tab) {
      var jurisdiction = ~~this.status.get('compare'+tab).jurisdiction;
      var area = ~~this.status.get('compare'+tab).area;
      if (!!jurisdiction) {
        return 'jurisdiction';
      } else if (!!area) {
        return 'areas';
      } else {
        return '';
      }
    }

  });

  return CompareSelectorsView;

});
