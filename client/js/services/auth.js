// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-getting-started-intermediate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .factory('AuthService', ['Customer', '$q', '$rootScope', function(Customer, $q,
      $rootScope) {
    function login(email, password) {
      return Customer
        .login({email: email, password: password})
        .$promise
        .then(function(response) {
          $rootScope.currentUser = {
            id: response.user.id,
            tokenId: response.id,
            email: email
          };
        });
    }

    function logout() {
      return Customer
       .logout()
       .$promise
       .then(function() {
         $rootScope.currentUser = null;
       });
    }

    function register(email, password, firstName, lastName, address, unitNum, city, state, zipcode) {
      return Customer
        .create({
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          address: address,
          unitNum: unitNum,
          city: city,
          state: state,
          zipcode: zipcode
        })
        .$promise
        .then(function(response) {
        });
    }

    function isAuthenticated() {
      return Customer.isAuthenticated();
    }

    function getCurrentCustomer() {
      return Customer.getCurrent();
    }

    return {
      login: login,
      logout: logout,
      register: register
    };
  }]);
