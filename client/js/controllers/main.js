// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-getting-started-intermediate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .controller('AuthLoginController', ['$scope', 'AuthService', '$rootScope', '$state',
    function($scope, AuthService, $rootScope, $state) {
      $scope.user = {
        email: '',
        password: '',
      };
      
      $scope.login = function() {
        AuthService.login($scope.user.email, $scope.user.password)
        .then(function() {
          if ($rootScope.loginSuccess == true) {
            $scope.loginError = false;
            $state.go('current-order');
          } else {
            $scope.loginError = true;
          }
        });
      };
    }])


  .controller('RegisterController', ['$scope', 'AuthService', 'Order', 'Business', '$state',
    function($scope, AuthService, Order, Business, $state) {
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
      $scope.business = { name: '' };

      $scope.states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE',
                        'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 
                        'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 
                        'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 
                        'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 
                        'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];

      $scope.errorMessages = {};

      $scope.register = function() {

        if ($scope.user.password != $scope.user.confirmPassword) {
          $scope.errorMessages.password = "Passwords Do Not Match";
          $scope.passwordError = true;
          return;
        } else if ($scope.user.password.length < 8) {
          $scope.errorMessages.password = "Password is < 8 Characters";
          $scope.passwordError = true;
          return;
        } else {
          $scope.errorMessages.password = "";
          $scope.passwordError = false;
        }

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
            Business.create(
              { 
                name: $scope.business.name
              })
              .$promise.then(function(response) 
              { 
                Order.create({
                  date: $scope.dt,
                  businessId: response.id
                })
                .$promise.then(function(response)
                {
                  $state.go('current-order'); 
                })
              });
          });
        });
      };

      $scope.stateDropboxItemSelected = function stateDropboxItemSelected(state) {
        $scope.user.state = state;
      }

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

  .controller('CurrentOrderController', ['$scope', 'AuthService', 'Order', 'Business', '$state', 'NgMap',
    function($scope, AuthService, Order, Business, $state, NgMap) {
      $scope.customer = AuthService.getCurrentCustomer();
      $scope.customer.isAuthenticated = AuthService.isAuthenticated();

      if ($scope.customer.isAuthenticated == false) {
        $state.go('login');
      }

      $scope.order = {};

      $scope.markerPoints = {};
      $scope.markerPoints.arbitrary = [getRandomFromRange(-180, 180, 3), getRandomFromRange(-180, 180, 3)];
      $scope.markerPoints.arbitrary.lat = $scope.markerPoints.arbitrary[0];
      $scope.markerPoints.arbitrary.lng = $scope.markerPoints.arbitrary[1];

      $scope.$watch('customer', function (newval, oldval) {
        if (newval) {
          newval.$promise.then(function() {
            Order.find(
              { 
                filter: { 
                  where: { 
                    customerId: $scope.customer.id 
                  } 
                } 
              },
              function(list) {
                  // Take the most recent order
                  $scope.order = list[list.length - 1];
              },
              function(errorResponse) { 
                console.log(errorResponse);
              }
            );

            Business.find(
              {
                filter: {
                  where: {
                    id: $scope.order.businessId
                  }
                }
              },
              function(list) {
                // This should only be one business anyways
                $scope.business = list[list.length - 1];
              }
            );
          });
        }
      });

      function getRandomFromRange(from, to, decimals) {
        return (Math.random() * (to - from) + from).toFixed(decimals) * 1;
      }

  }]);
