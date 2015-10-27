define([
  'mps',
  'backbone',
  'widgets/models/WidgetModel',
  'countries/presenters/PresenterClass'
], function(mps, Backbone, WidgetModel, PresenterClass) {

  'use strict';

  var WidgetPresenter = PresenterClass.extend({

    init: function(view, setup) {
      this.view = view;
      this._super();
      this.model = new WidgetModel(setup.model);
      this.status = new (Backbone.Model.extend({
        defaults: setup.status
      }));

      this._setListeners();
    },

    _setListeners: function() {
      this.status.on('change:tabs', this.setTab, this);
    },

    changeTab: function(position) {
      var tabs = _.clone(this.status.get('tabs'));
      tabs.position = position;
      this.status.set('tabs',tabs);
    },

    changeStatus: function(status) {
      this.status.set(status);
    },

    setTab: function() {
      this.view.setTab();
      this.publish();
    },

    publish: function() {
      mps.publish('Options/updated', [this.model.get('id'),this.model.get('slug'),this.status.toJSON()]);
    }

  });

  return WidgetPresenter;

});
