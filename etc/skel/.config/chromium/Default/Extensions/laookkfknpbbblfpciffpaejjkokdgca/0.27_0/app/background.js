// Background feature


// Models

m.models.Background = Backbone.Model.extend({
    parse: function(response) {
        this.set({ 'filename': response.filename, 'title': response.title, 'source': response.source, 'sourceUrl': response.sourceUrl });
    }
});


// Collections

m.collect.Backgrounds = Backbone.Collection.extend({
    model: m.models.Background,
    url: 'app/backgrounds.json',
    parse: function (response) {
        return response.backgrounds;
    }
});


// Views

m.views.Background = Backbone.View.extend({
    tagName: 'li',
    attributes: {  },
    // JO: Testing setting background without a template
    //template: Handlebars.compile( $("#background-template").html() ),
    initialize: function () {
        this.render();
        this.listenTo(m, 'newDay', this.loadNewBg, this);
    },
    render: function () {
        var that = this;
        var index = window.localStorage['background'] || 0;
        window.localStorage['background'] = index;
        var filename = this.collection.at(index).get('filename');
        var title = this.collection.at(index).get('title');
        var source = this.collection.at(index).get('source');
        var sourceUrl = this.collection.at(index).get('sourceUrl');
        var order = (this.options.order || 'append') + 'To';

        // JO: Hack to get the backgrounds to fade between each other; replace with background subviews and separate LIs
        $('#background').css('background-image',$('#background').find('li').css('background-image'));

        // JO: Make sure the background image loads before displaying (even locally there can be a small delay)
        $('<img/>').attr('src', 'backgrounds/' + filename).load(function() {
            that.$el[order]('#' + that.options.region).css('background-image','url(backgrounds/' + filename + ')').css('opacity','0').fadeTo(200, 1);
            $(this).remove();
        });

        // JO: Render Background Info subview
        this.backgroundInfo = new m.views.BackgroundInfo({ region: 'bottom-left', title: title, source: source, sourceUrl: sourceUrl });
        var order = (this.backgroundInfo.options.order  || 'append') + 'To';
        $('#background-info').remove();
        this.backgroundInfo.render().$el[order]('#' + this.backgroundInfo.options.region);
    },
    loadNewBg: function () {
        // attempting to solve the race condition where multiple tabs are open
        var now = new Date();
        var backgroundUpdate = new Date(localStorage.backgroundUpdate);

        if (Date.parse(now) > Date.parse(backgroundUpdate) || !m.isValidDate(backgroundUpdate)) {
            localStorage.backgroundUpdate = now;

            var index = localStorage.background;
            var newIndex = Math.floor(Math.random()*this.collection.models.length);
            if (newIndex == index) newIndex + 1;
            if (newIndex == this.collection.models.length) newIndex = 0;

            localStorage.background = newIndex;
        }

        this.render();
    }
});

m.views.BackgroundInfo = Backbone.View.extend({
    tagName: 'div',
    attributes: { id: 'background-info', class: 'light' },
    template: Handlebars.compile($("#background-info-template").html()),
    events: {
        "mouseenter": "removeFade",
        "mouseleave": "addFade"
    },
    initialize: function () {
        this.addFade();
    },
    render: function () {
        var title = this.options.title;
        if (!title) {
            title = "";
            this.$el.addClass('title-unknown');
        }
        var source = this.options.source
        if (!source) {
            source = "";
            this.$el.addClass('source-unknown');
        }
        var sourceUrl = this.options.sourceUrl;
        var variables = { title: title, source: source, sourceUrl: sourceUrl };
        this.$el.html(this.template(variables));

        return this;
    },
    removeFade: function() {
        _gaq.push(['_trackEvent', 'BackgroundInfo', 'Hover']);
        this.$el.removeClass('fadeout');
    },
    addFade: function(options) {
        this.$el.addClass('fadeout');
    }
});
