// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-getting-started-intermediate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .controller('AuthLoginController', ['$scope', 'AuthService', '$state',
    function($scope, AuthService, $state) {
      $scope.user = {
        email: '',
        password: '',
      };

      $scope.login = function() {
        AuthService.login($scope.user.email, $scope.user.password)
        .then(function() {
          $state.go('current-order');
        });
      };
    }])


  .controller('RegisterController', ['$scope', 'AuthService', 'Order', '$state',
    function($scope, AuthService, Order, $state) {
      $scope.user = {
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        address: '',
        unitNum: '',
        city: '',
        state: '',
        zipcode: ''
      };

      $scope.order = { date: '' };

      $scope.register = function() {
        AuthService.register(
          $scope.user.email, 
          $scope.user.password, 
          $scope.user.firstName,
          $scope.user.lastName,
          $scope.user.address,
          $scope.user.unitNum,
          $scope.user.city,
          $scope.user.state,
          $scope.user.zipcode
        )
        .then(function() {
          AuthService.login($scope.user.email, $scope.user.password)
          .then(function() {
            Order.create({ date: $scope.dt }).$promise.then(function(response) { $state.go('current-order'); });
          });
        });
      };

      //
      // Date Picker Functions
      //
      $scope.today = function() {
        $scope.dt = new Date();
      };
      $scope.today();

      $scope.clear = function() {
        $scope.dt = null;
      };

      $scope.inlineOptions = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true
      };

      $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
      };

      $scope.toggleMin = function() {
        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
      };

      $scope.toggleMin();

      function disabled(data) {
        var date = data.date,
          mode = data.mode;
        return mode === 'day' && (date < Date.now());
      }

      $scope.popupCal = {
        opened: false
      };

      $scope.openCal = function() {
        $scope.popupCal.opened = true;
      };

      $scope.setDate = function(year, month, day) {
        $scope.dt = new Date(year, month, day);
      };

      $scope.format = 'MM/dd/yyyy';
      $scope.altInputFormats = ['M!/d!/yyyy'];



      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      var afterTomorrow = new Date();
      afterTomorrow.setDate(tomorrow.getDate() + 1);

      $scope.events = [
        {
          date: tomorrow,
          status: 'full'
        },
        {
          date: afterTomorrow,
          status: 'partially'
        }
      ];

      function getDayClass(data) {
        var date = data.date,
          mode = data.mode;
        if (mode === 'day') {
          var dayToCheck = new Date(date).setHours(0,0,0,0);

          for (var i = 0; i < $scope.events.length; i++) {
            var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

            if (dayToCheck === currentDay) {
              return $scope.events[i].status;
            }
          }
        }

        return '';
      }
  }])

  .controller('CurrentOrderController', ['$scope', 'AuthService', 'Order', '$state', 'NgMap',
    function($scope, AuthService, Order, $state, NgMap) {
      $scope.customer = AuthService.getCurrentCustomer();
      $scope.order = {};
      $scope.mapInfo = {};

      $scope.markerPoints = {};
      $scope.markerPoints.arbitrary = [getRandomFromRange(-180, 180, 5), getRandomFromRange(-180, 180, 5)];

      var bounds = new google.maps.LatLngBounds();
      var geocoder = new google.maps.Geocoder();

      $scope.$watch('customer', function (newval, oldval) {
        if (newval) {
          newval.$promise.then(function() {
            var customerCombinedAddress = "1492 Sherwood Way, Eagan MN 55122" ;
            geocoder.geocode( { "address": customerCombinedAddress}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
                    var location = results[0].geometry.location;
                    $scope.markerPoints.customer = location;
                }
            });

            Order.find(
              { 
                filter: { 
                  where: { 
                    customerId: $scope.customer.id 
                  } 
                } 
              },
              function(list) { 
                  $scope.order = list[list.length - 1];
              },
              function(errorResponse) { 
                /* error */
              }
            );
          });
        }
      });

      function getRandomFromRange(from, to, decimals) {
        return (Math.random() * (to - from) + from).toFixed(decimals) * 1;
      }

  }]);
