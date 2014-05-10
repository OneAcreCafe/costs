App = Ember.Application.create()

App.ApplicationAdapter = DS.FixtureAdapter.extend()

App.Well = DS.Model.extend( {
    name: DS.attr( 'string' ),
    asset_id:  DS.attr( 'number' ),
    readings: DS.hasMany( 'reading', { async: true } )
} )

App.Reading = DS.Model.extend( {
    time: DS.attr( 'date' ),
    mcf:  DS.attr( 'number' ),
    line:  DS.attr( 'number' ),
    tbg:  DS.attr( 'number' ),
    csg:  DS.attr( 'number' ),
    well: DS.belongsTo( 'well' )
} )

App.IndexRoute = Ember.Route.extend({
  init: function() {
    this._super()
    this.set( 'wells', this.get( 'store' ).find( 'well' ) )
  },
  actions: {
    save: function() {
      var self = this
      var store = this.get( 'store' )
      store.find( 'well', $('#well').val() ).then( function( well ) {
        var reading = store.createRecord( 'reading', {
          well: well,
          time: new Date(),
          mcf: $('#mcf').val(),
          line: $('#line').val(),
          tbg: $('#tbg').val(),
          csg: $('#csg').val()
        } )
        reading.save()

        well.get( 'readings' ).then( function( readings ) {
          readings.pushObject( reading )
        } )
      } )
    }
  },
  model: function() {
    return this.get( 'store' ).find( 'well' )
  }
} )

App.Well.FIXTURES = [
    { id: 1, asset_id: 1219, name: "GLASS 7", readings: [1, 2, 5] },
    { id: 2, asset_id: 1224, name: "GASTON 2" },
    { id: 3, asset_id: 1225, name: "GASTON 3", readings: [3, 4] }
]

App.Reading.FIXTURES = [
    { id: 1, time: new Date(), well: 1, mcf: 1.2, line: 34.5, tbg: 76, csg: 56 },
    { id: 2, time: new Date(), well: 1, mcf: 1.2, line: 34.5, tbg: 76, csg: 56 },
    { id: 3, time: new Date(), well: 3, mcf: 1.2, line: 34.5, tbg: 76, csg: 56 },
    { id: 4, time: new Date(), well: 3, mcf: 1.2, line: 34.5, tbg: 76, csg: 56 },
    { id: 5, time: new Date(), well: 1, mcf: 1.2, line: 34.5, tbg: 76, csg: 56 }
]
