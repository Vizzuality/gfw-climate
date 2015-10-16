define([
  'backbone',
  'compare/presenters/CompareGridPresenter',
  'text!compare/templates/compareGrid.handlebars',
], function(Backbone, CompareMainPresenter, tpl) {

  var CompareMainView = Backbone.View.extend({

    el: '#compareGridView',

    template: Handlebars.compile(tpl),

    initialize:function() {
      this.presenter = new CompareMainPresenter(this);
      this.status = this.presenter.status;
    },

    setListeners: function() {

    },

    render: function() {
      console.log(this.parseData());
      this.$el.html(this.template(this.parseData()));



      _.map(this.status.get('data'), _.bind(function(c){
        var $el = $('#compare-grid-'+c.iso);

        _.each(c.widgets, function(w) {
          console.log(w);
          var deferred = $.Deferred();
          // var currentWidget = new WidgetView({
          //   id: w.id,
          //   options: this.widgets[id]
          // });

        })

        console.log(c);
      }, this ))
      // var widgets = [],
      //   promises = [],
      //   widgetsId = this._getWidgetsId();

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

    parseData: function() {
      return { countries: this.status.get('data') };
    }



  });

  return CompareMainView;

});
