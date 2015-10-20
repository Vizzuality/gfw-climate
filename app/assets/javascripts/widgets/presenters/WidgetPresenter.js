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
      this.model = new WidgetModel({
        id: setup.id,
        iso: setup.iso
      });
      this.status = new (Backbone.Model.extend({
        defaults: setup.options[0]
      }));

      this._setListeners();
    },

    _setListeners: function() {
      this.status.on('change:tabs', this.onChangeTab, this);
    },

    onChangeTab: function() {
      this.view.setTab();
    },

  });

  return WidgetPresenter;

});
