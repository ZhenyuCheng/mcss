var _ = require('./util');
var tree = require('../node');

Function.prototype.op_accept = function(list){
    var test = typeof list === 'function' ? list : _.makePredicate(list);
    var fn = this;
    return function(left, right){
        // means invalid 
        if( !test(tree.inspect(left)) ||
            !test(tree.inspect(right))){
            console.log(left, right, tree.inspect(left))
            throw Error('invalid actors to operation' + right.lineno)
        } 
        return fn.apply(this,arguments) 
    }
}
var $ = module.exports = {
    '+': function(left, right){
        var value = left.value + right.value;
        var unit = left.unit || right.unit;
        if(left.type === 'DIMENSION' && right.type === 'DIMENSION'){

            if(left.unit && right.unit && left.unit !== right.unit) _.warn('unmatched unit, forced 2rd unit equal with the 1st one')
            return {type: left.type, value: value, unit: unit}
        }else{

            return {type: left.type, value: tree.toStr(left) + tree.toStr(right)}
        }
    }.op_accept(['text', 'dimension', 'string']),

    '-': function(left, right){
        var value = left.value - right.value;
        var unit = left.unit || right.unit;
        if(left.unit && right.unit && left.unit !== right.unit) _.warn('unmatched unit, forced 2rd unit equal with the 1st one')
        return {type: left.type, value: value, unit: unit}
    }.op_accept(['dimension']),

    '*': function(left, right){
        var value = left.value * right.value;
        var unit = left.unit || right.unit;
        if(left.unit && right.unit && left.unit !== right.unit) _.warn('unmatched unit, forced 2rd unit equal with the 1st one')
        return {type: left.type, value: value, unit: unit}
    }.op_accept(['dimension']),

    '/': function(left, right){
        if(right.value === 0) throw 'Divid by zero' + right.lineno;
        
        var value = left.value / right.value;
        var unit = left.unit || right.unit;

        if(left.unit && right.unit && left.unit !== right.unit) _.warn('unmatched unit, forced 2rd unit equal with the 1st one')

        return {type: left.type, value: value, unit: unit};
    }.op_accept(['dimension']),

    '%': function(left, right){
        if(right.value === 0) throw 'Divid by zero' + right.lineno;

        var value = left.value % right.value;
        var unit = left.unit || right.unit;

        if(left.unit && right.unit && left.unit !== right.unit) _.warn('unmatched unit, forced 2rd unit equal with the 1st one')

        return {type: left.type, value: value, unit: unit};
    }.op_accept(['dimension']),

    'relation': function(left, right, op){
        var bool = {type: 'BOOLEAN'}
        if(left.type !== right.type){
            bool.value = op === '!=';
        }else{
            if(left.value > right.value){
                bool.value = op === '>' || op === '>=' || op === '!=';
            }
            if(left.value < right.value){
                bool.value = op === '<' || op === '<=' || op === '!=';
            }
            if(left.value == right.value){
                bool.value = op === '==' || op === '>=' || op === '<=';
            }
        }
        return bool;
    }.op_accept(tree.isPrimary),

    '&&': function(left, right){
        if(tree.isPrimary(left)){
            var bool = tree.toBoolean(left)
            if(bool === false) return {
                type: 'BOOLEAN',
                value: false
            }
            if(bool === true) return right
        }
    },

    '||': function(left, right){
        if(tree.isPrimary(left)){
            var bool = tree.toBoolean(left)
            if(bool === true) return left;
            if(bool === false) return right;
        }
    }
}