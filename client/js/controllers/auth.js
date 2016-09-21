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
  .controller('AuthLogoutController', ['$scope', 'AuthService', '$state',
    function($scope, AuthService, $state) {
      AuthService.logout()
      .then(function() {
        $state.go('all-reviews');
      });
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
            Order.create({ date: "05-04-2007" }).$promise.then(function(response) { $state.go('current-order'); });
          });
        });
      };

  }])

  .controller('CurrentOrderController', ['$scope', 'AuthService', 'Order', '$state',
      function($scope, AuthService, Order, $state) {
    $scope.user = {
      email: '',
      password: ''
    };

    console.log(AuthService.getCurrentUser());

    /*$scope.products = Order.find(
      { filter: { where: { customerId: $rootScope.currentUser.id } } },
      function(list) { console.log($rootScope ); },
      function(errorResponse) { /* error }
    );*/

  }]);
