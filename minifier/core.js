var fassert = global.fassert = function (value, message)
{
    if (value)
        return;
    throw Error(message);
}

var frunOnce = global.frunOnce = function (func)
{
    global.runCache = global.runCache || {};
    var hash = func.toString().slice(0, 100), result;
    if (!global.runCache.hasOwnProperty(hash))
        result = func();
    else
        result = global.runCache[hash];
    return global.runCache[hash] = result;
}

var fnamespace = global.fnamespace = function fnamespace(name, body)
{
    name = ((global.currentNamespace || '') + name).split('.');
    var namespace = global, parsedPath = '', currentPath = '';
    while (name.length > 1)
        fassert(namespace = namespace[currentPath = name.shift()], 'Unknown namespace ' + (parsedPath += (parsedPath ? '.' : '') + currentPath));
    
    var result = namespace[name[0]];
    if (!result)
        result = namespace[name[0]] = new (function Namespace()
        { })();
    
    if (body)
    {
        var cn = global.currentNamespace || '';
        global.currentNamespace = parsedPath + (parsedPath ? '.' : '') + name[0] + '.';
        body();
        global.currentNamespace = cn;
    }
    
    return result;
};

var fclass = global.fclass = function fclass(name, base, body)
{
    name = ((global.currentNamespace || '') + name).split('.');
    var namespace = global, parsedPath = '', currentPath = '';
    while (name.length > 1)
        fassert(namespace = namespace[currentPath = name.shift()], 'Unknown namespace ' + (parsedPath += (parsedPath ? '.' : '') + currentPath));
    fassert(!namespace[name[0]], 'Class ' + name[0] + ' already defined.');
    
    var result = namespace[name[0]] = (function ()
    { this.constructor.apply(this, arguments); });
    
    var f = new Function();
    f.prototype = base.prototype;
    result.prototype = new f();
    result.prototype.class = result;
    result.base = base.prototype;
    result.__proto__ = base;
    
    if (body)
    {
        global.constructor = null;
        global.fpublic = result.prototype;
        global.fprivate = result.prototype;//TODO: make real privates
        global.fstatic = result;
        body();
        if (global.constructor)
            result.prototype.constructor = global.constructor;
        global.fpublic = global.fprivate = global.fstatic = global.props = null;
    }
    
    return result;
};

frunOnce(function ()
{
    fclass('List', Array, function ()
    {
        constructor = function (list)
        {
            if (list)
            {
                for (var i = 0; i < list.length; i++)
                    this[i] = list[i];
                this.length = list.length;
            }
        };
        fpublic.concat = function (list)
        {
            var result = [];
            for (var i = 0; i < this.length; i++)
                result.push(this[i]);
            for (var i = 0; i < list.length; i++)
                result.push(list[i]);
            return new this.class(result);
        };
    })
});