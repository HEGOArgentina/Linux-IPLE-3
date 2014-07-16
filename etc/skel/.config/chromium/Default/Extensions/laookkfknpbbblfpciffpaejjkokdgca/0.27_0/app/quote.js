// Quote widget


// Models

m.models.ShortQuote = Backbone.Model.extend({
    parse: function(response) {
        this.set({ body: response.body });
    }
});


// Collections

m.collect.ShortQuotes = Backbone.Collection.extend({
    model: m.models.ShortQuote,
    url: 'app/quotes.json',
    parse: function (response) {
        return response.quotes;
    }
});


// Views

m.views.ShortQuote = Backbone.View.extend({
    tagName: 'blockquote',
    attributes: { id: 'shortquote' },
    template: Handlebars.compile( $("#shortquote-template").html() ),
    initialize: function () {
        this.render();
        this.listenTo(m, 'newDay', this.loadNewQuote, this);
    },
    render: function () {
        var that = this;
        var index = window.localStorage['shortquote'] || 0;
        window.localStorage['shortquote'] = index;
        var body = this.collection.at(index).get('body');

        var variables = { body: body };
        var order = (this.options.order  || 'append') + 'To';

        that.$el[order]('#' + that.options.region).html(that.template(variables));
    },
    loadNewQuote: function () {
        var index = parseInt(window.localStorage['background']);
        var newIndex = Math.floor(Math.random()*this.collection.models.length);
        if (newIndex == index) newIndex + 1;
        if (newIndex == this.collection.models.length) newIndex = 0;
        window.localStorage['shortquote'] = index;
        this.render();
    }
});
