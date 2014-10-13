(function( window ) {
    'use strict';

    var app = angular.module('app', []);

    app.filter('todolist', function() {
        return function(todos, mode) {
            if (mode === "all") {
                return todos;
            }
            var result = [];
            for (var i = 0; i < todos.length; i++) {
                var todo = todos[i];
                if ((mode === "active" && !todo.completed) || (mode === "completed" && todo.completed)) {
                    result.push(todo);
                }
            }
            return result;
        };
    });

    app.directive("focusonshow", function(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                setTimeout(function() {
                    element[0].focus();
                }, 0);
            }
        };
    });

    app.controller("AppCtrl", function ($scope, $rootScope, $location) {
        this.todos = angular.fromJson(localStorage.getItem("todos-mine")) || [];
        this.newTodo = "";
        this.allCompleted = false;

        $rootScope.$watch(angular.bind(this, function() {
            localStorage.setItem("todos-mine", angular.toJson(this.todos));
        }));

        this.addTodo = function(event) {
            if (event.keyCode === 13  && this.newTodo.length > 0) {
                this.todos.push({label: this.newTodo.trim(), completed: false, editing: false});
                this.newTodo = "";
            }
        };

        this.rmTodo = function(index) {
            this.todos.splice(index, 1);
        };

        this.editTodo = function(event, index) {
            this.stopEdit(null);
            this.previousValue = this.todos[index].label;
            this.todos[index].editing = true;
            event.target.focus();
        };

        this.stopEdit = function(event, index) {
            if (event == null || event.type == "keyup" && event.keyCode === 13 || event.type == "blur") {
                for (var i = this.todos.length; i > 0 ; i--) {
                    var idx = i - 1;
                    var todo = this.todos[idx];
                    if (todo.editing) {
                        todo.label = todo.label.trim();
                        todo.editing = false;
                    }
                    if (todo.label == "") {
                        this.todos.splice(idx, 1);
                    }
                }
            }
            else if (event.type == "keyup" && event.keyCode === 27) {
                //cancelling edit
                this.todos[index].label = this.previousValue;
                this.todos[index].editing = false;
            }
        };

        this.getActiveCount = function() {
            var count = 0;
            for (var i = 0; i < this.todos.length; i++) {
                if (!this.todos[i].completed) {
                    count++;
                }
            }
            return count;
        };

        this.toggleAll = function() {
            var activateAll = this.getActiveCount() !== 0;
            for (var i = 0; i < this.todos.length; i++) {
                this.todos[i].completed = activateAll;
            }
        };

        this.clearCompleted = function() {
            for (var i = this.todos.length; i > 0 ; i--) {
                var index = i - 1;
                if (this.todos[index].completed) {
                    this.todos.splice(index, 1);
                }
            }
        };

        this._setFilterFromPath = function(rawPath) {
            var path = rawPath.replace("/", "");
            var isValidPath = path === "active" || path === "completed";
            this.filterMode = isValidPath? path: "all";
        };

        $scope.$watch(angular.bind(this, function () {
            return this.getActiveCount();
        }), angular.bind(this, function (newVal, oldVal) {
            this.allCompleted = newVal === 0;
        }));

        $scope.$watch(function () {
            return $location.path();
        }, angular.bind(this, function (newPath) {
            this._setFilterFromPath(newPath);
        }));

    });

})( window );
