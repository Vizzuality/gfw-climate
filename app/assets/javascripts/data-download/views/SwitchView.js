define(
  [
    'backbone',
    'underscore',
    'handlebars',
    'text!data-download/templates/switch.handlebars'
  ],
  function(Backbone, _, Handlebars, tpl) {
    'use strict';
    var DataDownloadIndexView = Backbone.View.extend({
      template: Handlebars.compile(tpl),

      events: {
        'click .js-option': 'onOptionChange'
      },

      initialize: function(settings) {
        this.render(settings.data);
        this.param = settings.param;
      },

      render: function(data) {
        this.$el.html(this.template(data));
        this.value = this.$('.js-option')[0].dataset.value;
      },

      onOptionChange: function(e) {
        var item = e.currentTarget;
        if (item) {
          this.$('.js-option').each(function(index, item) {
            item.classList.remove('is-active');
          });
          item.classList.add('is-active');
          this.value = item.dataset.value;
        }
      }
    });

    return DataDownloadIndexView;
  }
);
