App = Ember.Application.create()

App.ApplicationAdapter = DS.FixtureAdapter.extend()

App.LineItem = DS.Model.extend( {
    name: DS.attr( 'string' ),
    cost:  DS.attr( 'number' ),
    time: DS.attr( 'date' )
} )
