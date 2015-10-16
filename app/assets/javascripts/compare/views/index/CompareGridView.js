define([
  'backbone',
  'compare/presenters/CompareGridPresenter',
], function(Backbone, CompareMainPresenter) {

  var CompareMainView = Backbone.View.extend({

    el: '#compareResultsView',

    initialize:function() {
      this.presenter = new CompareMainPresenter(this);
      this.status = this.presenter.status;
    },

    setListeners: function() {

    },

    render: function() {
      console.log('render Widgets GRID');
      // var widgets = [],
      //   promises = [],
      //   widgetsId = this._getWidgetsId();

      // this.$el.html(this.template());

      // widgetsId.forEach(_.bind(function(id) {

      //   if (_.has(this.widgets, id)) {

      //     var deferred = $.Deferred();
      //     var currentWidget = new WidgetView({
      //       id: id,
      //       options: this.widgets[id]
      //     });

      //     widgets.push(currentWidget);

      //     currentWidget._loadMetaData(function(data) {
      //       deferred.resolve(data);
      //     });

      //     promises.push(deferred);
      //   }

      // }, this));

      // var self = this;

      // $.when.apply(null, promises).then(function() {
      //   widgets.forEach(function(widget) {
      //     widget.render();
      //     self.$el.append(widget.el);
      //   });
      // });

      // return this;

    },



  });

  return CompareMainView;

});
