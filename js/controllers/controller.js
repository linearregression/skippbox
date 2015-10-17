/*
 Copyright 2015 Skippbox, Ltd

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

kuiApp.controller("kuiController", function ($scope, $location, $route) {
    $scope.headerSrc = "views/header.html";

    $scope.back = function () {
        window.history.back();
    };

    $scope.isActive = function (route) {
        return route === $location.path();
    }

    $scope.isActivePath = function (route) {
        return ($location.path()).indexOf(route) >= 0;
    }

    $scope.refresh = function() {
        $route.reload();
    }

});


kuiApp.factory('k8s', function ($resource) {
    /*
     Pods: $resource('http://127.0.0.1:8080/api/v1/namespaces/default/pods/:name', {}, {
     query: { method: 'GET' },
     del: { method: 'DELETE', params: {name: '@name'} }
     }
     ),
     */
    return {
        Services: $resource('http://127.0.0.1:8080/api/v1/namespaces/default/services/:name'),
        Pods: $resource('http://127.0.0.1:8080/api/v1/namespaces/default/pods/:name'),
        Replicationcontrollers: $resource('http://127.0.0.1:8080/api/v1/namespaces/default/replicationcontrollers/:name'),
        Namespaces: $resource('http://127.0.0.1:8080/api/v1/namespaces/:name'),
        Nodes: $resource('http://127.0.0.1:8080/api/v1/nodes/:name'),
        Secrets: $resource('http://127.0.0.1:8080/api/v1/namespaces/default/secrets/:name'),
        Resourcequotas: $resource('http://127.0.0.1:8080/api/v1/namespaces/default/resourcequotas/:name')
    };
});

// User websockets instead!
//kuiApp.factory('socket', function ($rootScope) {
//    var socket = io.connect('http://127.0.0.1:8080/api/v1/namespace/default/pods?watch=true');
//    return {
//        on: function (eventName, callback) {
//            socket.on(eventName, function (arguments) {
//                var args = arguments;
//                $rootScope.$apply(function () {
//                    callback.apply(socket, args);
//                });
//            });
//        }
//    };
//});

kuiApp.factory('config', function ($filter) {
    yaml = require('js-yaml');
    fs = require('fs');

    // Get document, or throw exception on error
    try {
        config = yaml.safeLoad(fs.readFileSync('/Users/sebastiengoasguen/.kube/config', 'utf8'));
        console.log(config);
    } catch (e) {
        console.log(e);
    }

    var contexts = [];
    var users = [];
    var clusters = [];

    angular.forEach(config.users, function (value, key) {
        var user = {};
        user.name = value.name;
        user.password = value.user.password;
        user.username = value.user.username;
        user.token = value.user.token;
        user.client_key = value.user['client-key'];
        user.client_certificate = value.user['client-certificate'];
        users.push(user);
    });

    angular.forEach(config.clusters, function (value, key) {
        var cluster = {};
        cluster.name = value.name;
        cluster.server = value.cluster.server;
        if (typeof value.cluster["certificate-authority"] != 'undefined') {
            cluster.certificate_authority = value.cluster["certificate-authority"];
        }
        if (typeof value.cluster["api-version"] != 'undefined') {
            cluster.api_version = value.cluster["api-version"];
        }
        //if (typeof value.cluster["insecure-skip-tls-verify"] != 'undefined') {
        cluster.insecure_skip_tls_verify = value.cluster["insecure-skip-tls-verify"];
        //}
        clusters.push(cluster);
    });

    angular.forEach(config.contexts, function (value, key) {
        var context = {};
        context.name = value.name;
        context.cluster = $filter('filter')(clusters, {'name': value.context.cluster})[0];
        context.user = $filter('filter')(users, {'name': value.context.user})[0];
        contexts.push(context);
    });

    return {
        Contexts: contexts,
        Users: users,
        Clusters: clusters
    };
});

kuiApp.controller("contextController", function ($scope, $location, config) {

    console.log(config)

    $scope.contexts = config.Contexts;
    $scope.clusters = config.Clusters;
    $scope.users = config.Users;

});