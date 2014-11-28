var myapp = angular.module('myApp', ['ngRoute']);
myapp.config(function ($interpolateProvider) {
//    $interpolateProvider.startSymbol('{[{');
//    $interpolateProvider.endSymbol('}]}');
});

myapp.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
      controller:'ListCtrl',
      templateUrl:'news.html'
    })
    .when('/chart', {
      controller:'dataCtrl',
      templateUrl:'chart.html'
    })
    .when('/map', {
      controller:'ListCtrl',
      templateUrl:'map.html'
    })
    .otherwise({
      templateUrl:'cant'
    });
});

myapp.controller('ListCtrl', function ($scope) {
});

myapp.controller('dataCtrl', function ($scope, $q, $http) {
    
    $scope.getjsondata = function() {
        return $scope.jsondata;
    };


    title = ['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06',
             '2013-01-07', '2013-01-08', '2013-01-09', '2013-01-10', '2013-01-11', '2013-01-12'];
    chart_data_total = [title];
    chart_data_red = [title];
    chart_data_orange = [title];

    var deferred = $q.defer();
    deferred.promise.then(function(){
    years = ['2014', '2013', '2012'];
    
    var deferred = $q.defer();
    for(key in years) {
      console.log(key);
      (function(key) {
        console.log(years[key]);

        $http.get('/data/' + years[key] + '/average.json').success(function (data) {
          //$scope.jsondata = data;
          tmp_total = [years[key]];
          tmp_red = [years[key]];
          tmp_orange = [years[key]];

          for(data_key in data) {
            tmp_d = data[data_key];
            for(k in tmp_d) {
              if(k == 'a_total_people')
                tmp_total.push(tmp_d[k]);
              if(k == 'a_red_line_people')
                tmp_red.push(tmp_d[k]);
              if(k == 'a_orange_line_people')
                tmp_orange.push(tmp_d[k]);
            }
          }
          chart_data_total.push(tmp_total);
          chart_data_red.push(tmp_red);
          chart_data_orange.push(tmp_orange);
          console.log(chart_data_total[key]);
        });
        //console.log(chart_data_total[key]);
      })(key);
      
    }
      
    return deferred.promise;
    })
    
    .then(function(){
      console.log('5566');
      var chart1 = c3.generate({
                      bindto: '#chart1',
                      data: {
                            x: 'x',
                        columns: chart_data_total
                      },
                      axis: {
                        x: {
                          type: 'timeseries',
                          tick: {
                            format: '%d'
                          }
                        }
                      }
                  });
    });

    deferred.resolve("sword");


     var chart2 = c3.generate({
                         bindto: '#chart2',
                         data: {
                           x: 'x',
                           columns: [
                             ['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06',
                                   '2013-01-07', '2013-01-08', '2013-01-09', '2013-01-10', '2013-01-11', '2013-01-12'
                             ],
                             ['2014', 30, 200, 100, 400, 150, 250],
                             ['2013', 130, 340, 200, 500, 250, 350, 3333]
                           ]
                         },
                         axis: {
                             x: {
                                type: 'timeseries',
                                tick: {
                                  format: '%d'
                                }
                             }
                        }
    });
});
