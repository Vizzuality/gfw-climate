define([
  'backbone',
  'jquery',
  'countries/models/CountryModel',
  'countries/views/show/RouterView',
  'countries/views/show/CountryShowHeaderView',
  'countries/views/show/TabsView',
  'countries/views/show/WidgetGridView',
  'countries/views/CountryModalView'
], function(Backbone, $, CountryModel, RouterView, CountryShowHeaderView,
  TabsView, WidgetGridView, CountryModalView) {

  var CountryShowView = Backbone.View.extend({

    initialize: function(arguments) {
      this.model = CountryModel;
      this.model.setCountry(arguments.data);

      var complete = _.invoke([this.model], 'fetch');

      $.when.apply($, complete).done(_.bind(function() {
        this.routerView = new RouterView();

        this.headerView = new CountryShowHeaderView(this.model);
        this.tabsView   = new TabsView(this.model);
        this.gridView   = new WidgetGridView(this.model);
        this.modalView  = new CountryModalView(this.model);

        this.setListeners();
      }, this));
    },

    setListeners: function() {
      this.listenTo(this.tabsView.model, 'change', this.update);
      this.listenTo(this.gridView.model, 'change', this.update);
    },

    update: function() {}

  });

  return CountryShowView;

});
